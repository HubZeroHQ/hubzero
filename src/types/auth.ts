import type { DefaultSession } from 'next-auth';
import type { UserRole } from './cms';

/**
 * Session/User type augmentation for Auth.js (next-auth v5). The role lives
 * on the system identity (Users, §26.9) and is attached to the session here
 * so every Server Component/route can read `session.user.role` without a
 * second lookup. Permission checks that key off this field arrive in Phase 3.
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
