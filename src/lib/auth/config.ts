import type { NextAuthConfig } from 'next-auth';
import type { UserRole } from '@/types/studio';

// Session/JWT type augmentation (`@/types/auth`, `@/types/auth-jwt`) is
// intentionally not imported here: both are already part of the TS
// program via tsconfig's `include`, so their ambient `declare module`
// blocks apply globally without a runtime import. `auth-jwt.ts` in
// particular does a real (non-type-only) `import 'next-auth/jwt'` to work
// around a resolution gotcha (see its own comment) — importing it from
// this file would pull that runtime import into the Edge bundle
// `middleware.ts` builds from, which is exactly the module graph that
// should stay minimal here.

/**
 * The edge-safe half of the Auth.js configuration — no adapter, no
 * providers that touch MongoDB/bcrypt. `middleware.ts` runs on the Edge
 * runtime, which cannot load the `mongodb` driver, so it can only ever
 * import this file, never `./index.ts`. Middleware only needs to verify an
 * existing session's JWT, never to run a provider's `authorize()`, so
 * omitting providers here costs nothing at the point this config is used
 * for route protection.
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
        token.role = (user as { role?: UserRole }).role ?? 'teamMember';
        token.mustChangePassword =
          (user as { mustChangePassword?: boolean }).mustChangePassword ?? false;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id ?? '';
      session.user.role = token.role ?? 'teamMember';
      session.user.mustChangePassword = token.mustChangePassword ?? false;
      return session;
    },
  },
};
