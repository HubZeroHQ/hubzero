import { REFERENCE_ID_PREFIXES } from '@/config/reference-ids';
import { buildSchema, type BuildInput } from '@/lib/validation/build';
import type { Build } from '@/types/studio';
import { collections } from '../collections';
import { createRepository, parsePartialInput } from '../repository';

const base = createRepository<Build, BuildInput>(collections.builds, {
  referenceIdPrefix: REFERENCE_ID_PREFIXES.builds,
});

export const buildRepository = {
  findById: base.findById,
  list: base.list,
  remove: base.remove,
  findBySlug: async (slug: string) => (await collections.builds()).findOne({ slug }),
  create: (input: BuildInput, createdByUserId: string) =>
    base.create(buildSchema.parse(input), { createdByUserId }),
  update: (id: string, input: Partial<BuildInput>) =>
    base.update(id, parsePartialInput(buildSchema, input)),
};
