import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";

import { Reveal } from "@/components/marketing/reveal";
import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";

export const metadata: Metadata = {
  title: "Software Engineering",
  description:
    "Web and mobile applications, the backend systems behind them, and the AI-assisted automation threaded through both — built by HubZero as one connected practice.",
};

const practice = [
  {
    number: "01",
    title: "Web & mobile applications",
    body: "Production applications built on frameworks designed for scale, not assembled from a template — server-rendered by default, with rendering strategy chosen deliberately per route rather than applied uniformly. Bhatkal Time Luxe runs static prerendering for content-stable pages, static generation for its guide articles, and dynamic server rendering for catalog and API routes, in the same codebase.",
  },
  {
    number: "02",
    title: "Backend systems & data",
    body: "Server logic colocated with the application it serves instead of split into a separate service that drifts out of sync — route handlers, a modeled data layer with real referential integrity (cascade-safe deletes across join tables, not orphaned records), and authentication enforced at the edge before a request reaches a page, not after.",
  },
  {
    number: "03",
    title: "AI-assisted automation",
    body: "Where a workflow can be meaningfully automated rather than just accelerated, we build for it. Internally — not as a client deliverable — we've built a natural-language-to-SQL system running entirely on locally hosted language models, as much to understand where LLM-driven automation is trustworthy as to ship a specific feature.",
  },
] as const;

/**
 * ARCHITECTURE/06_PAGE_SPECIFICATIONS.md "Services — Software Engineering":
 * what's included, how engagements run, case study links (Software tag), CTA.
 * Built editorially — numbered prose blocks, not an icon/feature-card grid —
 * per the founder's Round 2 direction for the homepage, carried forward here
 * as the same design language rather than reverting to an agency template.
 *
 * The hairline-grid texture from `WhatWeDo`'s Software panel is this page's
 * own visual signature, reused rather than invented anew — a quiet thread
 * connecting the homepage's brief mention to this page's depth.
 */
export default function SoftwareEngineeringPage() {
  return (
    <div className="pb-32">
      {/* Hero */}
      <div className="pt-20 pb-16 sm:pt-24 lg:pt-28">
        <Container>
          <p className="text-caption text-text-muted font-mono tracking-wide uppercase">
            Services — 01
          </p>
          <h1 className="text-text mt-6 max-w-3xl text-[clamp(2.25rem,1rem+4.5vw,4.5rem)] leading-[1.08] font-normal tracking-tight">
            The web, the backend, and the layer of automation between them.
          </h1>
          <p className="text-body text-text-muted mt-6 max-w-xl">
            We design and build production software — application frontends, the systems behind
            them, and the AI-assisted automation increasingly threaded through both — as one
            connected practice, not three separate vendors.
          </p>
          <p className="text-caption text-text-muted mt-8 font-mono">
            Web &amp; mobile <span aria-hidden="true">·</span> Backend systems{" "}
            <span aria-hidden="true">·</span> AI-assisted automation{" "}
            <span aria-hidden="true">·</span> UI/UX
          </p>
        </Container>
      </div>

      {/* The practice — three numbered prose blocks over the hairline texture */}
      <div
        className="py-4"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, color-mix(in oklch, var(--color-accent) 7%, transparent) 0 1px, transparent 1px 56px)",
        }}
      >
        <Container>
          <div className="max-w-[var(--content-prose)] space-y-14 py-16 sm:py-20 lg:py-24">
            {practice.map((item, i) => (
              <Reveal key={item.number} delayMs={i * 60}>
                <p className="text-caption text-text-muted font-mono">{item.number}</p>
                <h2 className="text-h2 text-text mt-3 font-normal">{item.title}</h2>
                <p className="text-body text-text-muted mt-4">{item.body}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </div>

      {/* The philosophy — the one serif slow-down moment on this page */}
      <Container className="mt-24 sm:mt-28 lg:mt-32">
        <Reveal>
          <p className="text-h3 text-text max-w-2xl font-serif italic">
            The same engineers who scope a project build it, and stay on it after it ships.
          </p>
        </Reveal>
      </Container>

      {/* Evidence — a curated detail from the one real engagement, not a case-study rerun */}
      <Container size="full" className="mt-16 sm:mt-20 lg:mt-24">
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

      {/* Process */}
      <Container className="mt-24 sm:mt-28 lg:mt-32">
        <div className="lg:ml-auto lg:max-w-xl">
          <Reveal>
            <p className="text-caption text-text-muted font-mono tracking-wide uppercase">
              How an engagement runs
            </p>
          </Reveal>
          <ol className="mt-8 space-y-10">
            {[
              {
                n: "01",
                t: "Discovery",
                b: "A scoped conversation that establishes whether the work is frontend, backend, AI-assisted automation, or all three — before anything is estimated.",
              },
              {
                n: "02",
                t: "Build",
                b: "One team across the stack. The engineer who designed the data model is the same one who can explain why a page renders the way it does.",
              },
              {
                n: "03",
                t: "Stay",
                b: "Software drifts — dependencies age, traffic patterns change. We stay on for the maintenance that keeps it working, not just the delivery.",
              },
            ].map((step, i) => (
              <Reveal key={step.n} as="li" delayMs={i * 90}>
                <p className="text-caption text-text-muted font-mono">{step.n}</p>
                <h3 className="text-h3 text-text mt-1 font-normal">{step.t}</h3>
                <p className="text-body text-text-muted mt-2 max-w-md">{step.b}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </Container>

      {/* CTA close */}
      <Container className="mt-32 sm:mt-40 lg:mt-48">
        <div className="border-border-muted border-t pt-12">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-h3 text-text font-normal">Building something like this?</p>
              <Link
                href="/contact"
                className="text-accent text-h2 mt-4 inline-flex items-center gap-2 font-serif italic no-underline hover:no-underline hover:opacity-80"
              >
                Start a project
                <ArrowUpRight className="size-5 not-italic" aria-hidden="true" />
              </Link>
            </div>
            <Link
              href="/services/hardware"
              tone="muted"
              className="hover:text-text inline-flex items-center gap-1.5 no-underline hover:no-underline"
            >
              Looking for the hardware side?
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
