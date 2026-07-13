import type { DefaultSession } from 'next-auth';
import type { UserRole } from './studio';

/**
 * Session/User type augmentation for Auth.js (next-auth v5). The role lives
 * on the system identity (Users, §26.9) and is attached to the session so
 * every Server Component/route can read `session.user.role` without a
 * second lookup. Enforcement itself lives in lib/auth/permissions.ts (§29).
 *
 * The matching JWT augmentation lives in `auth-jwt.ts`, not here — combining
 * a `declare module 'next-auth'` augmentation with a `declare module
 * 'next-auth/jwt'` one in the same file breaks TypeScript's resolution of
 * the second module specifier (reproduced against next-auth 5.0.0-beta.31 /
 * TS 5.9, `moduleResolution: "bundler"`).
 */
declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id: string;
      role: UserRole;
    };
  }

  interface User {
    role?: UserRole;
  }
}
