/**
 * Single source of truth for brand asset paths. Design originals live in the
 * repo-root `assets/` folder (never served, never modified — see
 * `ARCHITECTURE/07_DESIGN_SYSTEM.md`); everything below is the public-facing
 * copy under `public/`. Reference this config instead of hardcoding a path.
 *
 * Known gap, DESIGN/V3/13_BRAND_SYSTEM.md §2, §6, §11: every asset below is
 * the mark's *expressive* register (rich, dimensional, glossy) — correct
 * for hero/launch-scale use, but there is no *canonical* register yet (a
 * flat, single-tone redraw of the same H/Z geometry, per §2's "solid" and
 * "linework" treatments) for the contexts that actually need one —
 * `favicon.ico`, `apple-touch-icon.png`, the `android-chrome-*` sizes, and
 * the GitHub org avatar all lose the expressive render's fine gradient
 * detail at the small/single-color scale they're actually seen at (§1
 * invariant 4's Favicon Test). Producing that flat register is real,
 * separate asset-production work (§11) — accurately tracing the existing
 * 3D geometry into a flat vector needs real design tooling, not a blind
 * hand-coded approximation, so it isn't attempted here. `theme_color`/
 * `background_color` in `site.webmanifest` are updated to the Amendment's
 * Brand Blue/Background stops as a values-only change that doesn't depend
 * on the canonical-asset gap being closed first.
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
