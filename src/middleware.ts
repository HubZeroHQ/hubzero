import { NextResponse } from 'next/server';
import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth/config';

/**
 * Route protection for the Studio (`/studio/**`) and its API surface
 * (`/api/studio/**`, e.g. the search endpoint). Built on the edge-safe half
 * of the Auth.js config (`lib/auth/config.ts`) — this file runs on the
 * Edge runtime, which cannot load the `mongodb` driver pulled in by the
 * full config in `lib/auth/index.ts`.
 *
 * A per-request CSP nonce (`script-src 'nonce-...' 'strict-dynamic'`) was
 * tried here and reverted — see `next.config.ts`'s CSP comment for why: it
 * requires this middleware to run on every route, and its nonce fails to
 * match on any statically-generated/ISR page in production (that HTML is
 * pre-rendered once, outside any request middleware ever touches, so it
 * can't carry a nonce matching whatever middleware freshly generates for
 * the request that later happens to serve the cached response). Broadening
 * this middleware for that purpose also had a real side effect worth
 * remembering if this is revisited: wrapping every request in `auth()`
 * (this file's original form) makes Auth.js set its CSRF/callback-url
 * cookies on anonymous public page views too — verified live, and directly
 * false against what `/privacy` tells visitors. If a future attempt scopes
 * middleware more broadly again, keep the `auth()` call itself scoped to
 * `/studio/**` for that reason, the way the branch below already does.
 *
 * `/studio/login` is the one Studio route that must stay reachable while signed
 * out; every other matched route requires a session. Page routes redirect
 * to login with a `callbackUrl`; API routes get a plain 401 instead of a
 * redirect, since a `fetch()` following a redirect to an HTML login page
 * is not a meaningful response for a JSON caller.
 */
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (pathname === '/studio/login') {
    if (req.auth) {
      return NextResponse.redirect(new URL('/studio/dashboard', req.nextUrl.origin));
    }
    return NextResponse.next();
  }

  if (!req.auth) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const loginUrl = new URL('/studio/login', req.nextUrl.origin);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Users management's admin-assisted "Reset password" (Part 1) sets this
  // flag rather than emailing a reset link — there's no mail infrastructure
  // in this app. The flag lives on the JWT (`auth-jwt.ts`), so it's readable
  // here on the Edge runtime without a MongoDB round-trip. A page-only
  // check: it's a UX prompt, not the security boundary, so API routes are
  // left alone the same way the unauthenticated branch above treats them
  // differently from pages.
  if (
    req.auth.user.mustChangePassword &&
    !pathname.startsWith('/api/') &&
    pathname !== '/studio/profile/change-password'
  ) {
    return NextResponse.redirect(new URL('/studio/profile/change-password', req.nextUrl.origin));
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-hubzero-request-id', crypto.randomUUID().slice(0, 12));
  return NextResponse.next({ request: { headers: requestHeaders } });
});

export const config = {
  matcher: ['/studio/:path*', '/api/studio/:path*'],
};
