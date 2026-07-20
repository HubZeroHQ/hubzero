import { compare, hash } from 'bcryptjs';

/** bcrypt work factor — a common default; revisit only if profiling shows it's a bottleneck. */
const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return hash(password, SALT_ROUNDS);
}

/** Shared by `providers/credentials.ts`'s sign-in check and the self-profile "change my password" flow, so both compare against a hash the same way. */
export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return compare(password, passwordHash);
}
