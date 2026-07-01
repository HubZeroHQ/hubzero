/**
 * Motion contract (ARCHITECTURE/07_DESIGN_SYSTEM.md §4).
 *
 * Today's primitives use plain CSS transitions (Tailwind's built-in
 * `duration-*`/`ease-*` utilities) for hover/focus/state changes, which
 * keeps them Server Components. These constants exist so that once a later
 * phase needs orchestrated, JS-driven animation (e.g. Framer Motion for a
 * hero entrance or a Work-grid filter transition), every component reaches
 * for the same numbers instead of inventing new ones. `prefers-reduced-motion`
 * is handled once, globally, in globals.css — not per component.
 */

export const duration = {
  /** Hover/focus micro-interactions — Tailwind `duration-150`. */
  fast: 0.15,
  /** Section-entry fades, dropdown/select open-close — Tailwind `duration-300`. */
  base: 0.3,
  /** Reserved for rare, deliberately slower transitions. */
  slow: 0.4,
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
