import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";

import { CtaPanel } from "@/components/marketing/cta-panel";
import { Reveal } from "@/components/marketing/reveal";
import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Software and the hardware it runs on, treated as one problem — HubZero's two engineering practices, and how they work together.",
};

/**
 * ARCHITECTURE/06_PAGE_SPECIFICATIONS.md "Services overview": a short
 * capability reference, not a second homepage — Home already established
 * trust in general; this page's only job is to let a visitor confirm their
 * specific need is covered and route them to the right practice page.
 *
 * Per DESIGN/00_AI_DESIGN_GUIDE.md §6, that means a genuinely different
 * shape from `WhatWeDo`'s asymmetric textured panels (already spent, on
 * Home) and from the numbered-practice-over-texture blocks Software and
 * Hardware currently use (their own redesign is a later session — this
 * page must not anticipate or hand them a template to inherit). So: no
 * texture, no pull-quote, no card grid. The two practices are introduced
 * as one continuous argument that resolves into two unequal invitations,
 * not a matched pair of boxes — Software leads (wider column, larger
 * heading) because it's the more established practice today; Hardware is
 * a genuine second movement, indented and quieter, not a mirror.
 *
 * The headline recovers "software, and the hardware it runs on" — the
 * original differentiator claim `00_FOUNDER_APPROVAL.md` §5 moved off the
 * homepage hero as *supporting*, not primary. This is exactly the page
 * that claim was displaced to; it belongs here, not invented fresh.
 */
export default function ServicesPage() {
  return (
    <div className="pb-28 sm:pb-32 lg:pb-40">
      {/* Opening — the differentiator itself, as prose, not a slogan */}
      <div className="pt-20 pb-20 sm:pt-24 sm:pb-24 lg:pt-28 lg:pb-28">
        <Container>
          <Reveal>
            <p className="text-caption text-text-muted font-mono tracking-wide uppercase">
              Services
            </p>
            <h1 className="text-text mt-6 max-w-2xl text-[clamp(2.25rem,1rem+4.5vw,4.5rem)] leading-[1.08] font-normal tracking-tight">
              Software, and the hardware it runs on, treated as one problem.
            </h1>
            <p className="text-body text-text-muted mt-6 max-w-xl">
              Most engineering studios stop at the software&apos;s edge and call in someone else for
              the rest. HubZero doesn&apos;t split the problem that way — the team that designs an
              interface is the same one that can put a sensor behind it, because the projects worth
              doing rarely stay on one side of that line for long.
            </p>
          </Reveal>
        </Container>
      </div>

      {/* The practice — one continuous argument, not two matched cards */}
      <Container>
        <div className="max-w-2xl">
          <Reveal>
            <p className="text-caption text-text-muted font-mono">01 — Software Engineering</p>
            <h2 className="text-h1 text-text mt-4 font-normal">Software Engineering</h2>
            <p className="text-body text-text-muted mt-5">
              Web and mobile applications, the backend systems behind them, and the AI-assisted
              automation increasingly threaded through both — built the way production software
              should be, with a rendering strategy chosen per route rather than applied uniformly,
              and a maintenance plan that starts before launch, not after it.
            </p>
            <Link
              href="/services/software"
              className="text-text mt-6 inline-flex items-center gap-1.5 no-underline hover:no-underline hover:opacity-80"
            >
              Explore Software Engineering
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>

        <div className="mt-20 max-w-md sm:mt-24 sm:ml-[14%] lg:mt-28 lg:ml-[22%]">
          <Reveal delayMs={100}>
            <p className="text-caption text-text-muted font-mono">02 — Hardware &amp; Embedded</p>
            <h3 className="text-h2 text-text mt-4 font-normal">Hardware &amp; Embedded</h3>
            <p className="text-body text-text-muted mt-5">
              Embedded systems, IoT integration, and the hardware-software bridge most software-only
              studios structurally can&apos;t offer. The first dedicated hardware case study is
              still in progress; what&apos;s shipped today is real internal R&amp;D, not a
              placeholder.
            </p>
            <Link
              href="/services/hardware"
              className="text-text mt-6 inline-flex items-center gap-1.5 no-underline hover:no-underline hover:opacity-80"
            >
              Explore Hardware &amp; Embedded
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </Container>

      {/* CTA close */}
      <Container className="mt-28 sm:mt-32 lg:mt-40">
        <CtaPanel
          heading="Not sure where your problem sits?"
          primaryLabel="Start a project"
          primaryHref="/contact"
        />
      </Container>
    </div>
  );
}
