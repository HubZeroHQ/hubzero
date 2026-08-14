import type { NextAuthConfig } from 'next-auth';
import type { UserRole } from '@/types/studio';

// Session/JWT type augmentation (`@/types/auth`, `@/types/auth-jwt`) is
// intentionally not imported here: both are already part of the TS
// program via tsconfig's `include`, so their ambient `declare module`
// blocks apply globally without a runtime import. `auth-jwt.ts` in
// particular does a real (non-type-only) `import 'next-auth/jwt'` to work
// around a resolution gotcha (see its own comment) — importing it from
// this file would still enlarge the middleware's runtime module graph,
// which should stay minimal here.

/**
 * The database-free half of the Auth.js configuration — no adapter and no
 * providers that touch MongoDB/bcrypt. Middleware only needs to verify an
 * existing session's JWT, never to run a provider's `authorize()`, so it
 * imports this file rather than `./index.ts`. That remains true now that the
 * middleware uses the Node runtime for its separate public-detail preflight.
 *
 * `./index.ts` spreads this config and adds the adapter + providers for
 * every other (Node runtime) context. Keep session/callback/pages logic
 * here, once, so the two configs can never drift apart.
 */
export const authConfig: NextAuthConfig = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/studio/login' },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: UserRole }).role ?? 'member';
        token.mustChangePassword =
          (user as { mustChangePassword?: boolean }).mustChangePassword ?? false;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id ?? '';
      session.user.role = token.role ?? 'member';
      session.user.mustChangePassword = token.mustChangePassword ?? false;
      return session;
    },
  },
};
