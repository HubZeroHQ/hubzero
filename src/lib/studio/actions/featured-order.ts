'use server';

import { revalidatePath } from 'next/cache';
import { requireCapability } from '@/lib/auth/permissions';
import { invalidatePublicFeaturedOrder } from '@/lib/public/cache';
import {
  FEATURED_COLLECTIONS,
  isFeaturedCollectionKey,
  type FeaturedCollectionKey,
} from '@/lib/studio/featured-collections';
import {
  FEATURED_ORDER_ERROR_MESSAGE,
  isFeatured,
  parseFeaturedOrderPayload,
  toOrderAssignments,
} from '@/lib/studio/featured-order';
import { eventEntityTypeFor, recordEditorialEvent } from '@/lib/events/record';
import type { EntryActionState } from '@/lib/studio/entry-actions';

/**
 * Persists a collection's editorial featured order (v3.1 Milestone 2).
 *
 * Gated on `publish`, not `editAnyEntry`: featuring decides what a visitor
 * sees first on the public site, which is the same class of authority as
 * publishing itself. A Member who can edit an entry still cannot promote it
 * onto the homepage.
 *
 * Takes the complete ordered list rather than a single move. The whole-set
 * write is what makes canonical numbering structural — see
 * `createFeaturedOrdering` — and it also makes the action naturally
 * idempotent, so a retried submission cannot compound into a different order
 * than the editor saw.
 */
export async function setFeaturedOrderAction(
  collectionKey: string,
  orderedIds: unknown,
): Promise<EntryActionState> {
  if (!isFeaturedCollectionKey(collectionKey)) {
    return { error: 'That collection does not support featured ordering.' };
  }

  try {
    await requireCapability('publish');
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Something went wrong. Try again.' };
  }

  const parsed = parseFeaturedOrderPayload(orderedIds);
  if (!parsed.ok) {
    return { error: FEATURED_ORDER_ERROR_MESSAGE[parsed.error] };
  }

  const collection = FEATURED_COLLECTIONS[collectionKey as FeaturedCollectionKey];

  // Captured before the write so the event can state what actually changed —
  // afterwards the previous positions are gone.
  const before = new Map(
    (await collection.listEntries()).map((entry) => [entry.id, entry.featuredOrder ?? null]),
  );

  try {
    await collection.setFeaturedOrder(parsed.orderedIds);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'The featured order could not be saved.',
    };
  }

  // One event per entry whose position actually moved — a reorder that leaves
  // an entry where it was is not news, and logging it would bury the changes.
  const entityType = eventEntityTypeFor(collection.publicType);
  if (entityType) {
    const after = new Map(
      toOrderAssignments(parsed.orderedIds).map((row) => [
        row.id,
        row.featuredOrder as number | null,
      ]),
    );
    for (const [id, from] of before) {
      const to = after.get(id) ?? null;
      if (from === to) continue;
      if (!isFeatured(from) && !isFeatured(to)) continue;
      await recordEditorialEvent({
        entityType,
        entityId: id,
        payload: { type: 'entry.featuredOrderChanged', from, to },
      });
    }
  }

  // Ordering is consumed by this collection's index and the homepage only.
  // Detail, relationship, discovery, sitemap, and feed data are unchanged.
  invalidatePublicFeaturedOrder(collection.publicType);
  revalidatePath(collection.featuredPath);
  revalidatePath(collection.listPath);

  return { ok: true };
}
