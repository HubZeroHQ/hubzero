import { blueprintRepository } from '@/lib/db/repositories/blueprint';
import { buildRepository } from '@/lib/db/repositories/build';
import { taxonomyRepository } from '@/lib/db/repositories/taxonomy';
import { teamRepository } from '@/lib/db/repositories/team';
import { toPlainOptions, toRelationOptions } from './relation-options';

/**
 * The option lists behind Lab's relation pickers (technologies, related
 * Builds, related Blueprints, Engineering contributors) —
 * CMS_PRODUCT_DESIGN.md §4/§30's "relationships are pickers, not IDs."
 * Mirrors `work-relations.ts`'s shape exactly; the only real difference
 * between collections' relation option-loaders is which repositories they
 * query.
 */
export async function getLabRelationOptions() {
  const [technologies, builds, blueprints, team] = await Promise.all([
    taxonomyRepository.findByKind('technology'),
    buildRepository.list(),
    blueprintRepository.list(),
    teamRepository.list(),
  ]);

  return {
    technologyOptions: toPlainOptions(technologies),
    buildOptions: toRelationOptions(builds, (entry) => entry.title),
    blueprintOptions: toRelationOptions(blueprints, (entry) => entry.name),
    contributorOptions: toRelationOptions(team, (entry) => entry.name),
  };
}
