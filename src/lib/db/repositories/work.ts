import { REFERENCE_ID_PREFIXES } from '@/config/reference-ids';
import { workSchema, type WorkInput } from '@/lib/validation/work';
import type { Work } from '@/types/cms';
import { collections } from '../collections';
import { createRepository } from '../repository';

const base = createRepository<Work, WorkInput>(collections.work, {
  referenceIdPrefix: REFERENCE_ID_PREFIXES.work,
});

export const workRepository = {
  findById: base.findById,
  list: base.list,
  remove: base.remove,
  findBySlug: async (slug: string) => (await collections.work()).findOne({ slug }),
  create: (input: WorkInput) => base.create(workSchema.parse(input)),
  update: (id: string, input: Partial<WorkInput>) =>
    base.update(id, workSchema.partial().parse(input)),
};
