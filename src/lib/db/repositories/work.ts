import { REFERENCE_ID_PREFIXES } from '@/config/reference-ids';
import { workSchema, type WorkInput } from '@/lib/validation/work';
import type { Work } from '@/types/studio';
import { collections } from '../collections';
import { createFeaturedOrdering } from '../featured-ordering';
import { createRepository, parsePartialInput } from '../repository';

const base = createRepository<Work, WorkInput>(collections.work, {
  referenceIdPrefix: REFERENCE_ID_PREFIXES.work,
});

const featured = createFeaturedOrdering<Work>(collections.work);

export const workRepository = {
  // Editorial ordering (v3.1 Milestone 2) — one shared implementation, not a per-collection copy.
  listFeatured: featured.listFeatured,
  setFeaturedOrder: featured.setFeaturedOrder,
  findById: base.findById,
  list: base.list,
  remove: base.remove,
  findBySlug: async (slug: string) => (await collections.work()).findOne({ slug }),
  create: (input: WorkInput, createdByUserId: string) =>
    base.create(workSchema.parse(input), { createdByUserId }),
  update: (id: string, input: Partial<WorkInput>) =>
    base.update(id, parsePartialInput(workSchema, input)),
};
