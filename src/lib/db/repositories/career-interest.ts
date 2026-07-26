import { careerInterestSchema, type CareerInterestInput } from '@/lib/validation/career-interest';
import type { CareerInterest } from '@/types/studio';
import { collections } from '../collections';
import { createRepository, parsePartialInput } from '../repository';

const base = createRepository<CareerInterest, CareerInterestInput>(collections.careerInterests);

export const careerInterestRepository = {
  findById: base.findById,
  list: base.list,
  remove: base.remove,
  create: (input: CareerInterestInput) => base.create(careerInterestSchema.parse(input)),
  update: (id: string, input: Partial<CareerInterestInput>) =>
    base.update(id, parsePartialInput(careerInterestSchema, input)),
};
