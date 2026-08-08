import { ObjectId } from 'mongodb';
import {
  blueprintRepository,
  buildRepository,
  engineeringProfileRepository,
  labRepository,
  noteRepository,
  workRepository,
} from '@/lib/db/repositories';
import { documentRepository } from '@/lib/db/repositories/document';
import { idsEqual, toIdString, type IdLike } from '@/lib/ids/compare';
import type { PublicCacheTarget } from '@/lib/public/cache';
import { publicCacheTargetsForOwner } from '@/lib/public/cache-targets';
import { isPublicDocumentRole } from '@/lib/public/visibility';

/**
 * Every metadata field that can reference a Taxonomy entry. Document
 * `technologyStack` blocks are handled separately through the shared
 * Document repository below. `Work.categoryTagIds` also points at Taxonomy
 * despite the field name predating the shared collection. Service, Lead,
 * Team, and User carry no direct taxonomy reference field.
 */
const TAXONOMY_REFERENCE_SOURCES = [
  {
    name: 'Work',
    publicType: 'work',
    repository: workRepository,
    fields: ['technologyIds', 'categoryTagIds'],
  },
  { name: 'Builds', publicType: 'build', repository: buildRepository, fields: ['technologyIds'] },
  {
    name: 'Blueprints',
    publicType: 'blueprint',
    repository: blueprintRepository,
    fields: ['technologyIds'],
  },
  { name: 'Labs', publicType: 'lab', repository: labRepository, fields: ['technologyIds'] },
  { name: 'Notes', publicType: 'note', repository: noteRepository, fields: ['technologyIds'] },
  {
    name: 'Engineering Profiles',
    publicType: 'engineeringProfile',
    repository: engineeringProfileRepository,
    fields: ['technologyIds'],
  },
] as const;

interface TaxonomyReferencingRecord {
  _id: ObjectId;
  slug?: string;
  status?: string;
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
  const [recordUsage, documents] = await Promise.all([
    Promise.all(
      TAXONOMY_REFERENCE_SOURCES.map(async ({ name, repository, fields }) => {
        const entries = (await repository.list()) as unknown as TaxonomyReferencingRecord[];
        const count = entries.filter((entry) =>
          fields.some((field) => referenceFields(entry, field).some((id) => idsEqual(id, entryId))),
        ).length;
        return { collection: name, count };
      }),
    ),
    documentRepository.findUsingTaxonomyEntry(entryId),
  ]);
  const documentOwners = new Set(
    documents.map((document) => `${document.ownerType}:${document.ownerId.toString()}`),
  );
  const results = [...recordUsage, { collection: 'Document blocks', count: documentOwners.size }];
  return results.filter((result) => result.count > 0);
}

export async function totalTaxonomyUsage(entryId: string): Promise<number> {
  const usage = await taxonomyUsage(entryId);
  return usage.reduce((sum, entry) => sum + entry.count, 0);
}

/**
 * Published records whose public projection depends on this term. Mutation
 * actions snapshot these before changing/merging the term, then invalidate
 * only those public entities instead of flushing every collection.
 */
export async function taxonomyPublicCacheTargets(entryId: string): Promise<PublicCacheTarget[]> {
  const [recordGroups, documents] = await Promise.all([
    Promise.all(
      TAXONOMY_REFERENCE_SOURCES.map(async ({ publicType, repository, fields }) => {
        const entries = (await repository.list()) as unknown as TaxonomyReferencingRecord[];
        return entries
          .filter(
            (entry) =>
              entry.status === 'published' &&
              fields.some((field) =>
                referenceFields(entry, field).some((id) => idsEqual(id, entryId)),
              ),
          )
          .map((entry): PublicCacheTarget => ({
            type: publicType,
            ...(entry.slug ? { slug: entry.slug } : {}),
          }));
      }),
    ),
    documentRepository.findUsingTaxonomyEntry(entryId),
  ]);
  const documentTargets = await Promise.all(
    documents
      .filter((document) => isPublicDocumentRole(document.ownerType, document.role))
      .map((document) =>
        publicCacheTargetsForOwner(document.ownerType, document.ownerId.toString()),
      ),
  );

  const unique = new Map(
    [...recordGroups.flat(), ...documentTargets.flat()].map((target) => [
      `${target.type}:${target.slug ?? ''}`,
      target,
    ]),
  );
  return [...unique.values()];
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
  await Promise.all([
    documentRepository.replaceTaxonomyReference(sourceId, targetId),
    ...TAXONOMY_REFERENCE_SOURCES.map(async ({ repository, fields }) => {
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
  ]);
}
