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
  const options = <T extends { _id: { toString(): string }; referenceId: string }>(
    entries: T[],
    label: (entry: T) => string,
  ) =>
    entries.map((entry) => ({
      id: entry._id.toString(),
      label: label(entry),
      referenceId: entry.referenceId,
    }));
  return {
    teamOptions: team
      .filter(
        (entry) =>
          entry._id.toString() === currentTeamMemberId ||
          (entry.engineeringProfileEligible &&
            !profiles.some((profile) => profile.teamMemberId.toString() === entry._id.toString())),
      )
      .map((entry) => ({
        id: entry._id.toString(),
        label: entry.name,
        referenceId: entry.referenceId,
      })),
    technologyOptions: technologies.map((entry) => ({
      id: entry._id.toString(),
      label: entry.label,
    })),
    workOptions: options(work, (entry) => entry.title),
    buildOptions: options(builds, (entry) => entry.title),
    blueprintOptions: options(blueprints, (entry) => entry.name),
    labOptions: options(labs, (entry) => entry.title),
    noteOptions: options(notes, (entry) => entry.title),
  };
}
