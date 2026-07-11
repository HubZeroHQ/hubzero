/**
 * Motion contract (ARCHITECTURE/07_DESIGN_SYSTEM.md §4; extended per
 * DESIGN/V3/08_MOTION_SYSTEM.md).
 *
 * Today's primitives use plain CSS transitions (Tailwind's built-in
 * `duration-*`/`ease-*` utilities) for hover/focus/state changes, which
 * keeps them Server Components. These constants exist so that once a later
 * phase needs orchestrated, JS-driven animation, every component reaches
 * for the same numbers instead of inventing new ones. `prefers-reduced-motion`
 * is handled once, globally, in globals.css for plain CSS transitions — not
 * per component; `prefersReducedMotion()` below is the equivalent check for
 * JS-driven animation outside React (GSAP, Anime.js), since only Motion
 * (motion.dev) has a built-in hook for it.
 *
 * Ownership boundary (08_MOTION_SYSTEM.md §2) — named here once so it
 * doesn't need re-deriving per component: GSAP owns *time* (scroll
 * storytelling, hero scenes, pinned sections, diagram build-order
 * sequencing); Motion owns *state* (hover/focus/modal, page transitions,
 * shared-layout animation — already in use for the current hero); Anime.js
 * owns *small, self-contained draws* (SVG trace-path/line-drawing,
 * counters, icon-level interactions). All three libraries are installed
 * (`gsap` incl. `ScrollTrigger`, `animejs` v4, `motion`) — every call site
 * still names which of the three owns a given moment before reaching for
 * it (principle 5), rather than defaulting to whichever is already imported
 * nearby.
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
