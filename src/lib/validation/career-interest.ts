import { z } from 'zod';
import { leadStatusSchema, objectIdString } from './shared';

/**
 * A candidate expressing interest when no Career listing currently fits.
 * Deliberately minimal and separate from `leadSchema` — see the `CareerInterest`
 * type doc comment (`types/studio.ts`) for why this isn't a repurposed Lead.
 * No reference ID: internal-only, no citation purpose.
 */
export const careerInterestSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  location: z.string().optional(),
  resumeUrl: z.string().url().optional(),
  portfolioUrl: z.string().url().optional(),
  githubUrl: z.string().url().optional(),
  linkedinUrl: z.string().url().optional(),
  websiteUrl: z.string().url().optional(),
  areasOfInterest: z.array(z.string().min(1)).default([]),
  introduction: z.string().min(1),
  careerId: objectIdString.optional(),
  status: leadStatusSchema.default('new'),
  assignedToUserId: objectIdString.optional(),
  internalNotes: z.string().optional(),
  archived: z.boolean().default(false),
});

export type CareerInterestInput = z.infer<typeof careerInterestSchema>;
