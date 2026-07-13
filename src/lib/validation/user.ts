import { z } from 'zod';
import { userRoleSchema } from './shared';

/** PLANNING.md §26.9 — system identity for CMS access, never rendered publicly. */
export const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: userRoleSchema,
  passwordHash: z.string().min(1).optional(),
  image: z.string().url().optional(),
});

export type UserInput = z.infer<typeof userSchema>;
