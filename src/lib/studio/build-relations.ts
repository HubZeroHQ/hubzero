import { engineeringProfileRepository } from '@/lib/db/repositories/engineering-profile';
import { labRepository } from '@/lib/db/repositories/lab';
import { taxonomyRepository } from '@/lib/db/repositories/taxonomy';
import { teamRepository } from '@/lib/db/repositories/team';
import { workRepository } from '@/lib/db/repositories/work';

/**
 * The option lists behind Build's relation pickers (technologies,
 * originating Lab, related Work, Engineering contributors) —
 * CMS_PRODUCT_DESIGN.md §4/§30's "relationships are pickers, not IDs."
 * Mirrors `work-relations.ts`'s shape exactly; the only real difference
 * between the two collections' relation option-loaders is which
 * repositories they query.
 */
export async function getBuildRelationOptions() {
  const [technologies, labs, workEntries, profiles, team] = await Promise.all([
    taxonomyRepository.findByKind('technology'),
    labRepository.list(),
    workRepository.list(),
    engineeringProfileRepository.list(),
    teamRepository.list(),
  ]);
  const teamNames = new Map(team.map((member) => [member._id.toString(), member.name]));

  return {
    technologyOptions: technologies.map((entry) => ({
      id: entry._id.toString(),
      label: entry.label,
    })),
    labOptions: labs.map((entry) => ({
      id: entry._id.toString(),
      label: entry.title,
      referenceId: entry.referenceId,
    })),
    workOptions: workEntries.map((entry) => ({
      id: entry._id.toString(),
      label: entry.title,
      referenceId: entry.referenceId,
    })),
    contributorOptions: profiles.map((entry) => ({
      id: entry._id.toString(),
      label: teamNames.get(entry.teamMemberId.toString()) ?? entry.slug,
      referenceId: entry.referenceId,
    })),
  };
}
