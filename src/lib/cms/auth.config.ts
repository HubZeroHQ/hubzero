import type { NextAuthConfig } from "next-auth";

/**
 * The edge-safe half of the Auth.js config (`ARCHITECTURE/19_CMS_FOUNDATION.md`
 * §2). `middleware.ts` runs on the Edge runtime, where bundling `bcryptjs`
 * and Mongoose (both Node-only) would be dead weight at best and a build
 * failure at worst — so this file declares no providers and no
 * database-touching callbacks. `src/lib/cms/auth.ts` spreads this config and
 * adds the Credentials provider + session callbacks that only ever run in
 * the Node runtime (Server Components, Server Actions, the API route
 * handler). This split is the standard Auth.js v5 pattern for
 * Credentials-provider auth combined with middleware-based route gating.
 */
export default {
  pages: {
    signIn: "/studio/login",
  },
  providers: [],
} satisfies NextAuthConfig;
