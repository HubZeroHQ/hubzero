/**
 * Motion contract (ARCHITECTURE/07_DESIGN_SYSTEM.md §4; revised per
 * DESIGN/V4/00_IMPLEMENTATION_STRATEGY.md §6 — supersedes
 * DESIGN/V3/08_MOTION_SYSTEM.md's three-library baseline).
 *
 * Today's primitives use plain CSS transitions (Tailwind's built-in
 * `duration-*`/`ease-*` utilities) for hover/focus/state changes, which
 * keeps them Server Components. These constants exist so that every
 * JS-driven animation reaches for the same numbers instead of inventing new
 * ones. `prefers-reduced-motion` is handled once, globally, in globals.css
 * for plain CSS transitions — not per component; `prefersReducedMotion()`
 * below is the equivalent check for JS-driven animation outside React
 * (GSAP), since Motion (motion.dev) has a built-in hook for it.
 *
 * Two-tier architecture, not three: **Motion (motion.dev) is the default
 * for everything** — state transitions, hover/focus, page/layout
 * transitions, one-shot scroll reveals, SVG line-drawing (`pathLength`),
 * and spring-based counters. This covers the jobs DESIGN/V3/08 originally
 * split across Motion *and* Anime.js; Anime.js added a third dependency,
 * bundle cost, and timing vocabulary without a capability Motion didn't
 * already have, and has been removed from the dependency tree (zero real
 * usage anywhere in this codebase before removal, grep-verified).
 *
 * **GSAP (ScrollTrigger) is kept as one named, scoped exception**: multi-
 * element, scroll-scrubbed diagram build-order sequencing
 * (`components/marketing/diagram/sequenced-diagram.tsx`, the Build Sequence
 * signature moment) — a real, working, isolated case that needs several
 * elements' reveal progress tied directly to scroll position in a defined
 * order, which is outside what Motion's simpler scroll primitives do
 * cleanly. This is not "GSAP is available for scroll work generally" — a
 * new component reaching for GSAP should be able to name why
 * `SequencedDiagram`'s existing pattern doesn't already cover its need.
 */

export const duration = {
  /** Hover/focus micro-interactions — Tailwind `duration-150`. */
  fast: 0.15,
  /** Section-entry fades, dropdown/select open-close — Tailwind `duration-300`. */
  base: 0.3,
  /** Reserved for rare, deliberately slower transitions. */
  slow: 0.4,
  /**
   * GSAP's multi-second choreography — a hero's orchestrated load sequence
   * (e.g. the Trace-In, DESIGN/V3/16_SIGNATURE_MOMENTS.md §1: 1.6–2.0s
   * total), a pinned-section reveal. Not used for scroll-scrubbed
   * animation (ScrollTrigger ties progress to scroll position directly,
   * not to a fixed duration) — only for a GSAP timeline's own
   * self-contained, non-scroll-linked choreography.
   */
  scrollSequence: 2.0,
} as const;

/** Cubic-bezier eases as arrays, ready for Framer Motion's `ease` prop. */
export const ease = {
  /** Default for entrances and state changes — confident, no bounce. */
  out: [0.16, 1, 0.3, 1],
  /** Symmetric — use for transitions that reverse (open/close, toggle). */
  inOut: [0.4, 0, 0.2, 1],
} as const;

/** Travel distance for section-entry slide-ups, in pixels (§4: 8-16px, never a long throw). */
export const distance = {
  sm: 8,
  md: 16,
} as const;

/** Single source of truth for the reduced-motion media query string. */
export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * `prefers-reduced-motion` check for JS-driven animation outside React.
 * Motion (motion.dev) has its own `useReducedMotion()` hook, already used
 * correctly in the current hero — reach for that inside a component
 * instead. This helper is for GSAP (pair with `gsap.matchMedia()`) and
 * Anime.js (call before initializing a draw) setup code, per
 * DESIGN/V3/08_MOTION_SYSTEM.md §6 principle 3: reduced motion means an
 * *instant* resolved state, not a shorter version of the same animation —
 * every call site branches on this, it doesn't just scale a duration down.
 * Returns `false` outside a browser (SSR) since there's no animation to
 * skip yet at that point.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}
