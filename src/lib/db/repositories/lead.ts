import { leadSchema, type LeadInput } from '@/lib/validation/lead';
import type { Lead } from '@/types/cms';
import { collections } from '../collections';
import { createRepository } from '../repository';

const base = createRepository<Lead, LeadInput>(collections.leads);

export const leadRepository = {
  findById: base.findById,
  list: base.list,
  remove: base.remove,
  create: (input: LeadInput) => base.create(leadSchema.parse(input)),
  update: (id: string, input: Partial<LeadInput>) =>
    base.update(id, leadSchema.partial().parse(input)),
};
