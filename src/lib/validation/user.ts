import { z } from 'zod';
import { userRoleSchema } from './shared';

/** PLANNING.md §26.9 — system identity for Studio access, never rendered publicly. */
export const userSchema = z.object({
  name: z.string().min(1),
  // Trimmed + lowercased at the schema level so every write path (Users
  // management's form, the admin-bootstrap scripts) stores emails the same
  // way `userRepository.findByEmail` normalizes its lookup key — an exact
  // Mongo match otherwise silently misses a real account over casing.
  email: z.string().trim().toLowerCase().email(),
  role: userRoleSchema,
  passwordHash: z.string().min(1).optional(),
  image: z.string().url().optional(),
  disabled: z.boolean().default(false),
  mustChangePassword: z.boolean().default(false),
});

export type UserInput = z.infer<typeof userSchema>;
