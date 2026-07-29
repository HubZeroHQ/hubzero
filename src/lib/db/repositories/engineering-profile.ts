import { REFERENCE_ID_PREFIXES } from '@/config/reference-ids';
import {
  engineeringProfileSchema,
  type EngineeringProfileInput,
} from '@/lib/validation/engineering-profile';
import { ObjectId } from 'mongodb';
import type { EngineeringProfile } from '@/types/studio';
import { collections } from '../collections';
import { createRepository, parsePartialInput } from '../repository';
import { teamRepository } from './team';

const base = createRepository<EngineeringProfile, EngineeringProfileInput>(
  collections.engineeringProfiles,
  {
    referenceIdPrefix: REFERENCE_ID_PREFIXES.engineeringProfiles,
  },
);

export const engineeringProfileRepository = {
  findById: base.findById,
  list: base.list,
  remove: base.remove,
  findBySlug: async (slug: string) => (await collections.engineeringProfiles()).findOne({ slug }),
  findByTeamMemberId: async (teamMemberId: string) =>
    (await collections.engineeringProfiles()).findOne({
      teamMemberId: { $in: [teamMemberId, new ObjectId(teamMemberId)] },
    } as never),
  create: async (input: EngineeringProfileInput, createdByUserId: string) => {
    const parsed = engineeringProfileSchema.parse(input);
    if (await engineeringProfileRepository.findByTeamMemberId(parsed.teamMemberId)) {
      throw new Error('This Team Member already has an Engineering Profile.');
    }
    const teamMember = await teamRepository.findById(parsed.teamMemberId);
    if (!teamMember?.engineeringProfileEligible) {
      throw new Error('This Team Member is not eligible for an Engineering Profile.');
    }
    return base.create(parsed, { createdByUserId });
  },
  update: (id: string, input: Partial<EngineeringProfileInput>) =>
    base.update(id, parsePartialInput(engineeringProfileSchema, input)),
  /**
   * Reassigns a permanent `referenceId` in place — used exactly once, by
   * `scripts/renumber-founder-engineering-profiles.ts`. `generateReferenceId`
   * (`lib/ids/reference-id.ts`) is explicit that an ID "never changes once
   * assigned"; this method exists only because that one migration is a
   * deliberate, human-reviewed exception, and must never be called from any
   * normal create/update/action path.
   */
  reassignReferenceId: async (id: string, referenceId: EngineeringProfile['referenceId']) => {
    const collection = await collections.engineeringProfiles();
    return collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { referenceId, updatedAt: new Date() } },
      { returnDocument: 'after' },
    );
  },
};
