import type { NextFetchEvent, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth/config';
import type { PublicDetailEntityType } from '@/lib/public/domain';

/**
 * Route protection for the Studio (`/studio/**`) and its API surface
 * (`/api/studio/**`, e.g. the search endpoint). Built on the database-free
 * half of the Auth.js config (`lib/auth/config.ts`); the full MongoDB-backed
 * config in `lib/auth/index.ts` is deliberately not loaded here.
 *
 * A per-request CSP nonce (`script-src 'nonce-...' 'strict-dynamic'`) was
 * tried here and reverted — see `next.config.ts`'s CSP comment for why: it
 * requires this middleware to run on every route, and its nonce fails to
 * match on any statically-generated/ISR page in production (that HTML is
 * pre-rendered once, outside any request middleware ever touches, so it
 * can't carry a nonce matching whatever middleware freshly generates for
 * the request that later happens to serve the cached response). Broadening
 * the Auth.js wrapper also makes it set its CSRF/callback-url cookies on
 * anonymous public page views. `studioAuthMiddleware` therefore remains
 * explicitly limited to Studio routes even though this file now has a second,
 * narrowly matched public responsibility.
 *
 * `/studio/login` is the one Studio route that must stay reachable while signed
 * out; every other matched route requires a session. Page routes redirect
 * to login with a `callbackUrl`; API routes get a plain 401 instead of a
 * redirect, since a `fetch()` following a redirect to an HTML login page
 * is not a meaningful response for a JSON caller.
 */
const { auth } = NextAuth(authConfig);

const studioAuthMiddleware = auth((req, _event: NextFetchEvent) => {
  void _event;
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
  // in this app. The flag lives on the JWT (`auth-jwt.ts`), so it is readable
  // here without a MongoDB round-trip. A page-only check: it is a UX prompt,
  // not the security boundary, so API routes are left alone the same way the
  // unauthenticated branch above treats them differently from pages.
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

const PUBLIC_DETAIL_ROUTES = new Map<string, PublicDetailEntityType>([
  ['work', 'work'],
  ['builds', 'build'],
  ['blueprints', 'blueprint'],
  ['labs', 'lab'],
  ['notes', 'note'],
  ['engineering', 'engineeringProfile'],
  ['careers', 'career'],
]);

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/studio') || pathname.startsWith('/api/studio')) {
    return studioAuthMiddleware(request, event);
  }

  // Draft Mode's signed cookie is validated by `draftMode()` in the page. The
  // preflight deliberately steps aside whenever the cookie is present so an
  // authorized editor can still resolve records that are not public yet.
  if (request.cookies.has('__prerender_bypass')) return NextResponse.next();

  const [, route, slug] = pathname.split('/');
  if (!route || !slug) return NextResponse.next();
  const type = PUBLIC_DETAIL_ROUTES.get(route);
  if (!type) return NextResponse.next();

  let decodedSlug: string;
  try {
    // App Router params are decoded before a page receives them. Apply the
    // same contract here so an encoded but otherwise valid slug cannot be
    // rejected by the preflight before the page gets a chance to resolve it.
    decodedSlug = decodeURIComponent(slug);
  } catch {
    return NextResponse.rewrite(new URL('/_not-found', request.url), { status: 404 });
  }

  // Keep the MongoDB-backed public repository out of Studio middleware
  // evaluation entirely; this branch is the only consumer in this runtime.
  const { getPublicDetail } = await import('@/lib/public/queries');
  const entity = await getPublicDetail(type, decodedSlug);
  if (entity?.type === type) return NextResponse.next();

  // Next 15.5's `notFound()` correctly sets 404 but serializes its useful UI
  // only into the RSC scripts (vercel/next.js#62228). A routing-level rewrite
  // lets the independently rendered global fallback provide real HTML while
  // retaining the requested URL and the required status.
  return NextResponse.rewrite(new URL('/_not-found', request.url), { status: 404 });
}

export const config = {
  // MongoDB-backed public visibility checks require the stable Node middleware
  // runtime introduced in Next 15.5. Studio still uses the same database-free
  // Auth.js config and the same redirect/authorization contract above.
  runtime: 'nodejs',
  matcher: [
    '/studio/:path*',
    '/api/studio/:path*',
    '/work/:slug',
    '/builds/:slug',
    '/blueprints/:slug',
    '/labs/:slug',
    '/notes/:slug',
    '/engineering/:slug',
    '/careers/:slug',
  ],
};
