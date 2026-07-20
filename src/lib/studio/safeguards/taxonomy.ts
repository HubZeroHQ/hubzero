import { ObjectId } from 'mongodb';
import {
  blueprintRepository,
  buildRepository,
  engineeringProfileRepository,
  labRepository,
  noteRepository,
  workRepository,
} from '@/lib/db/repositories';
import { idsEqual, toIdString, type IdLike } from '@/lib/ids/compare';

/**
 * Every collection + field that can reference a Taxonomy entry (Taxonomy
 * completion sprint, Part 5). `Work.categoryTagIds` also points at
 * Taxonomy despite the field name predating the shared collection — see
 * `types/studio.ts`'s `Work` interface. Service/Lead/Team/User carry no
 * taxonomy reference field, so they're intentionally absent here.
 */
const TAXONOMY_REFERENCE_SOURCES = [
  { name: 'Work', repository: workRepository, fields: ['technologyIds', 'categoryTagIds'] },
  { name: 'Builds', repository: buildRepository, fields: ['technologyIds'] },
  { name: 'Blueprints', repository: blueprintRepository, fields: ['technologyIds'] },
  { name: 'Labs', repository: labRepository, fields: ['technologyIds'] },
  { name: 'Notes', repository: noteRepository, fields: ['technologyIds'] },
  {
    name: 'Engineering Profiles',
    repository: engineeringProfileRepository,
    fields: ['technologyIds'],
  },
] as const;

interface TaxonomyReferencingRecord {
  _id: ObjectId;
  [field: string]: unknown;
}

/**
 * A relation field's runtime shape isn't guaranteed to be `ObjectId[]`
 * despite what `types/studio.ts` declares — see `lib/ids/compare.ts`'s
 * `IdLike` comment. Reading it as `IdLike[]` (not `ObjectId[]`) is what
 * keeps this file from assuming one runtime id representation.
 */
function referenceFields(record: TaxonomyReferencingRecord, field: string): IdLike[] {
  return (record[field] as IdLike[] | undefined) ?? [];
}

export interface TaxonomyUsageEntry {
  collection: string;
  count: number;
}

/** How many entries, across every referencing collection, currently point at a given Taxonomy entry — the delete/merge guard's basis. */
export async function taxonomyUsage(entryId: string): Promise<TaxonomyUsageEntry[]> {
  const results = await Promise.all(
    TAXONOMY_REFERENCE_SOURCES.map(async ({ name, repository, fields }) => {
      const entries = (await repository.list()) as unknown as TaxonomyReferencingRecord[];
      const count = entries.filter((entry) =>
        fields.some((field) => referenceFields(entry, field).some((id) => idsEqual(id, entryId))),
      ).length;
      return { collection: name, count };
    }),
  );
  return results.filter((result) => result.count > 0);
}

export async function totalTaxonomyUsage(entryId: string): Promise<number> {
  const usage = await taxonomyUsage(entryId);
  return usage.reduce((sum, entry) => sum + entry.count, 0);
}

/**
 * Reassigns every reference to `sourceId` onto `targetId` across every
 * collection in `TAXONOMY_REFERENCE_SOURCES`, deduplicating each entry's
 * array in the process. Leaves `sourceId` itself for the caller (the merge
 * action) to delete once this resolves.
 */
export async function reassignTaxonomyReferences(
  sourceId: string,
  targetId: string,
): Promise<void> {
  await Promise.all(
    TAXONOMY_REFERENCE_SOURCES.map(async ({ repository, fields }) => {
      const entries = (await repository.list()) as unknown as TaxonomyReferencingRecord[];

      for (const entry of entries) {
        const patch: Record<string, string[]> = {};

        for (const field of fields) {
          const current = referenceFields(entry, field);
          if (!current.some((id) => idsEqual(id, sourceId))) {
            continue;
          }
          const next = current.map((id) => (idsEqual(id, sourceId) ? targetId : toIdString(id)));
          patch[field] = Array.from(new Set(next));
        }

        if (Object.keys(patch).length > 0) {
          await repository.update(entry._id.toString(), patch as never);
        }
      }
    }),
  );
}
