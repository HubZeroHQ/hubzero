import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";

import { CtaPanel } from "@/components/marketing/cta-panel";
import { Reveal } from "@/components/marketing/reveal";
import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";

export const metadata: Metadata = {
  title: "Software Engineering",
  description:
    "What software engineering at HubZero actually looks like — the interface, the system behind it, and the automation that runs without anyone watching.",
};

/**
 * ARCHITECTURE/06_PAGE_SPECIFICATIONS.md "Services — Software Engineering":
 * what's included (web apps, backend, AI/automation, UI/UX as integrated
 * capability), relevant case study evidence, CTA. Services (redesigned in
 * PR #4) answers "what does HubZero do" — a capability reference, deliberately
 * shallow. This page answers a different question: "what does software
 * engineering here actually look like," which earns real technical depth
 * Services never attempts.
 *
 * The reading journey follows the shape of a real system rather than a list
 * of parallel bullet points: Interface, then System, then Automation — outer
 * layer to inner layer, plain language to specific engineering vocabulary,
 * so technical depth increases as the page goes on instead of staying flat.
 * One concrete decision (real, sourced from the Bhatkal Time Luxe build) is
 * the page's single "pause" — no italic pull-quote; a `dt`/`dd` fact does
 * the same job with something checkable instead of something quotable.
 *
 * Deliberate conflict, disclosed rather than silently resolved: the section
 * spec above also lists "how engagements typically run." This page omits
 * it. `ARCHITECTURE/07_DESIGN_SYSTEM.md` §8 — dated after `06`, and written
 * specifically because of this exact page — plus the commissioned design
 * review it cites both name the Discovery/Build/Stay process list, repeated
 * near-verbatim on Home, Software, and Hardware, as a concrete instance of
 * the template-repetition problem this redesign effort exists to fix. Home
 * already owns that beat (`ARCHITECTURE/06` "How we work"); repeating it
 * here a third time adds no information the reader doesn't already have.
 * Cut rather than reworded, per the explicit "did we remove more than we
 * added" bar for this session.
 */
