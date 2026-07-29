import { REFERENCE_ID_PREFIXES } from '@/config/reference-ids';
import { careerSchema, type CareerInput } from '@/lib/validation/career';
import type { Career } from '@/types/studio';
import { collections } from '../collections';
import { createRepository, parsePartialInput } from '../repository';

const base = createRepository<Career, CareerInput>(collections.careers, {
  referenceIdPrefix: REFERENCE_ID_PREFIXES.careers,
});

export const careerRepository = {
  findById: base.findById,
  list: base.list,
  remove: base.remove,
  findBySlug: async (slug: string) => (await collections.careers()).findOne({ slug }),
  create: (input: CareerInput, createdByUserId: string) =>
    base.create(careerSchema.parse(input), { createdByUserId }),
  update: (id: string, input: Partial<CareerInput>) =>
    base.update(id, parsePartialInput(careerSchema, input)),
};
