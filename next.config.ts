import type { NextConfig } from 'next';
import { fileURLToPath } from 'url';

const isDev = process.env.NODE_ENV !== 'production';

/**
 * Content-Security-Policy — `script-src` carries `'unsafe-inline'`, which
 * looks like the "easy" option but is the one actually correct for this
 * app, arrived at only after trying and empirically disproving the
 * stricter alternative:
 *
 * Next.js App Router renders real inline `<script>` tags on every route —
 * the React Server Components stream (`self.__next_f.push(...)`) and
 * Suspense-boundary swaps — and their content is genuine per-request server
 * data, so a fixed hash allowlist can't cover them. The only CSP mechanism
 * that allows inline scripts without `'unsafe-inline'` is a nonce, which by
 * definition must be freshly generated per request (in middleware, the only
 * place with per-request context) and must match a `nonce="..."` attribute
 * Next.js stamps onto those same scripts. This was implemented and tested
 * against this app's real, deliberate ISR setup (`export const revalidate`
 * on nearly every content route) and failed for exactly the reason ISR
 * exists: a statically-generated page's HTML is rendered ONCE, at build or
 * revalidation time, with no request (and so no middleware, no nonce)
 * involved at all — meaning it ships with no nonce baked into its scripts,
 * while middleware still stamps a fresh, different nonce onto that same
 * response's CSP header on every subsequent request that happens to serve
 * it from cache. The mismatch reproduces the identical hydration failure
 * this CSP exists to fix, but only on cached pages — confirmed live via
 * `next start` (`/` blank, "Connection closed" from the RSC client),
 * despite the identical code working perfectly under `next dev`, where
 * nothing is ever actually served from a build-time-static cache. Forcing
 * every route to render dynamically would resolve the mismatch but throw
 * away ISR entirely for a CSP directive — a disproportionate trade against
 * architecture two prior audits already verified as deliberate and correct.
 * `'unsafe-inline'` is therefore the directive that's actually correct for
 * this app's real rendering model, not merely the untried easy default.
 * Every other directive stays as strict as `default-src 'self'` allows.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  // Same reasoning as script-src, minus the nonce detour — React's `style`
  // prop is CSSOM assignment rather than a parsed inline attribute, which
  // isn't necessarily gated by style-src at all, but that can't be
  // live-verified across every browser from this environment, so
  // 'unsafe-inline' stays here too as the same disclosed, conservative call.
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' https://res.cloudinary.com data: blob:",
  "font-src 'self'",
  // `api.cloudinary.com` is required because uploads go directly
  // browser→Cloudinary (`lib/media/upload-client.ts`) — our server only
  // issues a signature, it never proxies the file — so the browser itself
  // must be allowed to open that connection.
  `connect-src 'self' https://api.cloudinary.com${isDev ? ' ws: wss:' : ''}`,
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  // Stops the browser from MIME-sniffing a response into an executable type
  // it wasn't served as (e.g. treating an uploaded document as HTML/JS).
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Defense in depth alongside the CSP's `frame-ancestors 'none'` above,
  // for browsers that only honor this older header — this site is never
  // meant to be embedded in a frame anywhere.
  { key: 'X-Frame-Options', value: 'DENY' },
  // Sends the full referrer on same-origin navigation (useful for this app's
  // own `source`-tracking on Contact/Career forms) but only the origin, not
  // the full path, cross-origin.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Explicitly denies browser features this site never uses.
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  // Production-only: tells browsers to only ever reach this origin over
  // HTTPS for the next two years, including subdomains. Meaningless (and
  // safely ignored by browsers) over a local, unencrypted dev connection.
  ...(isDev
    ? []
    : [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',
        },
      ]),
];

const nextConfig: NextConfig = {
  experimental: {
    // HubZero deliberately has independent public and Studio root layouts.
    // Next 15.5's routing-level fallback is the supported way to serve one
    // complete unmatched-route document without reintroducing a shared root.
    globalNotFound: true,
  },
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
  // Pins the workspace root explicitly — without it, Next.js's root
  // auto-detection can pick the wrong directory when a lockfile also exists
  // in a parent folder (e.g. a git worktree checked out under the repo).
  outputFileTracingRoot: fileURLToPath(new URL('.', import.meta.url)),
  allowedDevOrigins: ['dev.hubzero.in'],
  // pdf-parse pulls in pdfjs-dist, which assumes it's loaded via Node's own
  // module resolution (it does its own worker/canvas feature detection at
  // import time). Letting webpack bundle it into a server chunk instead of
  // `require()`-ing it natively breaks that detection and throws
  // `TypeError: Object.defineProperty called on non-object` as soon as the
  // module is evaluated. Excluding these keeps them as plain Node requires.
  serverExternalPackages: ['pdf-parse', 'pdfjs-dist', 'mammoth'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

export default nextConfig;
