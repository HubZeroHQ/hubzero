import { ArrowUpRight } from "lucide-react";

import { Reveal } from "@/components/marketing/reveal";
import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";

/**
 * ARCHITECTURE/15_HOMEPAGE_DESIGN.md §3/§9: the one symmetric, centered
 * composition on the page — five asymmetric beats resolving into one
 * generous, centered "arrival." The headline deliberately reuses the
 * hero's own sentence ("Building technology that solves ... real
 * problem[s]"), shifted from a general statement to a direct address
 * ("your"), so this reads as the same line changed by the page it just
 * closed, not a new slogan. The CTA link reuses the hero's exact classes
 * (serif italic, text-h2, arrow) — §6's "same visual weight, both times"
 * is enforced by literally sharing the treatment, not eyeballing a match.
 */
export function CtaClose() {
  return (
    <div className="pt-28 pb-32 sm:pt-32 sm:pb-40 lg:pt-40 lg:pb-48">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <h2 className="text-text font-serif text-[clamp(2.25rem,1rem+4.5vw,5.5rem)] leading-[1.08] font-normal tracking-tight">
              <span className="block">Building technology</span>
              <span className="block">
                that solves <span className="italic">your</span> real problem.
              </span>
            </h2>
          </Reveal>

          <Reveal delayMs={80}>
            <p className="text-body text-text-muted mx-auto mt-6 max-w-md">
              Software, hardware, or both — tell us what you&apos;re building.
            </p>
          </Reveal>

          <Reveal delayMs={140}>
            <Link
              href="/contact"
              className="text-accent text-h2 mt-10 inline-flex items-center gap-2 font-serif italic no-underline hover:no-underline hover:opacity-80"
            >
              Start a project
              <ArrowUpRight className="size-5 not-italic" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </Container>
    </div>
  );
}
