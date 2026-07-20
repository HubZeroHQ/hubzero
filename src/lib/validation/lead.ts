import { z } from 'zod';
import { leadStatusSchema, objectIdString } from './shared';

/** PLANNING.md §26.8 — deliberately minimal, not a CRM. No reference ID. */
export const leadSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(1),
  source: z.string().min(1),
  status: leadStatusSchema.default('new'),
  assignedToUserId: objectIdString.optional(),
  internalNotes: z.string().optional(),
  archived: z.boolean().default(false),
});

export type LeadInput = z.infer<typeof leadSchema>;
