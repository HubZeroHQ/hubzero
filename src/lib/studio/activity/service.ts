import 'server-only';

import { describeEditorialEvent } from '@/lib/events/describe';
import { editorialEventRepository, type EditorialEventCursor } from '@/lib/events/repository';
import type { EditorialEventPayload, EventEntityType } from '@/lib/events/schema';
import { MATCH_TIER, matchTier } from '@/lib/search/ranking';
import { ensureSearchAdaptersRegistered } from '@/lib/search/register';
import { listSearchIndex } from '@/lib/search/registry';
import type { SearchContext, SearchResult } from '@/lib/search/types';
import { resolveActors } from '@/lib/studio/actors';
import { ACTIVITY_COLLECTIONS, type ActivityFilters, type ActivityPage } from './types';

/**
 * Loads one page of Studio-wide activity (v3.1 Milestone 9).
 *
 * ## The feed reads the log, and only the log
 *
 * There is no second source. Entity state is consulted for exactly one thing —
 * turning an entry id into a title and a link — and never to decide *what
 * happened*. An entry whose status is `published` today produces no "published"
 * row unless a transition was actually recorded.
 *
 * ## Query shape — three round trips, regardless of page size
 *
 * 1. one filtered, indexed, cursor-paginated query against the event log,
 * 2. one `$in` for every actor on the page,
 * 3. one snapshot of the search index to resolve entries.
 *
 * None of them is per-row. The naive versions — a user lookup per event and a
 * collection lookup per event — are both N+1s on a feed that is by definition
 * a long list of rows referencing many entries and many people.
 */
export async function loadActivity(
  filters: ActivityFilters,
  ctx: SearchContext,
  options: { limit?: number; cursor?: EditorialEventCursor | null } = {},
): Promise<ActivityPage> {
  // The index doubles as the entry resolver and as the search implementation,
  // so it is fetched once and used for both rather than twice for each.
  ensureSearchAdaptersRegistered();
  const index = await listSearchIndex(ctx).catch(() => [] as SearchResult[]);

  const query = filters.q?.trim();
  const { events, nextCursor } = await editorialEventRepository.list(
    {
      ...(filters.entityTypes?.length ? { entityTypes: filters.entityTypes } : {}),
      ...(filters.types?.length ? { types: filters.types } : {}),
      ...(filters.actorUserId ? { actorUserId: filters.actorUserId } : {}),
      ...(filters.from ? { from: filters.from } : {}),
      ...(filters.to ? { to: filters.to } : {}),
      // Search is applied by resolving matching *entries* and filtering the
      // query by their ids — the events themselves hold no searchable text,
      // and indexing prose into the log would be a second index for the same
      // job the search adapters already do.
      ...(query ? { entityIds: matchingEntryIds(query, index) } : {}),
    },
    options,
  );

  const actors = await resolveActors(
    events.map((event) => event.actorUserId?.toString()).filter((id): id is string => Boolean(id)),
  );

  const byEntity = new Map(index.map((result) => [`${result.type}:${result.id}`, result]));

  const items = events.map((event) => {
    const described = describeEditorialEvent(event.payload as EditorialEventPayload);
    const entityType = event.entityType as EventEntityType;
    const collection = ACTIVITY_COLLECTIONS[entityType];
    const entryId = event.entityId.toString();
    const resolved = collection ? byEntity.get(`${collection.searchType}:${entryId}`) : undefined;
    const actor = event.actorUserId ? actors.get(event.actorUserId.toString()) : undefined;
    const collectionLabel = collection?.label ?? entityType;

    return {
      id: event._id.toString(),
      at: event.createdAt,
      ...(actor ? { actor } : {}),
      eventType: described.type,
      historyType: described.historyType,
      action: described.action,
      ...(described.detail ? { detail: described.detail } : {}),
      entityType,
      entry: resolved
        ? {
            exists: true as const,
            id: entryId,
            title: resolved.title,
            href: resolved.href,
            collectionLabel,
          }
        : { exists: false as const, id: entryId, collectionLabel },
    };
  });

  return { items, nextCursor };
}

/**
 * Entry ids whose title, slug or reference ID match the query, scored by the
 * same `matchTier` the search screen and command palette use. Reusing it is
 * what keeps "search by reference ID" behaving identically here — including
 * the punctuation-insensitive `HZ-BP-701` / `bp701` handling — without a
 * second matcher to keep in step.
 */
function matchingEntryIds(query: string, index: readonly SearchResult[]): string[] {
  return index
    .filter((result) => matchTier(query, result) !== MATCH_TIER.none)
    .map((result) => result.id);
}
