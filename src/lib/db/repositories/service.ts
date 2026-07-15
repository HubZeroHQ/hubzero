import { serviceSchema, type ServiceInput } from '@/lib/validation/service';
import type { Service } from '@/types/studio';
import { collections } from '../collections';
import { createRepository, parsePartialInput } from '../repository';

const base = createRepository<Service, ServiceInput>(collections.services);

export const serviceRepository = {
  findById: base.findById,
  list: base.list,
  remove: base.remove,
  create: (input: ServiceInput) => base.create(serviceSchema.parse(input)),
  update: (id: string, input: Partial<ServiceInput>) =>
    base.update(id, parsePartialInput(serviceSchema, input)),
};
