"use client";

import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

import { CircuitMotif, CircuitSignatureMark } from "@/components/marketing/circuit-motif";
import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import { ease } from "@/lib/motion";

/**
 * The credibility strip's facts. Proposed wording per
 * ARCHITECTURE/15_HOMEPAGE_DESIGN.md §11 — flagged there as still needing
 * final copy sign-off; these are the founder-approved facts from
 * `00_FOUNDER_APPROVAL.md` / `01_PRODUCT_VISION.md`, not new claims.
 */
const credibilityFacts = [
  "Founded 2024",
  "Software and hardware engineering, one team",
  "Selective by design",
];

/**
 * Hero + Credibility strip, deliberately one component rather than two.
 *
 * Per ARCHITECTURE/15_HOMEPAGE_DESIGN.md §2/§3/§8: the credibility strip is
 * "not another section... a transitional beat" that must continue the
 * hero's motion sequence with no visual seam. Building them as one
 * orchestrated unit — instead of two components stitched together on the
 * page — is what actually enforces that, rather than leaving continuity to
 * chance at the page-composition layer.
 *
 * Hero height is a downstream result of this content (§4) — there is no
 * min-h-screen/90dvh target anywhere below.
 *
 * Round 3 revisions (founder design review):
 * - The CTA is no longer a filled pill button. It's set as large serif
 *   italic text, the same voice as the headline's emphasis word — hierarchy
 *   comes from type size/weight/color, not button chrome. Strip the styling
 *   and the reading order still holds: bold accent-colored line, then a
 *   smaller muted line beside it.
 * - The desktop motif is no longer neatly boxed inside its grid column — it
 *   bleeds past the content edge toward the viewport edge, clipped by this
 *   wrapper's overflow-hidden, so it reads as continuing beyond the frame
 *   rather than a contained decorative panel (deliberately unresolved).
 * - Mobile is recomposed, not shrunk: the credibility strip becomes a
 *   vertical list (a colophon, not a wrapped paragraph), and the motif
 *   appears as a small precise mark near the top rather than a diffuse
 *   full-bleed ghost — the same "small and intentional" idea as the
 *   desktop signature triangle, sized for a phone instead of hidden.
 */
