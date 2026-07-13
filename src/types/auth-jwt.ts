// A bare side-effect import of the module being augmented below. Without
// it, TypeScript's `moduleResolution: "bundler"` fails to resolve the
// `next-auth/jwt` subpath export purely from the ambient `declare module`
// block (reproduced against next-auth 5.0.0-beta.31 / TS 5.9) — some real
// import of the specifier has to happen first.
import 'next-auth/jwt';
import type { UserRole } from './cms';

/**
 * JWT type augmentation for Auth.js (next-auth v5) — split from `auth.ts`;
 * see the comment there for why combining the two `declare module` blocks
 * in one file doesn't work. The `jwt` callback in lib/auth/index.ts attaches
 * these fields; its `session` callback projects them onto `session.user`.
 */
declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: UserRole;
  }
}
