import { z } from 'zod';
import { entryReferenceSchema, servicePublishStatusSchema } from './shared';

/** PLANNING.md §26.7 — small, low-volume, simplified two-state workflow. */
export const serviceSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  status: servicePublishStatusSchema.default('draft'),
  evidenceLinks: z.array(entryReferenceSchema).default([]),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
