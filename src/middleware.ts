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

  return NextResponse.next();
});

export const config = {
  matcher: ['/studio/:path*', '/api/studio/:path*'],
};
