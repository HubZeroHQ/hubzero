import { hash } from 'bcryptjs';

/** bcrypt work factor — a common default; revisit only if profiling shows it's a bottleneck. */
const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return hash(password, SALT_ROUNDS);
}
