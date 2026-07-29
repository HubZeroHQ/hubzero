import { labRepository } from '@/lib/db/repositories/lab';
import { taxonomyRepository } from '@/lib/db/repositories/taxonomy';
import { teamRepository } from '@/lib/db/repositories/team';
import { workRepository } from '@/lib/db/repositories/work';
import { toPlainOptions, toRelationOptions } from './relation-options';

/**
 * The option lists behind Build's relation pickers (technologies,
 * originating Lab, related Work, Engineering contributors) —
 * CMS_PRODUCT_DESIGN.md §4/§30's "relationships are pickers, not IDs."
 * Mirrors `work-relations.ts`'s shape exactly; the only real difference
 * between the two collections' relation option-loaders is which
 * repositories they query.
 */
export async function getBuildRelationOptions() {
  const [technologies, labs, workEntries, team] = await Promise.all([
    taxonomyRepository.findByKind('technology'),
    labRepository.list(),
    workRepository.list(),
    teamRepository.list(),
  ]);

  return {
    technologyOptions: toPlainOptions(technologies),
    labOptions: toRelationOptions(labs, (entry) => entry.title),
    workOptions: toRelationOptions(workEntries, (entry) => entry.title),
    contributorOptions: toRelationOptions(team, (entry) => entry.name),
  };
}
