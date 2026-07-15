import { taxonomyEntrySchema, type TaxonomyEntryInput } from '@/lib/validation/taxonomy';
import type { TaxonomyEntry, TaxonomyKind } from '@/types/studio';
import { collections } from '../collections';
import { createRepository, parsePartialInput } from '../repository';

const base = createRepository<TaxonomyEntry, TaxonomyEntryInput>(collections.taxonomy);

export const taxonomyRepository = {
  findById: base.findById,
  list: base.list,
  remove: base.remove,
  findBySlug: async (slug: string) => (await collections.taxonomy()).findOne({ slug }),
  findByKind: async (kind: TaxonomyKind) => (await collections.taxonomy()).find({ kind }).toArray(),
  create: (input: TaxonomyEntryInput) => base.create(taxonomyEntrySchema.parse(input)),
  update: (id: string, input: Partial<TaxonomyEntryInput>) =>
    base.update(id, parsePartialInput(taxonomyEntrySchema, input)),
};
