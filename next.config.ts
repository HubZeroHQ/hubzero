import type { NextConfig } from "next";

/**
 * Same-origin-only baseline — nothing in this app currently loads a
 * third-party script, font, or API (no analytics tool is wired up yet
 * despite `SiteSettings.analytics` existing as a schema field — see
 * `docs/operations/ADMIN_BOOTSTRAP.md`'s sibling production-readiness notes).
 * `'unsafe-inline'` on `script-src`/`style-src` is the pragmatic middle
 * ground: Next.js's own hydration bootstrap and Radix UI's inline-positioned
 * popper elements both rely on inline script/style, and a nonce-based CSP
 * would require threading a per-request nonce through every layout — real
 * infrastructure with no other consumer yet, not a one-line config fix.
 * Tightening this further (nonces, or dropping `'unsafe-inline'` once no
 * inline script/style is needed) is future work, not a regression today.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

// `export default` is required here — the legacy config silently dropped
// site-wide settings by omitting it (see ARCHITECTURE/08_TECHNICAL_ARCHITECTURE.md §7).
const nextConfig: NextConfig = {
  output: "standalone",
  // `sharp`'s ESM build (`dist/utility.mjs`) has a self-reference bug when
  // Next's own bundler processes it via dynamic import — the same package
  // works correctly everywhere it's used directly (`lib/cms/media.ts`'s
  // CJS-style import). Marking it external skips Next's bundling for this
  // package entirely, matching the standard fix for this class of
  // native-binary-package interop bug.
  serverExternalPackages: ["sharp"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
        ],
      },
    ];
  },
};

export default nextConfig;
