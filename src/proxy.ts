import { NextResponse } from "next/server";
import NextAuth from "next-auth";

import authConfig from "@/lib/cms/auth.config";

/**
 * Coarse auth gate for every `/studio/**` request (`ARCHITECTURE/19_CMS_FOUNDATION.md`
 * §2) — "is anyone logged in at all," not fine-grained RBAC (that lives in
 * `can()`, Phase B). Runs on the Edge runtime, so it's built from
 * `auth.config.ts` (no Credentials provider, no bcrypt/Mongoose) and checks
 * only the session JWT's own validity — never a live database permission
 * lookup, which would be a real latency/cost tax on every request at the edge.
 *
 * Lives at `src/proxy.ts`, not the repo root — this project keeps its
 * entire application under `src/` (`src/app`, `src/components`, …), and
 * Next.js requires this file to sit alongside `app/` in that same `src/`
 * directory when one is in use. A root-level file is silently never invoked
 * in that layout (confirmed while validating this phase: it compiled and
 * appeared in the route list, but never actually ran).
 *
 * Named `proxy.ts`, not `middleware.ts` — `ARCHITECTURE/19_CMS_FOUNDATION.md`
 * §2/§4 describes this as "`middleware.ts`," the file convention's name as of
 * that document's writing. Next.js 16 (the version this app is on, per
 * `package.json`) renamed the convention to `proxy.ts`; `middleware.ts`
 * still works but logs a deprecation warning on every dev/build run. Same
 * export shape (`export default auth((req) => …)`, `export const config`),
 * so this is a filename-only change, not a behavioral one.
 *
 * Defense in depth: this is one of two enforcement points, not the only one
 * — every `/studio/**` layout also calls `requireSessionUser()`
 * (`src/lib/cms/session.ts`) so a route is never accidentally exposed by a
 * matcher misconfiguration alone.
 *
 * Deliberately one-directional: this only ever redirects an unauthenticated
 * visitor *toward* `/studio/login`, never an authenticated one *away* from
 * it. An earlier version also bounced `/studio/login` back to `/studio`
 * when `req.auth?.user` was truthy — which, discovered while validating
 * this phase, produces an infinite redirect loop the moment a session is
 * revoked (`sessionVersion` mismatch): this edge-only check can't see the
 * revocation (no DB lookup, by design, see above) and still considers the
 * JWT "logged in," while `requireSessionUser()` in the Node runtime
 * correctly does see it and sends the visitor back to `/studio/login` —
 * each layer redirecting the other's redirect, forever. The "already
 * logged in, skip the login page" convenience now lives in
 * `studio/login/page.tsx` itself, which calls the same revocation-aware
 * `getSessionUser()` the layout does, so both directions agree.
 */
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth?.user;
  const isLoginRoute = nextUrl.pathname === "/studio/login";

  if (isLoginRoute) {
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    const loginUrl = new URL("/studio/login", nextUrl);
    loginUrl.searchParams.set("from", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/studio/:path*"],
};
