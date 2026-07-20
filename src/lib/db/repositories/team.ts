import { ObjectId } from 'mongodb';
import { REFERENCE_ID_PREFIXES } from '@/config/reference-ids';
import { teamSchema, type TeamInput } from '@/lib/validation/team';
import type { Team } from '@/types/studio';
import { collections } from '../collections';
import { createRepository, parsePartialInput } from '../repository';

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
    base.update(id, parsePartialInput(teamSchema, input)),
  /**
   * Reassigns a permanent `referenceId` in place — used exactly once, by
   * `scripts/renumber-founder-team-members.ts`, mirroring
   * `engineeringProfileRepository.reassignReferenceId`'s own comment: a
   * reference ID normally "never changes once assigned"; this exists only
   * for that one deliberate, human-reviewed migration and must never be
   * called from any normal create/update/action path.
   */
  reassignReferenceId: async (id: string, referenceId: Team['referenceId']) => {
    const collection = await collections.team();
    return collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { referenceId, updatedAt: new Date() } },
      { returnDocument: 'after' },
    );
  },
};
