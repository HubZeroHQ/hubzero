import { ObjectId } from 'mongodb';
import type { Collection, Filter } from 'mongodb';
import { selectFeatured, toOrderAssignments } from '@/lib/studio/featured-order';
import type { WithId, WithTimestamps } from '@/types/studio';

/**
 * The persistence half of the editorial ordering system (v3.1 Milestone 2),
 * written once and mixed into every collection that opts in — so "featured"
 * means the same thing, and is written the same way, for Work as for Notes.
 *
 * The write is deliberately *whole-set*: `setFeaturedOrder` receives the
 * complete ordered list and rewrites the entire collection's featured state in
 * one bulk operation, clearing every record not in the list. That is what
 * makes canonical numbering (`1..N`, dense, unique) an invariant of storage
 * rather than a property the caller has to maintain — there is no incremental
 * path that could leave a gap or a duplicate behind, because positions are
 * never edited in place.
 */
export function createFeaturedOrdering<TRecord extends WithId & WithTimestamps>(
  getCollection: () => Promise<Collection<TRecord>>,
) {
  return {
    /**
     * Featured entries in editorial order. Ordering is applied by
     * `selectFeatured` rather than by a Mongo `sort`, so the tolerance rules
     * for non-canonical stored state live in one place and apply identically
     * to every consumer.
     */
    async listFeatured(): Promise<TRecord[]> {
      const collection = await getCollection();
      const rows = (await collection
        .find({ featuredOrder: { $ne: null } } as unknown as Filter<TRecord>)
        .toArray()) as TRecord[];
      return selectFeatured(
        rows.map((row) => ({
          id: row._id.toString(),
          featuredOrder: (row as { featuredOrder?: number | null }).featuredOrder ?? null,
          row,
        })),
      ).map((entry) => entry.row);
    },

    /**
     * Replaces the collection's entire featured set with `orderedIds`.
     *
     * Two writes, in this order: clear everything currently featured, then
     * assign `1..N` to the new list. Clearing first is what guarantees a
     * removed entry cannot keep a stale position, and assigning from array
     * index is what guarantees the result is canonical. Ids that no longer
     * exist are simply not matched — a concurrent delete degrades to "that
     * entry isn't featured", never to a hole in the numbering.
     *
     * Returns the number of entries that actually received a position, so a
     * caller can tell a full write from a partial one.
     */
    async setFeaturedOrder(orderedIds: readonly string[]): Promise<number> {
      const collection = await getCollection();
      const now = new Date();

      const assignments = toOrderAssignments(orderedIds).flatMap((assignment) => {
        if (!ObjectId.isValid(assignment.id)) return [];
        return [{ _id: new ObjectId(assignment.id), featuredOrder: assignment.featuredOrder }];
      });

      const keepIds = assignments.map((assignment) => assignment._id);

      await collection.updateMany(
        { featuredOrder: { $ne: null }, _id: { $nin: keepIds } } as unknown as Filter<TRecord>,
        { $set: { featuredOrder: null, updatedAt: now } } as never,
      );

      if (assignments.length === 0) {
        return 0;
      }

      const result = await collection.bulkWrite(
        assignments.map((assignment) => ({
          updateOne: {
            filter: { _id: assignment._id } as unknown as Filter<TRecord>,
            update: { $set: { featuredOrder: assignment.featuredOrder, updatedAt: now } },
          },
        })) as never,
      );

      return result.matchedCount;
    },
  };
}
