import { blueprintRepository } from '@/lib/db/repositories/blueprint';
import { buildRepository } from '@/lib/db/repositories/build';
import { engineeringProfileRepository } from '@/lib/db/repositories/engineering-profile';
import { taxonomyRepository } from '@/lib/db/repositories/taxonomy';
import { teamRepository } from '@/lib/db/repositories/team';

/**
 * The option lists behind Lab's relation pickers (technologies, related
 * Builds, related Blueprints, Engineering contributors) —
 * CMS_PRODUCT_DESIGN.md §4/§30's "relationships are pickers, not IDs."
 * Mirrors `work-relations.ts`'s shape exactly; the only real difference
 * between collections' relation option-loaders is which repositories they
 * query.
 */
export async function getLabRelationOptions() {
  const [technologies, builds, blueprints, profiles, team] = await Promise.all([
    taxonomyRepository.findByKind('technology'),
    buildRepository.list(),
    blueprintRepository.list(),
    engineeringProfileRepository.list(),
    teamRepository.list(),
  ]);
  const teamNames = new Map(team.map((member) => [member._id.toString(), member.name]));

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
    contributorOptions: profiles.map((entry) => ({
      id: entry._id.toString(),
      label: teamNames.get(entry.teamMemberId.toString()) ?? entry.slug,
      referenceId: entry.referenceId,
    })),
  };
}
