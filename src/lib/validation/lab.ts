import { z } from 'zod';
import { labStageSchema, objectIdString, publishStatusSchema, slugSchema } from './shared';

/** PLANNING.md §26.4. */
export const labSchema = z.object({
  title: z.string().min(1),
  slug: slugSchema,
  status: publishStatusSchema.default('draft'),
  stage: labStageSchema,
  objective: z.string().min(1),
  nextMilestone: z.string().min(1),
  graduationCriteria: z.string().min(1),
  graduatedToBuildId: objectIdString.optional(),
});

export type LabInput = z.infer<typeof labSchema>;
