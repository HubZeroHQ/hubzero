"use client";

import { motion, useReducedMotion } from "motion/react";

import { duration } from "@/lib/motion";
import { useInView } from "@/lib/use-in-view";
import { cn } from "@/lib/utils";

export interface SectionCutProps {
  className?: string;
  /** Band height. @default "3rem" */
  height?: string;
}

/**
 * The Section Cut signature moment (DESIGN/V3/16_SIGNATURE_MOMENTS.md §3) —
 * a cross-hatch band marking the hinge between a narrative beat and a
 * technical/evidence beat (02_VISUAL_LANGUAGE.md §1, 05_LAYOUT_SYSTEM.md §7:
 * "drafting-sheet spreads"). As a reader scrolls into it, the cross-hatching
 * draws in as a brief cut-away reveal — Motion-driven (a two-state opacity
 * transition, not scroll-scrubbed choreography), so it never spends the
 * host page's one GSAP slot. Reduced motion: appears instantly at full
 * opacity, no draw-in.
 *
 * Renders in the Signal color (DESIGN/V4/00_IMPLEMENTATION_STRATEGY.md §3.2)
 * at low opacity — diagrams/technical-register content is one of Signal's
 * few sanctioned jobs now that interaction and diagrams share one color
 * instead of two. Never full-strength, never an interactive affordance.
 *
 * Rare by design: a hinge between two beats, not a routine section divider.
 * Counts against the same emphasis-whitespace budget as any other emphasis
 * moment — at most two per page (02_VISUAL_LANGUAGE.md §4).
 */
export function SectionCut({ className, height = "3rem" }: SectionCutProps) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const shouldReduceMotion = useReducedMotion();
  const revealed = inView || shouldReduceMotion;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn("w-full overflow-hidden", className)}
      style={{ height }}
    >
      <motion.div
        className="h-full w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: revealed ? 1 : 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : duration.slow }}
        style={{
          backgroundImage: [
            "repeating-linear-gradient(45deg, color-mix(in oklch, var(--color-accent-text) 30%, transparent) 0 1px, transparent 1px 12px)",
            "repeating-linear-gradient(-45deg, color-mix(in oklch, var(--color-accent-text) 30%, transparent) 0 1px, transparent 1px 12px)",
          ].join(", "),
        }}
      />
    </div>
  );
}
