import { engineeringProfileRepository } from '@/lib/db/repositories/engineering-profile';
import { taxonomyRepository } from '@/lib/db/repositories/taxonomy';
import { teamRepository } from '@/lib/db/repositories/team';
import { createContentAdapter } from './content-adapter';

export const engineeringProfilesSearchAdapter = createContentAdapter({
  type: 'engineeringProfiles',
  label: 'Engineering Profiles',
  href: (entry) => `/studio/engineering-profiles/${entry._id.toString()}`,
  list: async () => {
    const [profiles, team, technologies] = await Promise.all([
      engineeringProfileRepository.list(),
      teamRepository.list(),
      taxonomyRepository.findByKind('technology'),
    ]);
    const names = new Map(team.map((entry) => [entry._id.toString(), entry.name]));
    const labels = new Map(technologies.map((entry) => [entry._id.toString(), entry.label]));
    return profiles.map((profile) => ({
      ...profile,
      engineerName: names.get(profile.teamMemberId.toString()) ?? 'Unknown engineer',
      technologyLabels: profile.technologyIds
        .map((id) => labels.get(id.toString()))
        .filter((label): label is string => Boolean(label)),
    }));
  },
  getTitle: (entry) => entry.engineerName,
  getReferenceId: (entry) => entry.referenceId,
  getExtraSearchText: (entry) => [
    entry.engineeringPhilosophy,
    entry.currentExploration,
    ...entry.areasOfExpertise,
    ...entry.technologyLabels,
  ],
});
