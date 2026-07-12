/**
 * Vector construction of the canonical HZ mark (`assets/hubzero-logo-*.png`),
 * built as two independently-drawable pieces instead of one flat raster
 * image. `CREATIVE_DIRECTION.md` §3.1 treats the mark as "the one recurring
 * object the site is allowed to animate as itself... folding along real
 * edges" — that requires real, separable geometry to animate, which a PNG
 * can't provide. This is a faithful, simplified vector interpretation of
 * the real mark's silhouette (a hexagon-half carrying the H, a hexagon-half
 * carrying the triangle/chevron), not a redesign of it — the two raster
 * files remain canonical for every non-animated context (favicon, OG
 * images, `apple-icon.png`) via `brandAssets`.
 *
 * `left` reads as the H — structure, something built. `right` reads as the
 * triangle-and-chevron — execution, something that runs. That reading is
 * exactly `CREATIVE_DIRECTION.md` §2's Built to Run duality, already
 * latent in the mark before a single line of motion code touches it.
 */

export const MARK_VIEWBOX = "0 0 100 100";

/** The H half — a hexagon-shaped block with two notches cut from its
 * center (evenodd), leaving pointed, solid caps top and bottom. */
export const MARK_LEFT_PATH =
  "M34,6 L50,24 L50,76 L34,94 L10,70 L10,30 Z M26,15 L42,15 L42,45 L26,45 Z M26,55 L42,55 L42,85 L26,85 Z";

/** The triangle — the upper-right "execute" glyph. */
export const MARK_TRIANGLE_PATH = "M66,6 L90,48 L50,25 Z";

/** The chevron — the lower-right "Z" glyph. */
export const MARK_CHEVRON_PATH = "M50,50 L90,50 L90,70 L66,94 L50,76 Z";

/** Combined right-half path (triangle + chevron together), used wherever
 * the right piece needs to move/scale as a single rigid body. */
export const MARK_RIGHT_PATH = `${MARK_TRIANGLE_PATH} ${MARK_CHEVRON_PATH}`;
