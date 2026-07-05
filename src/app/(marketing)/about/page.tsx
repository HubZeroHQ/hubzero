import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";

import { Reveal } from "@/components/marketing/reveal";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About",
  description:
    "Why HubZero exists, how the team thinks, and the people who build both the software and the hardware behind it.",
  path: "/about",
});

const thinking = [
  {
    number: "01",
    title: "Specificity over confidence",
    body: "We'd rather say a photo went from 458KB to 42KB than say we build “fast, beautiful” software. A claim any other company could make with a straight face isn't a claim worth making.",
  },
  {
    number: "02",
    title: "The person who scoped it builds it",
    body: "Discovery, architecture, and the actual code or firmware come from the same small set of hands. Nothing gets lost translating a spec to someone who wasn't in the first conversation.",
  },
  {
    number: "03",
    title: "Launch is a milestone, not an exit",
    body: "We size every engagement assuming we're still answering for the system a year later — because we usually are.",
  },
] as const;

const founders = [
  {
    name: "Rifaque",
    role: "Founder",
    bio: "Scopes and leads most engagements personally — full-stack, with a habit of caring more about the system behind the interface than the interface itself.",
    image: "/team/rifaque.jpg",
  },
  {
    name: "Salsabeel",
    role: "Co-founder, Hardware & Embedded",
    bio: "HubZero's electronics lead — embedded systems and IoT, and the hardware half of every combined engagement.",
    image: "/team/salsabeel.jpg",
  },
  {
    name: "Sultan",
    role: "Co-founder, Branding & SEO",
    bio: "Shapes how HubZero's work — and its clients' work — actually gets found.",
    image: "/team/sultan.jpg",
  },
  {
    name: "Iyad",
    role: "Co-founder, UI/UX & Design",
    bio: "Designs the interfaces the engineering underneath has to earn.",
    image: "/team/iyad.jpg",
  },
] as const;

/**
 * About (`/about`) — built to the founder's explicit Round 2 brief, which
 * supersedes the generic "founding story / values / legal status" spec in
 * `ARCHITECTURE/06_PAGE_SPECIFICATIONS.md`: no Mission/Vision/Values/
 * Timeline/Awards, no stock imagery, no stats without evidence. Every fact
 * used here (2024, the Labs project's stack and dates, team roles) is
 * already established and sourced elsewhere — nothing invented for this
 * page. Founder photos are the real, existing team photos already public on
 * the legacy site (`client/public/images/team`), copied to `public/team`.
 *
 * Structural precedent is the Bhatkal Time Luxe case study, not the
 * homepage's component sections — About is the site's other long-form,
 * single-page editorial read, so it borrows that page's convention of real
 * `<h2>` section headings rather than the homepage's caption-as-label
 * pattern. An eyebrow mono caption is added only where the visible headline
 * is a creative line rather than a literal restatement of the section name
 * (matching how the Hardware page pairs a "Labs & R&D" eyebrow with the
 * creative headline "IoT Sensor Dashboard").
 */
