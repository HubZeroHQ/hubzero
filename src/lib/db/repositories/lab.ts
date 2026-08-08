import { REFERENCE_ID_PREFIXES } from '@/config/reference-ids';
import { labSchema, type LabInput } from '@/lib/validation/lab';
import { ObjectId } from 'mongodb';
import type { Filter } from 'mongodb';
import type { Lab } from '@/types/studio';
import { collections } from '../collections';
import { createFeaturedOrdering } from '../featured-ordering';
import { createRepository, parsePartialInput } from '../repository';

const base = createRepository<Lab, LabInput>(collections.labs, {
  referenceIdPrefix: REFERENCE_ID_PREFIXES.labs,
});

const featured = createFeaturedOrdering<Lab>(collections.labs);

export const labRepository = {
  // Editorial ordering (v3.1 Milestone 2) — one shared implementation, not a per-collection copy.
  listFeatured: featured.listFeatured,
  setFeaturedOrder: featured.setFeaturedOrder,
  findById: base.findById,
  list: base.list,
  remove: base.remove,
  findBySlug: async (slug: string) => (await collections.labs()).findOne({ slug }),
  create: (input: LabInput, createdByUserId: string) =>
    base.create(labSchema.parse(input), { createdByUserId }),
  update: (id: string, input: Partial<LabInput>) =>
    base.update(id, parsePartialInput(labSchema, input)),
  /**
   * Atomically attaches the first graduated Build. Concurrent graduation
   * requests cannot both win after reading the same pre-graduation Lab.
   */
  claimGraduatedBuild: async (id: string, buildId: string): Promise<boolean> => {
    const collection = await collections.labs();
    const result = await collection.updateOne(
      {
        _id: new ObjectId(id),
        $or: [{ graduatedToBuildId: { $exists: false } }, { graduatedToBuildId: null }],
      } as unknown as Filter<Lab>,
      {
        $set: {
          graduatedToBuildId: new ObjectId(buildId),
          updatedAt: new Date(),
        },
      },
    );
    return result.modifiedCount === 1;
  },
};
