import { z } from 'zod';
import {
  buildDeploymentStateSchema,
  objectIdString,
  publishStatusSchema,
  slugSchema,
} from './shared';

/** PLANNING.md §26.2. Owns two Documents (`caseStudy`, `technical`) via the general ownership model (§25) — not modeled here. */
export const buildSchema = z.object({
  title: z.string().min(1),
  slug: slugSchema,
  status: publishStatusSchema.default('draft'),
  deploymentState: buildDeploymentStateSchema,
  liveUrl: z.string().url().optional(),
  repoUrl: z.string().url().optional(),
  technologyIds: z.array(objectIdString).default([]),
  originatingLabId: objectIdString.optional(),
  relatedWorkIds: z.array(objectIdString).default([]),
  /** Additive beyond §26.2 — mirrors Work's `heroImageId` (§26.1) plus a supporting gallery (§10's "screenshots"). */
  heroImageId: objectIdString.optional(),
  galleryImageIds: z.array(objectIdString).default([]),
  /** Additive beyond §26.2 — the homepage's "Featured Build" slot (PLANNING.md §8) needs one flag to query against. */
  featured: z.boolean().default(false),
  contributorProfileIds: z.array(objectIdString).default([]),
});

export type BuildInput = z.infer<typeof buildSchema>;
