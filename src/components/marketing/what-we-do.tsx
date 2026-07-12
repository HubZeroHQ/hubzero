import { ArrowUpRight } from "lucide-react";

import { Reveal } from "@/components/marketing/reveal";
import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";

/**
 * ARCHITECTURE/15_HOMEPAGE_DESIGN.md §9 / §12: the highest-genericness-risk
 * beat on the page. Two panels, deliberately unequal in width, offset in
 * position, and textured differently (a code-like hairline grid for
 * Software, a perf-board dot grid for Hardware) rather than a matching
 * card template repeated twice — a symmetric two-card grid here is the
 * exact failure mode §12 calls out.
 *
 * Each panel closes with a plain in-content link (an <a>, not a Button) —
 * ARCHITECTURE/15_HOMEPAGE_DESIGN.md §6: only the primary/secondary CTAs
 * get button chrome; everything else links out as text, per the "Services
 * panels ... link out via plain in-content links/arrows" rule.
 *
 * Monochrome pass (DESIGN/V4/00_IMPLEMENTATION_STRATEGY.md §3.2): both
 * textures now mix from --color-border (ink), not --color-accent — an
 * ambient background pattern tinted with the Signal color, even at low
 * opacity, is exactly the "brand wash" this document's color rule
 * excludes. The two panels stay differentiated by texture *geometry*
 * (hairline vs. dot-grid) alone, which was always the actual
 * differentiator — the color tint was never load-bearing for telling them
 * apart.
 */
export function WhatWeDo() {
  return (
    <div className="pt-28 pb-20 sm:pt-32 sm:pb-24 lg:pb-32">
      <Container>
        <Reveal>
          <p className="text-h3 text-text max-w-xl font-normal">
            Two disciplines, engineered as one practice.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-y-16 lg:mt-20 lg:grid-cols-12 lg:gap-x-10">
          {/* Software — wider, leads the beat. Faint vertical hairline
              texture reads as a code/editor metaphor without spelling it
              out literally (no laptop illustration, no monitor icon). */}
          <Reveal as="div" className="lg:col-span-8">
            <div
              className="relative -mx-7 px-7 py-10 sm:-mx-10 sm:px-10 sm:py-12"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, color-mix(in oklch, var(--color-border) 55%, transparent) 0 1px, transparent 1px 56px)",
              }}
            >
              <p className="text-caption text-text-muted font-mono">01 — Software Engineering</p>
              <h2 className="text-h1 text-text mt-4 max-w-md font-normal">Software Engineering</h2>
              <p className="text-body text-text-muted mt-5 max-w-md">
                Web and mobile applications, backend systems, and AI-assisted automation — built by
                the same engineers who stay on the team after launch.
              </p>
              <Link
                href="/services/software"
                className="text-text mt-8 inline-flex items-center gap-1.5 no-underline hover:no-underline hover:opacity-80"
              >
                Explore Software Engineering
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </Reveal>

          {/* Hardware — narrower, offset downward so the two panels don't
              share a top edge. Dot-grid texture (perf-board holes) instead
              of the hairline pattern, so the two panels read as genuinely
              different surfaces, not one template recolored. */}
          <Reveal as="div" delayMs={100} className="lg:col-span-4 lg:col-start-9 lg:mt-20">
            <div
              className="relative -mx-7 px-7 py-10 sm:-mx-10 sm:px-10 sm:py-12"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, color-mix(in oklch, var(--color-border) 65%, transparent) 1px, transparent 0)",
                backgroundSize: "22px 22px",
              }}
            >
              <p className="text-caption text-text-muted font-mono">02 — Hardware &amp; Embedded</p>
              <h2 className="text-h2 text-text mt-4 font-normal">Hardware &amp; Embedded</h2>
              <p className="text-body text-text-muted mt-5">
                Embedded systems, IoT integration, and the hardware-software bridge most software
                agencies can&apos;t touch.
              </p>
              <Link
                href="/services/hardware"
                className="text-text mt-8 inline-flex items-center gap-1.5 no-underline hover:no-underline hover:opacity-80"
              >
                Explore Hardware &amp; Embedded
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </Reveal>
        </div>
      </Container>
    </div>
  );
}
