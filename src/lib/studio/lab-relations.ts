import { blueprintRepository } from '@/lib/db/repositories/blueprint';
import { buildRepository } from '@/lib/db/repositories/build';
import { taxonomyRepository } from '@/lib/db/repositories/taxonomy';

/**
 * The option lists behind Lab's relation pickers (technologies, related
 * Builds, related Blueprints) — CMS_PRODUCT_DESIGN.md §4/§30's
 * "relationships are pickers, not IDs." Mirrors `work-relations.ts`'s shape
 * exactly; the only real difference between collections' relation
 * option-loaders is which repositories they query.
 */
export async function getLabRelationOptions() {
  const [technologies, builds, blueprints] = await Promise.all([
    taxonomyRepository.findByKind('technology'),
    buildRepository.list(),
    blueprintRepository.list(),
  ]);

  return {
    technologyOptions: technologies.map((entry) => ({
      id: entry._id.toString(),
      label: entry.label,
    })),
    buildOptions: builds.map((entry) => ({
      id: entry._id.toString(),
      label: entry.title,
      referenceId: entry.referenceId,
    })),
    blueprintOptions: blueprints.map((entry) => ({
      id: entry._id.toString(),
      label: entry.name,
      referenceId: entry.referenceId,
    })),
  };
}
