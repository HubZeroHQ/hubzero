"use client";

import { motion, useReducedMotion, useScroll } from "motion/react";
import { useRef } from "react";

import { MARK_TRIANGLE_PATH } from "@/components/brand/mark-geometry";
import type { WithChildren, WithClassName } from "@/types";
import { cn } from "@/lib/utils";

/**
 * The Assembly Line (`CREATIVE_DIRECTION.md` §8, §13.1) — the homepage's one
 * structural device, used exactly once, sitewide, per §3.4's rule that the
 * mark's angle family is used "sparingly, structurally, never tiled as a
 * pattern." A real vertical line the homepage's real content sections
 * attach to as the visitor scrolls, the way a labeled exploded diagram has
 * one spine and named parts branching off it — not a decoration repeated
 * per section, one continuous line for the whole page.
 *
 * The muted base line is the full structure, visible from first paint (§2's
 * "Built" — considered, load-bearing, present before anything happens). The
 * solid fill tracks scroll progress through the homepage (§2's "Run" —
 * proof, delivered as the visitor actually moves through it). Real content,
 * not decoration: the fill's length is exactly how far through the page's
 * argument the visitor actually is.
 */
export function SpineRoot({ children, className }: WithChildren & WithClassName) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  return (
    <div ref={ref} className={cn("relative", className)}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-6 hidden w-px md:block lg:left-10"
      >
        <div className="bg-border-muted absolute inset-0" />
        {!shouldReduceMotion && (
          <motion.div
            style={{ scaleY: scrollYProgress }}
            className="bg-text absolute inset-0 origin-top"
          />
        )}
      </div>
      {children}
    </div>
  );
}

/**
 * A small marker denoting a real content section's attachment point on the
 * spine — built from the mark's own triangle/execute glyph
 * (`mark-geometry.ts`), never a generic bullet or dot. Themed via
 * `currentColor` so callers control emphasis with text color, not a prop.
 */
export function SpineMarker({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("size-2.5 shrink-0", className)}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d={MARK_TRIANGLE_PATH} />
    </svg>
  );
}

/**
 * A section label paired with its `SpineMarker` — the standard way every
 * Assembly Line section identifies its attachment point (§13.1: "the
 * architecture," "proof," "labs," "the team"). Keeps the marker+label
 * pairing consistent instead of every section hand-rolling its own eyebrow.
 */
export function SpineLabel({ children, className }: WithChildren & WithClassName) {
  return (
    <div
      className={cn(
        "text-caption text-text-muted flex items-center gap-2 font-mono tracking-widest uppercase",
        className,
      )}
    >
      <SpineMarker />
      {children}
    </div>
  );
}
