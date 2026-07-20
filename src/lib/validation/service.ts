import { z } from 'zod';
import { serviceEvidenceReferenceSchema, servicePublishStatusSchema } from './shared';

/** PLANNING.md §26.7 — small, low-volume, simplified two-state workflow. */
export const serviceSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  status: servicePublishStatusSchema.default('draft'),
  evidenceLinks: z.array(serviceEvidenceReferenceSchema).default([]),
  order: z.number().default(0),
  featured: z.boolean().default(false),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
