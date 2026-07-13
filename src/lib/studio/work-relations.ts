import { blueprintRepository } from '@/lib/db/repositories/blueprint';
import { buildRepository } from '@/lib/db/repositories/build';
import { taxonomyRepository } from '@/lib/db/repositories/taxonomy';

/**
 * The option lists behind Work's relation pickers (technologies, category
 * tags, related Builds/Blueprints) — CMS_PRODUCT_DESIGN.md §4/§30's
 * "relationships are pickers, not IDs." Builds/Blueprints have no list UI
 * of their own yet (this phase only builds Work's), so these query the
 * repositories directly rather than an API that doesn't exist — the exact
 * same data layer a future Builds/Blueprints list page will also read.
 */
export async function getWorkRelationOptions() {
  const [technologies, categories, builds, blueprints] = await Promise.all([
    taxonomyRepository.findByKind('technology'),
    taxonomyRepository.findByKind('category'),
    buildRepository.list(),
    blueprintRepository.list(),
  ]);

  return {
    technologyOptions: technologies.map((entry) => ({
      id: entry._id.toString(),
      label: entry.label,
    })),
    categoryOptions: categories.map((entry) => ({ id: entry._id.toString(), label: entry.label })),
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
