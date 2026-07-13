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
});

export type BuildInput = z.infer<typeof buildSchema>;
