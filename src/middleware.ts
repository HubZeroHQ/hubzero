import { NextResponse } from 'next/server';
import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth/config';

/**
 * Route protection for the CMS (`/cms/**`) and its API surface
 * (`/api/cms/**`, e.g. the search endpoint). Built on the edge-safe half
 * of the Auth.js config (`lib/auth/config.ts`) — this file runs on the
 * Edge runtime, which cannot load the `mongodb` driver pulled in by the
 * full config in `lib/auth/index.ts`.
 *
 * `/cms/login` is the one CMS route that must stay reachable while signed
 * out; every other matched route requires a session. Page routes redirect
 * to login with a `callbackUrl`; API routes get a plain 401 instead of a
 * redirect, since a `fetch()` following a redirect to an HTML login page
 * is not a meaningful response for a JSON caller.
 */
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (pathname === '/cms/login') {
    if (req.auth) {
      return NextResponse.redirect(new URL('/cms/dashboard', req.nextUrl.origin));
    }
    return NextResponse.next();
  }

  if (!req.auth) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const loginUrl = new URL('/cms/login', req.nextUrl.origin);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/cms/:path*', '/api/cms/:path*'],
};
