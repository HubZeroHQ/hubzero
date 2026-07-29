import { ObjectId } from 'mongodb';
import type { Filter } from 'mongodb';
import { REFERENCE_ID_PREFIXES } from '@/config/reference-ids';
import { teamSchema, type TeamInput } from '@/lib/validation/team';
import type { Team } from '@/types/studio';
import { collections } from '../collections';
import { createRepository, parsePartialInput } from '../repository';

const base = createRepository<Team, TeamInput>(collections.team, {
  referenceIdPrefix: REFERENCE_ID_PREFIXES.team,
});

/**
 * Backfills `teamSchema`'s `.default(...)`s for documents written before
 * those fields existed. `createRepository`'s `findById`/`list` return
 * whatever Mongo has verbatim (no re-validation), so a record predating
 * e.g. `socialLinks` comes back with the key missing entirely rather than
 * `[]` — even though `Team` types every one of these fields as required.
 * `create`/`update` already guarantee the defaults via `teamSchema.parse`;
 * every read path needs the same guarantee, or callers either crash
 * (`member.socialLinks.length`) or silently misbehave (`a.order - b.order`
 * sorting as `NaN` for a member missing `order`).
 */
function normalizeTeam(doc: Team): Team {
  return {
    ...doc,
    publicProfile: doc.publicProfile ?? false,
    founder: doc.founder ?? false,
    publicCategory: doc.publicCategory ?? 'team',
    engineeringProfileEligible: doc.engineeringProfileEligible ?? false,
    order: doc.order ?? 0,
    socialLinks: doc.socialLinks ?? [],
    archived: doc.archived ?? false,
  };
}

export const teamRepository = {
  findById: async (id: string) => {
    const doc = await base.findById(id);
    return doc ? normalizeTeam(doc) : null;
  },
  list: async (filter: Filter<Team> = {}) => (await base.list(filter)).map(normalizeTeam),
  remove: base.remove,
  findPublicProfiles: async () =>
    (await collections.team())
      .find({ publicProfile: true })
      .toArray()
      .then((docs) => docs.map(normalizeTeam)),
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
