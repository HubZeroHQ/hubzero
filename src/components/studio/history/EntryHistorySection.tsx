import type { OwnerType } from '@/lib/documents/schema';
import { loadEntryHistory } from '@/lib/studio/history/service';
import { EntryHistory } from './EntryHistory';

/**
 * Server boundary for the timeline: one load, then pure rendering. Split from
 * `EntryHistory` so the rendering half stays a plain function of a
 * `HistoryEvent[]` and can be exercised without a database.
 *
 * Every editor renders this same component — the timeline has no
 * collection-specific variant, only a different `ownerType`.
 */
export async function EntryHistorySection({
  ownerType,
  entryId,
  entry,
}: {
  ownerType: OwnerType;
  entryId: string;
  entry: { createdAt: Date; updatedAt: Date; createdByUserId?: { toString(): string } };
}) {
  const events = await loadEntryHistory({ ownerType, entryId, entry });
  return <EntryHistory events={events} />;
}
