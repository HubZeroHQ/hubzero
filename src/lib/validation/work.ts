import { z } from 'zod';
import { objectIdString, publishStatusSchema, slugSchema } from './shared';

/** PLANNING.md §26.1. */
export const workSchema = z.object({
  title: z.string().min(1),
  summary: z.string().trim().min(1).max(320),
  slug: slugSchema,
  status: publishStatusSchema.default('draft'),
  clientType: z.string().min(1),
  categoryTagIds: z.array(objectIdString).default([]),
  timeline: z.string().min(1),
  role: z.string().min(1),
  technologyIds: z.array(objectIdString).default([]),
  relatedBuildIds: z.array(objectIdString).default([]),
  relatedBlueprintIds: z.array(objectIdString).default([]),
  relatedLabIds: z.array(objectIdString).default([]),
  contributorProfileIds: z.array(objectIdString).default([]),
  heroImageId: objectIdString.optional(),
  /** Additive beyond PLANNING.md §26.1 — mirrors Build's identical `repoUrl` (§26.2) for a client/internal repo link. */
  repoUrl: z.string().url().optional(),
});

export type WorkInput = z.infer<typeof workSchema>;
