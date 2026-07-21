import { z } from 'zod';
import {
  labStageSchema,
  objectIdString,
  progressMilestoneSchema,
  publishStatusSchema,
  slugSchema,
} from './shared';

/**
 * PLANNING.md §26.4, extended per Phase 10 (AGENTS.md's Labs pillar — active
 * engineering exploration, not an incomplete Build). `stage` communicates
 * where the research currently sits (Exploring/Building/Testing) — distinct
 * from `status`, the shared five-state publishing workflow (§28). Media,
 * technologies, and related-entry fields mirror the exact shape Work/Build/
 * Blueprint already use (`heroImageId`/`galleryImageIds`/`technologyIds`/
 * `relatedBuildIds`/`relatedBlueprintIds`) rather than inventing a
 * Labs-specific relation shape.
 */
export const labSchema = z.object({
  title: z.string().min(1),
  slug: slugSchema,
  status: publishStatusSchema.default('draft'),
  stage: labStageSchema,
  objective: z.string().min(1),
  researchDirection: z.string().min(1),
  currentMilestone: z.string().min(1),
  graduationCriteria: z.string().min(1),
  graduatedToBuildId: objectIdString.optional(),
  startDate: z.coerce.date(),
  lastMajorUpdateAt: z.coerce.date().optional(),
  internalRepoUrl: z.string().url(),
  publicRepoUrl: z.string().url().optional(),
  liveDemoUrl: z.string().url().optional(),
  technologyIds: z.array(objectIdString).default([]),
  relatedBuildIds: z.array(objectIdString).default([]),
  relatedBlueprintIds: z.array(objectIdString).default([]),
  heroImageId: objectIdString.optional(),
  galleryImageIds: z.array(objectIdString).default([]),
  featured: z.boolean().default(false),
  /** The Progress Timeline (Phase 10) — a lightweight, generic milestone list (`lib/validation/shared.ts`). */
  milestones: z.array(progressMilestoneSchema).default([]),
  contributorProfileIds: z.array(objectIdString).default([]),
});

export type LabInput = z.infer<typeof labSchema>;
