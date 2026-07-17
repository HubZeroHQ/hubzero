import { REFERENCE_ID_PREFIXES } from '@/config/reference-ids';
import {
  engineeringProfileSchema,
  type EngineeringProfileInput,
} from '@/lib/validation/engineering-profile';
import { ObjectId } from 'mongodb';
import type { EngineeringProfile } from '@/types/studio';
import { collections } from '../collections';
import { createRepository, parsePartialInput } from '../repository';

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
    return base.create(parsed, { createdByUserId });
  },
  update: (id: string, input: Partial<EngineeringProfileInput>) =>
    base.update(id, parsePartialInput(engineeringProfileSchema, input)),
};
