import { blueprintRepository } from '@/lib/db/repositories/blueprint';
import { buildRepository } from '@/lib/db/repositories/build';
import { labRepository } from '@/lib/db/repositories/lab';
import { taxonomyRepository } from '@/lib/db/repositories/taxonomy';
import { teamRepository } from '@/lib/db/repositories/team';
import { toPlainOptions, toRelationOptions } from './relation-options';

/**
 * The option lists behind Work's relation pickers (technologies, category
 * tags, related Builds/Blueprints) — CMS_PRODUCT_DESIGN.md §4/§30's
 * "relationships are pickers, not IDs." Builds/Blueprints have no list UI
 * of their own yet (this phase only builds Work's), so these query the
 * repositories directly rather than an API that doesn't exist — the exact
 * same data layer a future Builds/Blueprints list page will also read.
 *
 * Contributors reference Team directly — the canonical person identity —
 * never `EngineeringProfile`. Whether a credited person also has a profile
 * is resolved at render time, not by picking from a different list here.
 */
export async function getWorkRelationOptions() {
  const [technologies, categories, builds, blueprints, labs, team] = await Promise.all([
    taxonomyRepository.findByKind('technology'),
    taxonomyRepository.findByKind('category'),
    buildRepository.list(),
    blueprintRepository.list(),
    labRepository.list(),
    teamRepository.list(),
  ]);

  return {
    technologyOptions: toPlainOptions(technologies),
    categoryOptions: toPlainOptions(categories),
    buildOptions: toRelationOptions(builds, (entry) => entry.title),
    blueprintOptions: toRelationOptions(blueprints, (entry) => entry.name),
    labOptions: toRelationOptions(labs, (entry) => entry.title),
    contributorOptions: toRelationOptions(team, (entry) => entry.name),
  };
}
