import { REFERENCE_ID_PREFIXES } from '@/config/reference-ids';
import { labSchema, type LabInput } from '@/lib/validation/lab';
import type { Lab } from '@/types/cms';
import { collections } from '../collections';
import { createRepository } from '../repository';

const base = createRepository<Lab, LabInput>(collections.labs, {
  referenceIdPrefix: REFERENCE_ID_PREFIXES.labs,
});

export const labRepository = {
  findById: base.findById,
  list: base.list,
  remove: base.remove,
  findBySlug: async (slug: string) => (await collections.labs()).findOne({ slug }),
  create: (input: LabInput, createdByUserId: string) =>
    base.create(labSchema.parse(input), { createdByUserId }),
  update: (id: string, input: Partial<LabInput>) =>
    base.update(id, labSchema.partial().parse(input)),
};