export default function SoftwareEngineeringPage() {
  return (
    <div className="pb-28 sm:pb-32 lg:pb-40">
      {/* Opening — the headline previews the reading order itself. Bottom
          padding scales with the breakpoint the same way top does (matching
          /services' opening beat) — previously fixed at pb-16 regardless of
          viewport, which read as cramped at desktop widths where the
          headline itself is largest. */}
      <div className="pt-20 pb-20 sm:pt-24 sm:pb-24 lg:pt-28 lg:pb-28">
        <Container>
          <Reveal>
            <p className="text-caption text-text-muted font-mono tracking-wide uppercase">
              Software Engineering
            </p>
            <h1 className="text-text mt-6 max-w-3xl text-[clamp(2.25rem,1rem+4.5vw,4.5rem)] leading-[1.08] font-normal tracking-tight">
              The interface, the system behind it, and the parts that run without anyone watching.
            </h1>
            <p className="text-body text-text-muted mt-6 max-w-xl">
              Software engineering at HubZero, in the order it actually gets built — what a visitor
              sees first, what decides what they see, and what keeps running after everyone&apos;s
              gone home.
            </p>
          </Reveal>
        </Container>
      </div>

      {/* The stack — three layers, increasing technical depth, not three equal bullets.
          Gap scales past sm (unlike most rhythm spacing here) because the copy's own
          claim is that these are three distinct depth levels, not one list — at desktop
          width the previous 80px gap read as one continuous paragraph flow instead of
          three separate movements. */}
      <Container>
        <div className="max-w-[var(--content-prose)] space-y-16 sm:space-y-20 lg:space-y-28">
          <Reveal>
            <p className="text-caption text-text-muted font-mono tracking-wide uppercase">
              Interface
            </p>
            <p className="text-body text-text-muted mt-4">
              Web and mobile applications — the part a customer actually touches, designed and built
              together rather than handed from a separate design team to an implementation team.
              Production frameworks built for scale, not assembled from a template.
            </p>
          </Reveal>

          <Reveal delayMs={60}>
            <p className="text-caption text-text-muted font-mono tracking-wide uppercase">System</p>
            <p className="text-body text-text-muted mt-4">
              Server logic colocated with the application it serves, not split into a separate
              service that drifts out of sync over time. A modeled data layer with real referential
              integrity — deletes that clean up everything downstream of them, not orphaned records
              waiting to be found later — and authentication enforced at the edge, before a request
              ever reaches a page.
            </p>
          </Reveal>

          <Reveal delayMs={120}>
            <p className="text-caption text-text-muted font-mono tracking-wide uppercase">
              Automation
            </p>
            <p className="text-body text-text-muted mt-4">
              Where a workflow can be meaningfully automated rather than just accelerated, we build
              for it. Internally — not as a client deliverable — we&apos;ve built a
              natural-language-to-SQL system running entirely on locally hosted language models, as
              much to understand where LLM-driven automation is trustworthy as to ship a specific
              feature.
            </p>
          </Reveal>
        </div>
      </Container>

      {/* The pause — one real decision, in detail, not a slogan */}
      <Container className="mt-24 sm:mt-28 lg:mt-32">
        <div className="max-w-[var(--content-prose)]">
          <Reveal>
            <p className="text-caption text-text-muted font-mono tracking-wide uppercase">
              In practice
            </p>
            <dl className="mt-6">
              <dt className="text-h3 text-text font-normal">
                A rendering strategy chosen per route, not applied uniformly
              </dt>
              <dd className="text-body text-text-muted mt-4">
                On Bhatkal Time Luxe: static prerendering for content-stable pages, static
                generation for guide articles, dynamic server rendering for catalog and API routes —
                three strategies, one codebase, chosen deliberately per route rather than defaulted
                across the whole site.
              </dd>
            </dl>
          </Reveal>
        </div>
      </Container>

      {/* Evidence — what that decision actually produces. Anchored to the
          bounded marketing Container, not the bare viewport (ARCHITECTURE/16
          §10's anchoring rule) — the right-weighted asymmetry holds steady
          at every width instead of drifting further right past 1200px. */}
      <Container className="mt-16 sm:mt-20 lg:mt-24">
        <div className="ml-auto w-full max-w-5xl">
          <Image
            src="/case-studies/bhatkal-time-luxe/product-page.webp"
            alt="Bhatkal Time Luxe product detail page — Invicta Reserve watch with price, stock status, and Buy via WhatsApp action"
            width={2552}
            height={1252}
            sizes="(min-width: 1024px) 64rem, 92vw"
            className="h-auto w-full"
          />
        </div>
      </Container>
      <Container className="mt-8">
        <div className="max-w-[var(--content-prose)]">
          <p className="text-caption text-text-muted font-mono">
            Bhatkal Time Luxe — product detail page, Next.js / MongoDB
          </p>
          <p className="text-body text-text-muted mt-6">
            A two-tier image pipeline behind this page took a representative product photo from
            458KB down to 42KB, negotiated automatically per browser — one environment-variable
            toggle away from a full rollback if it were ever needed. It&apos;s the kind of decision
            that doesn&apos;t show up in a screenshot, which is exactly why it&apos;s worth stating
            plainly here.
          </p>
          <Link
            href="/work/bhatkal-time-luxe"
            className="text-text mt-6 inline-flex items-center gap-1.5 no-underline hover:no-underline hover:opacity-80"
          >
            Read the full case study
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </Container>

      {/* CTA close */}
      <Container className="mt-28 sm:mt-32 lg:mt-40">
        <CtaPanel
          heading="Building something like this?"
          primaryLabel="Start a project"
          primaryHref="/contact"
          secondary={{ label: "Looking for the hardware side?", href: "/services/hardware" }}
        />
      </Container>
    </div>
  );
}
