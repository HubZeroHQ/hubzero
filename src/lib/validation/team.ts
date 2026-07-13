import { z } from 'zod';
import { objectIdString } from './shared';

/** PLANNING.md §26.6 — public-facing profile, optionally linked back to a User. */
export const teamSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  bio: z.string().min(1),
  group: z.string().min(1),
  portraitId: objectIdString.optional(),
  publicProfile: z.boolean().default(false),
  userId: objectIdString.optional(),
});

export type TeamInput = z.infer<typeof teamSchema>;