export default function AboutPage() {
  return (
    <div className="pb-32">
      {/* 1. Engineering philosophy — the page's opening beat */}
      <div className="pt-20 pb-16 sm:pt-24 lg:pt-28">
        <Container>
          <p className="text-caption text-text-muted font-mono tracking-wide uppercase">About</p>
          <h1 className="text-text mt-6 max-w-3xl text-[clamp(2.25rem,1rem+4.5vw,4.5rem)] leading-[1.08] font-normal tracking-tight">
            We think in systems, not deliverables.
          </h1>
          <p className="text-body text-text-muted mt-6 max-w-xl">
            A system has edges, failure modes, and a person who has to live with it after launch.
            Everything on this page follows from treating engineering that way — starting with why
            HubZero exists at all.
          </p>
        </Container>
      </div>

      {/* 2. Why HubZero exists */}
      <Container className="mt-8 sm:mt-12">
        <div className="max-w-[var(--content-prose)]">
          <Reveal>
            <h2 className="text-h2 text-text font-normal">Why HubZero exists</h2>
          </Reveal>
          <Reveal delayMs={60} className="mt-5 space-y-5">
            <p className="text-body text-text-muted">
              Most engineering work gets split in half before it reaches anyone who can do it well.
              A business with a sensor that needs to reach a dashboard hires a web agency for the
              dashboard and an electronics contractor for the sensor — two vendors, two invoices,
              and a gap between them that nobody actually owns.
            </p>
            <p className="text-body text-text-muted">
              We started HubZero in 2024 to be the team that owns that gap — software engineers and
              an electronics engineer working the same project instead of handing it back and forth.
              We&apos;ve stayed small on purpose. Every engagement we take on is one we can be
              personally accountable for, not one we can barely staff.
            </p>
          </Reveal>
          <Reveal delayMs={120}>
            <p className="text-h3 text-text mt-8 font-serif italic">
              The gap between the sensor and the dashboard is exactly where projects go wrong. We
              built the company to sit inside it, not hand it off.
            </p>
          </Reveal>
        </div>
      </Container>

      {/* 3. How we think — numbered prose over the hairline texture, the
          same device the practice pages use for stated engineering facts. */}
      <Container className="mt-24 sm:mt-28 lg:mt-32">
        <Reveal>
          <h2 className="text-h2 text-text font-normal">How we think</h2>
        </Reveal>
      </Container>
      <div
        className="mt-8 py-4"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, color-mix(in oklch, var(--color-accent) 7%, transparent) 0 1px, transparent 1px 56px)",
        }}
      >
        <Container>
          <div className="max-w-[var(--content-prose)] space-y-14 py-16 sm:py-20 lg:py-24">
            {thinking.map((item, i) => (
              <Reveal key={item.number} delayMs={i * 60}>
                <p className="text-caption text-text-muted font-mono">{item.number}</p>
                <h3 className="text-h3 text-text mt-3 font-normal">{item.title}</h3>
                <p className="text-body text-text-muted mt-4">{item.body}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </div>

      {/* 4. Software × Hardware — the asymmetric two-panel device from the
          homepage's WhatWeDo / /services, reused here around why the split
          exists rather than what each side includes. */}
      <Container className="mt-24 sm:mt-28 lg:mt-32">
        <Reveal>
          <p className="text-caption text-text-muted font-mono tracking-wide uppercase">
            Software &times; Hardware
          </p>
          <h2 className="text-h2 text-text mt-4 max-w-xl font-normal">
            One team, both sides of the wire.
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-y-10 lg:mt-14 lg:grid-cols-12 lg:gap-x-10">
          <Reveal className="lg:col-span-7">
            <div
              className="relative -mx-7 px-7 py-10 sm:-mx-10 sm:px-10 sm:py-12"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, color-mix(in oklch, var(--color-accent) 9%, transparent) 0 1px, transparent 1px 56px)",
              }}
            >
              <p className="text-body text-text-muted">
                A sensor reading isn&apos;t useful until it reaches a screen someone can act on. A
                screen isn&apos;t trustworthy if the sensor behind it is flaky. Most agencies solve
                one half and gesture at the other.
              </p>
            </div>
          </Reveal>
          <Reveal delayMs={100} className="lg:col-span-5 lg:mt-10">
            <div
              className="relative -mx-7 px-7 py-10 sm:-mx-10 sm:px-10 sm:py-12"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, color-mix(in oklch, var(--color-accent) 16%, transparent) 1px, transparent 0)",
                backgroundSize: "22px 22px",
              }}
            >
              <p className="text-body text-text-muted">
                HubZero&apos;s electronics engineer works the same projects, at the same table, as
                the software engineers — not a subcontractor pulled in once hardware becomes
                unavoidable.
              </p>
              <Link
                href="/services"
                className="text-text mt-6 inline-flex items-center gap-1.5 no-underline hover:no-underline hover:opacity-80"
              >
                See how the practices split
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </Reveal>
        </div>
      </Container>

      {/* 5. Labs & Engineering Curiosity — the real, founder-approved
          interim proof project (`00_FOUNDER_APPROVAL.md` §2), framed here
          around why it exists rather than repeating the Hardware page's
          system diagram. */}
      <Container className="mt-24 sm:mt-28 lg:mt-32">
        <p className="text-caption text-text-muted font-mono tracking-wide uppercase">
          Labs &amp; Engineering Curiosity
        </p>
        <div className="mt-6 max-w-[var(--content-prose)]">
          <Reveal>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-h2 text-text font-normal">
                An IoT sensor dashboard, built for no client.
              </h2>
              <Badge>Internal R&amp;D &mdash; not client work</Badge>
            </div>
          </Reveal>
          <Reveal delayMs={60} className="mt-5 space-y-5">
            <p className="text-body text-text-muted">
              The most recent example: an Arduino node streaming live environmental data over
              WebSockets to a browser dashboard, built between November 2024 and January 2025.
              Nobody commissioned it.
            </p>
            <p className="text-body text-text-muted">
              It exists because the fastest way to trust a hardware-software bridge is to build one
              and watch it run for a few months — and because a new sensor protocol or dashboard
              pattern gets tested here first, not on a client&apos;s time.
            </p>
          </Reveal>
          <Reveal delayMs={100}>
            <p className="text-caption text-text-muted mt-6 font-mono">
              Arduino <span aria-hidden="true">&middot;</span> Node.js{" "}
              <span aria-hidden="true">&middot;</span> Socket.IO{" "}
              <span aria-hidden="true">&middot;</span> Chart.js{" "}
              <span aria-hidden="true">&middot;</span>
              {" Nov 2024 – Jan 2025"}
            </p>
            <Link
              href="/services/hardware"
              className="text-text mt-6 inline-flex items-center gap-1.5 no-underline hover:no-underline hover:opacity-80"
            >
              See the full build
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </Container>

      {/* 6. Founders — real names, real roles, real (existing) photos.
          A flowing list, not a card grid: no borders, no shadows, no
          skill bars. */}
      <Container className="mt-24 sm:mt-28 lg:mt-32">
        <Reveal>
          <p className="text-caption text-text-muted font-mono tracking-wide uppercase">Founders</p>
          <h2 className="text-h2 text-text mt-4 max-w-xl font-normal">
            The people you&apos;d actually be working with.
          </h2>
        </Reveal>

        <div className="mt-14 space-y-14 sm:mt-16">
          {founders.map((founder, i) => (
            <Reveal
              key={founder.name}
              delayMs={i * 70}
              className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8"
            >
              <div className="size-20 shrink-0 overflow-hidden rounded-sm sm:size-24">
                <Image
                  src={founder.image}
                  alt={founder.name}
                  width={480}
                  height={480}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="max-w-lg">
                <h3 className="text-h3 text-text font-normal">{founder.name}</h3>
                <p className="text-caption text-text-muted mt-1 font-mono">{founder.role}</p>
                <p className="text-body text-text-muted mt-3">{founder.bio}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>

      {/* 7. Closing editorial CTA — bespoke copy, not a reuse of the
          homepage's CtaClose line; same left-aligned border-top treatment
          the Services/Software/Hardware pages close on. */}
      <Container className="mt-32 sm:mt-40 lg:mt-48">
        <div className="border-border-muted border-t pt-12">
          <div className="max-w-2xl">
            <Reveal>
              <p className="text-h3 text-text font-normal">
                If your project is honestly split between a screen and a sensor —
              </p>
            </Reveal>
            <Reveal delayMs={60}>
              <p className="text-body text-text-muted mt-4">
                or you&apos;re not sure which side it&apos;s on — that conversation is easier to
                have now that you know how we think about both.
              </p>
            </Reveal>
            <Reveal delayMs={120}>
              <Link
                href="/contact"
                className="text-accent text-h2 mt-8 inline-flex items-center gap-2 font-serif italic no-underline hover:no-underline hover:opacity-80"
              >
                Start a project
                <ArrowUpRight className="size-5 not-italic" aria-hidden="true" />
              </Link>
            </Reveal>
          </div>
        </div>
      </Container>
    </div>
  );
}
