/**
 * Single source of truth for brand asset paths. Design originals live in the
 * repo-root `assets/` folder (never served, never modified — see
 * `ARCHITECTURE/07_DESIGN_SYSTEM.md`); everything below is the public-facing
 * copy under `public/`. Reference this config instead of hardcoding a path.
 */
export const brandAssets = {
  favicon: "/favicon.ico",
  appleTouchIcon: "/apple-touch-icon.png",
  manifest: "/site.webmanifest",
  androidChrome192: "/android-chrome-192x192.png",
  androidChrome512: "/android-chrome-512x512.png",
  /**
   * Icon mark, transparent background — the only mark asset safe to place on
   * an arbitrary or theme-dependent background (navbar, compact UI, loading
   * states). Use this, not `iconSvgSource`, for in-app rendering.
   */
  icon: "/brand/icon.png",
  /**
   * NOT a real vector: this "SVG" is a PNG embedded in an `<image>` tag with
   * an opaque white background rect baked in by the export tool. Kept only
   * to mirror the design-source file 1:1; do not render it in the app (it
   * will show a white box in dark mode). Ask design for a true vector or a
   * transparent re-export before using this anywhere.
   */
  iconSvgSource: "/brand/icon.svg",
  /**
   * Full lockups (icon + wordmark). These are flattened onto an opaque dark
   * navy canvas by the design export — NOT transparent — so they only read
   * correctly on a matching dark background. Reserved for guaranteed-dark
   * contexts (Open Graph image, hero/marketing moments, brand pages), not
   * for chrome that must adapt to the light theme. See `Logo` component for
   * the theme-adaptive icon+text lockup used in Navbar/Footer instead.
   */
  primary: "/brand/primary.png",
  primaryHorizontal: "/brand/primary-horizontal.png",
  wordmark: "/brand/wordmark.png",
  /** Default Open Graph / social preview image until a dedicated one exists. */
  ogImage: "/brand/primary.png",
} as const;

export type BrandAssets = typeof brandAssets;