export function HeroSection() {
  const shouldReduceMotion = useReducedMotion();

  // Drives the reveal off an explicit post-mount state flip rather than
  // motion's own `initial`/`animate` mount transition — that prop pair never
  // fired in this Next 16 (Turbopack) + React 19 + motion/react combination
  // (elements stuck permanently at their initial values). Not deferred via
  // requestAnimationFrame: rAF is throttled/withheld entirely in
  // backgrounded or non-visible tabs, which made the reveal never fire
  // during testing. A direct setState in this effect is the reliable trigger.
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mount flag for a CSS/motion entrance transition, not state synchronization
    setRevealed(true);
  }, []);

  const hiddenY = (distance: number) => (shouldReduceMotion ? 0 : distance);
  // Reduced-motion users get an immediate reveal, not just a shorter slide —
  // the orchestrated delay chain (up to ~2.5s before the credibility strip
  // appears) is itself motion that `prefers-reduced-motion` must skip.
  const transitionFor = (duration: number, delay: number) =>
    shouldReduceMotion ? { duration: 0, delay: 0 } : { duration, delay, ease: ease.out };

  const headlineTransition = transitionFor(0.9, 0.5);
  const subheadTransition = transitionFor(0.8, 0.85);
  const ctaTransition = transitionFor(0.7, 1.1);
  const stripTransition = transitionFor(0.8, 1.4);

  return (
    <div className="relative overflow-hidden pt-4 pb-8 sm:pb-10 lg:pb-12">
      <Container className="relative">
        {/* Mobile/tablet signature mark — the compact trace+triangle, sized
            like a printed mark above the headline, not a diffuse full-size
            ghost pattern behind the text (§ recompose, don't shrink). */}
        <div className="mb-6 h-8 w-24 lg:hidden" aria-hidden="true">
          <CircuitSignatureMark className="h-full w-full" />
        </div>

        {/* Motif bleed layer — deliberately not a grid column. Anchored to
            this Container (the content grid), not the viewport: its offsets
            run past the content edge toward the gutter, clipped by the
            wrapper's overflow-hidden, so it reads as continuing beyond the
            frame relative to the headline. Anchoring to the viewport instead
            (as a sibling of Container) is what causes the motif to drift
            away from the headline on wide/ultrawide/4K screens, where the
            gap between the content edge and the viewport edge grows much
            larger than on a laptop — the offset must stay relative to
            content at every width, not just the ones tested in DevTools. */}
        <div
          className="pointer-events-none absolute top-8 -right-24 hidden h-[34rem] w-[30rem] lg:block xl:-right-12"
          aria-hidden="true"
        >
          <CircuitMotif className="h-full w-full" />
        </div>

        {/* Text column — left-weighted, asymmetric (§3), capped so it never
            reaches into the motif's space even on narrower desktop widths. */}
        <div className="relative z-10 max-w-2xl">
          <motion.h1
            animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: hiddenY(16) }}
            transition={headlineTransition}
            className="text-text font-serif text-[clamp(2.25rem,1rem+4.5vw,5.5rem)] leading-[1.08] font-normal tracking-tight"
          >
            {/* Each line is its own block so the composition is deliberate at
                every viewport, not a byproduct of wherever the browser
                happens to wrap (§9: "asymmetric, left-weighted headline"). */}
            <span className="block">Building technology</span>
            <span className="block">
              that solves{" "}
              <span className="bg-[image:var(--brand-gradient)] bg-clip-text text-transparent">
                <span className="italic">real</span> problems.
              </span>
            </span>
          </motion.h1>

          <motion.p
            animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: hiddenY(16) }}
            transition={subheadTransition}
            className="text-body text-text-muted mt-8 max-w-md"
          >
            A small, founder-led team of engineers — not an agency, not a vendor.
          </motion.p>

          {/* CTA row — typographic, not componentized. "Start a project" is
              set in the same serif-italic voice as the headline's emphasis
              word; "See our work" stays plain and muted. Remove every class
              below but the two `<a>` tags and the hierarchy still holds. */}
          <motion.div
            animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: hiddenY(16) }}
            transition={ctaTransition}
            className="mt-10 flex flex-wrap items-baseline gap-x-8 gap-y-3"
          >
            <Link
              href="/contact"
              className="text-accent-text text-h2 inline-flex items-center gap-2 font-serif no-underline hover:no-underline hover:opacity-80"
            >
              Start a project
              <ArrowUpRight className="size-5 not-italic" aria-hidden="true" />
            </Link>
            <Link
              href="/work"
              tone="muted"
              className="hover:text-text text-body inline-flex items-center gap-1.5 no-underline hover:no-underline"
            >
              See our work
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </motion.div>
        </div>
      </Container>

      {/* Credibility strip — a continuation of the hero's own motion
          sequence (§8), not a separately-triggered reveal. No border, no
          background change: nothing marks this as a new section starting.
          Recomposed per breakpoint rather than reflowed: a vertical list on
          mobile (a colophon), one running line from sm up. */}
      <Container>
        <motion.div
          animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: hiddenY(8) }}
          transition={stripTransition}
          className="text-caption text-text-muted mt-10 flex flex-col items-start gap-1.5 font-mono sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3 sm:gap-y-2 lg:mt-16"
        >
          {credibilityFacts.map((fact, i) => (
            <span key={fact} className="flex items-center gap-3">
              {i > 0 && (
                <span aria-hidden="true" className="text-border hidden sm:inline">
                  ·
                </span>
              )}
              {fact}
            </span>
          ))}
        </motion.div>
      </Container>
    </div>
  );
}
