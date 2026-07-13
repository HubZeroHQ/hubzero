import { REFERENCE_ID_PREFIXES } from '@/config/reference-ids';
import { blueprintSchema, type BlueprintInput } from '@/lib/validation/blueprint';
import type { Blueprint } from '@/types/cms';
import { collections } from '../collections';
import { createRepository } from '../repository';

const base = createRepository<Blueprint, BlueprintInput>(collections.blueprints, {
  referenceIdPrefix: REFERENCE_ID_PREFIXES.blueprints,
});

export const blueprintRepository = {
  findById: base.findById,
  list: base.list,
  remove: base.remove,
  findBySlug: async (slug: string) => (await collections.blueprints()).findOne({ slug }),
  create: (input: BlueprintInput) => {
    const parsed = blueprintSchema.parse(input);
    // Validated against the Blueprint-X-Y pattern above; asserting the
    // branded template-literal type here is the single conversion point.
    return base.create({ ...parsed, name: parsed.name as Blueprint['name'] });
  },
  update: (id: string, input: Partial<BlueprintInput>) => {
    const parsed = blueprintSchema.partial().parse(input);
    return base.update(id, {
      ...parsed,
      ...(parsed.name ? { name: parsed.name as Blueprint['name'] } : {}),
    });
  },
};
