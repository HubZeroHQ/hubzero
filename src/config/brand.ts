/**
 * Single source of truth for brand asset paths. Design originals live in the
 * repo-root `assets/` folder (never served, never modified — see
 * `ARCHITECTURE/07_DESIGN_SYSTEM.md`); everything below is the public-facing
 * copy under `public/`. Reference this config instead of hardcoding a path.
 *
 * Canonical register (DESIGN/V4/00_IMPLEMENTATION_STRATEGY.md §2): the
 * company has delivered its real canonical mark — `assets/hubzero-logo-black.png`
 * / `hubzero-logo-white.png` (flat, transparent, zero chroma) and
 * `assets/hubzero-app-icon.png` (the same mark pre-composited on a filled
 * square, ready for OS app-icon contexts that need a solid background).
 * Everything below is generated directly from those three real files — no
 * hand-traced approximation, no generated placeholder. The previous gap this
 * comment used to describe (only a glossy, gradient expressive render
 * existed; nothing survived a 16px favicon) is closed by this asset
 * delivery, not by design work performed in this repository.
 */
export const brandAssets = {
  /** Multi-resolution ICO, generated from the black mark on transparent — served via Next's `src/app/favicon.ico` file convention. */
  favicon: "/favicon.ico",
  /** 180×180, generated from the pre-composited app icon — served via `src/app/apple-icon.png`. */
  appleTouchIcon: "/apple-icon.png",
  manifest: "/site.webmanifest",
  androidChrome192: "/web-app-manifest-192x192.png",
  androidChrome512: "/web-app-manifest-512x512.png",
  /**
   * Theme-adaptive icon pair for in-app rendering (navbar, footer, compact
   * UI) — `Logo` renders both and lets CSS (`dark:`/`.light`, not JS) select
   * the correct one, so a Server Component never needs `useTheme()` and
   * there's no hydration-flash risk. Black glyph for light backgrounds,
   * white glyph for dark — both real, transparent, generated from the
   * canonical source files above.
   */
  iconLight: "/brand/icon-black.png",
  iconDark: "/brand/icon-white.png",
  /** Default Open Graph / social preview image — a real, generated card (mark + wordmark on Graphite), not a placeholder. Per-entry dynamic cards are future, page-scoped work. */
  ogImage: "/images/og/hubzero-og.png",
} as const;

export type BrandAssets = typeof brandAssets;
