import { z } from 'zod';
import { objectIdString, socialLinkSchema } from './shared';

/** PLANNING.md §26.6 — public-facing profile, optionally linked back to a User. */
export const teamSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  bio: z.string().min(1),
  group: z.string().min(1),
  portraitId: objectIdString.optional(),
  publicProfile: z.boolean().default(false),
  userId: objectIdString.optional(),
  founder: z.boolean().default(false),
  publicCategory: z.enum(['leadership', 'team']).default('team'),
  engineeringProfileEligible: z.boolean().default(false),
  joinedAt: z.coerce.date().optional(),
  order: z.number().default(0),
  socialLinks: z.array(socialLinkSchema).default([]),
  archived: z.boolean().default(false),
});

export type TeamInput = z.infer<typeof teamSchema>;
