import {
  blueprintRepository,
  buildRepository,
  engineeringProfileRepository,
  labRepository,
  noteRepository,
  taxonomyRepository,
  teamRepository,
  workRepository,
} from '@/lib/db/repositories';
import { toPlainOptions, toRelationOptions } from './relation-options';

export async function getEngineeringProfileRelationOptions(currentTeamMemberId?: string) {
  const [team, profiles, technologies, work, builds, blueprints, labs, notes] = await Promise.all([
    teamRepository.list(),
    engineeringProfileRepository.list(),
    taxonomyRepository.findByKind('technology'),
    workRepository.list(),
    buildRepository.list(),
    blueprintRepository.list(),
    labRepository.list(),
    noteRepository.list(),
  ]);
  return {
    teamOptions: toRelationOptions(
      team.filter(
        (entry) =>
          entry._id.toString() === currentTeamMemberId ||
          (entry.engineeringProfileEligible &&
            !profiles.some((profile) => profile.teamMemberId.toString() === entry._id.toString())),
      ),
      (entry) => entry.name,
    ),
    technologyOptions: toPlainOptions(technologies),
    workOptions: toRelationOptions(work, (entry) => entry.title),
    buildOptions: toRelationOptions(builds, (entry) => entry.title),
    blueprintOptions: toRelationOptions(blueprints, (entry) => entry.name),
    labOptions: toRelationOptions(labs, (entry) => entry.title),
    noteOptions: toRelationOptions(notes, (entry) => entry.title),
  };
}
