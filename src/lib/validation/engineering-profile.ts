import { z } from 'zod';
import { objectIdString, publishStatusSchema, slugSchema } from './shared';

const stringList = z.array(z.string().trim().min(1)).default([]);

export const engineeringProfileSchema = z.object({
  slug: slugSchema,
  status: publishStatusSchema.default('draft'),
  teamMemberId: objectIdString,
  overview: z.string().trim().min(1),
  engineeringPhilosophy: z.string().trim().min(1),
  currentExploration: z.string().trim().min(1),
  areasOfExpertise: stringList,
  currentInterests: stringList,
  engineeringIdentity: stringList,
  technologyIds: z.array(objectIdString).default([]),
  featuredWorkIds: z.array(objectIdString).default([]),
  featuredBuildIds: z.array(objectIdString).default([]),
  featuredBlueprintIds: z.array(objectIdString).default([]),
  featuredLabIds: z.array(objectIdString).default([]),
  featuredNoteIds: z.array(objectIdString).default([]),
  portraitId: objectIdString.optional(),
  heroMediaId: objectIdString.optional(),
  galleryImageIds: z.array(objectIdString).default([]),
});

export type EngineeringProfileInput = z.infer<typeof engineeringProfileSchema>;
