import { z } from 'zod';
import { objectIdString, publishStatusSchema, slugSchema } from './shared';

/** PLANNING.md §26.1. */
export const workSchema = z.object({
  title: z.string().min(1),
  slug: slugSchema,
  status: publishStatusSchema.default('draft'),
  clientType: z.string().min(1),
  categoryTagIds: z.array(objectIdString).default([]),
  timeline: z.string().min(1),
  role: z.string().min(1),
  technologyIds: z.array(objectIdString).default([]),
  relatedBuildIds: z.array(objectIdString).default([]),
  relatedBlueprintIds: z.array(objectIdString).default([]),
  heroImageId: objectIdString.optional(),
});

export type WorkInput = z.infer<typeof workSchema>;
