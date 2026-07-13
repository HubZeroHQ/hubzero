import { REFERENCE_ID_PREFIXES } from '@/config/reference-ids';
import { teamSchema, type TeamInput } from '@/lib/validation/team';
import type { Team } from '@/types/studio';
import { collections } from '../collections';
import { createRepository } from '../repository';

const base = createRepository<Team, TeamInput>(collections.team, {
  referenceIdPrefix: REFERENCE_ID_PREFIXES.team,
});

export const teamRepository = {
  findById: base.findById,
  list: base.list,
  remove: base.remove,
  findPublicProfiles: async () =>
    (await collections.team()).find({ publicProfile: true }).toArray(),
  create: (input: TeamInput) => base.create(teamSchema.parse(input)),
  update: (id: string, input: Partial<TeamInput>) =>
    base.update(id, teamSchema.partial().parse(input)),
};
