import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";

import { CircuitConnector } from "@/components/marketing/circuit-motif";
import { Reveal } from "@/components/marketing/reveal";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";

export const metadata: Metadata = {
  title: "Hardware & Embedded Engineering",
  description:
    "Embedded systems, IoT integration, and the hardware-software bridge most software agencies can't touch — HubZero's electronics practice.",
};

const practice = [
  {
    number: "01",
    title: "Embedded systems",
    body: "Microcontroller-level firmware for Arduino and Raspberry Pi platforms — the layer where code meets physical inputs and outputs directly, written in C, C++, or Python depending on what the hardware and timing constraints actually call for, not a default stack applied regardless of the problem.",
  },
  {
    number: "02",
    title: "IoT integration",
    body: "A sensor reading isn't useful until it reaches somewhere a person or a system can act on it. This is the connective layer — I2C and UART at the hardware boundary, HTTP APIs and WebSockets carrying it the rest of the way — so a physical measurement becomes a live number on a screen, not a value trapped on a board.",
  },
  {
    number: "03",
    title: "Hardware-software bridging",
    body: "The practice most software-only agencies structurally can't offer: an electronics engineer and a web engineer on the same team, solving one problem together, instead of a software vendor guessing at what a separate hardware contractor meant.",
  },
] as const;

/**
 * ARCHITECTURE/06_PAGE_SPECIFICATIONS.md "Services — Hardware & Embedded
 * Engineering": what's included, why it matters, Labs/R&D (the interim
 * credibility mechanism approved in `00_FOUNDER_APPROVAL.md` §2 for a
 * practice area with no client case study yet), relevant case studies, CTA.
 *
 * Every technical claim about the Labs/R&D project below is sourced from
 * `client/src/data/salsabeel.json` (HubZero's electronics lead's own,
 * real, previously-published project record) — nothing here is invented.
 * It is labeled non-client work throughout, never implied to be a paid
 * engagement.
 */
export default function HardwareEngineeringPage() {
  return (
    <div className="pb-32">
      {/* Hero */}
      <div className="pt-20 pb-16 sm:pt-24 lg:pt-28">
        <Container>
          <p className="text-caption text-text-muted font-mono tracking-wide uppercase">
            Services — 02
          </p>
          <h1 className="text-text mt-6 max-w-3xl text-[clamp(2.25rem,1rem+4.5vw,4.5rem)] leading-[1.08] font-normal tracking-tight">
            The hardware-software bridge most software agencies can&apos;t touch.
          </h1>
          <p className="text-body text-text-muted mt-6 max-w-xl">
            Embedded systems, IoT integration, and the protocols that connect a physical sensor to a
            web dashboard — engineered by the same team building the software layer, not handed off
            between vendors.
          </p>
          <p className="text-caption text-text-muted mt-8 font-mono">
            Embedded systems <span aria-hidden="true">·</span> IoT integration{" "}
            <span aria-hidden="true">·</span> Hardware-software bridging
          </p>
        </Container>
      </div>

      {/* The practice — three numbered prose blocks over a dot-grid (perf-board) texture */}
      <div
        className="py-4"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, color-mix(in oklch, var(--color-accent) 12%, transparent) 1px, transparent 0)",
          backgroundSize: "22px 22px",
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

      {/* Why this matters — the one serif slow-down moment on this page */}
      <Container className="mt-24 sm:mt-28 lg:mt-32">
        <Reveal>
          <p className="text-h3 text-text max-w-2xl font-serif italic">
            A business that doesn&apos;t know whether its problem is hardware or software is exactly
            who this practice exists for.
          </p>
        </Reveal>
        <Reveal delayMs={60} className="mt-6 max-w-[var(--content-prose)]">
          <p className="text-body text-text-muted">
            Most small businesses with a physical product don&apos;t arrive with the word
            &quot;embedded&quot; already in hand — they arrive with a device that needs to talk to
            an app, a sensor that needs to feed a dashboard, or a process that&apos;s still manual
            because no one on their existing team touches hardware. Most web agencies stop at the
            software half. This is the co-equal practice that doesn&apos;t.
          </p>
        </Reveal>
      </Container>

      {/* Labs / R&D — founder-approved interim proof mechanism */}
      <Container className="mt-24 sm:mt-28 lg:mt-32">
        <p className="text-caption text-text-muted font-mono tracking-wide uppercase">
          Labs &amp; R&amp;D
        </p>
        <div className="mt-6 max-w-[var(--content-prose)]">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-h2 text-text font-normal">IoT Sensor Dashboard</h2>
            <Badge>Internal R&amp;D — not client work</Badge>
          </div>
          <p className="text-body text-text-muted mt-5">
            A real-time environmental monitoring system built internally by HubZero&apos;s
            electronics lead: an Arduino-based sensor node streams live readings over WebSockets to
            a Node.js service, rendered as a live-updating dashboard in the browser.
          </p>
          <p className="text-caption text-text-muted mt-6 font-mono">
            Arduino <span aria-hidden="true">·</span> Node.js <span aria-hidden="true">·</span>{" "}
            Socket.IO <span aria-hidden="true">·</span> Chart.js <span aria-hidden="true">·</span>{" "}
            Nov 2024 – Jan 2025
          </p>
        </div>

        {/* A system diagram in place of a screenshot — showing the actual data
            path, not a stock illustration (Design System §7). Real HTML text
            throughout (not text baked into an SVG viewBox) so labels scale
            with the type system instead of shrinking illegibly on narrow
            screens; only the connector dots/lines are drawn. Stacks
            vertically on mobile, runs left-to-right from `sm` up. */}
        <ol className="mt-12 flex max-w-3xl flex-col gap-6 sm:flex-row sm:gap-0">
          {[
            { label: "Sensor", meta: "Arduino, I2C" },
            { label: "Bridge", meta: "UART → WebSocket" },
            { label: "Service", meta: "Node.js, Socket.IO" },
            { label: "Dashboard", meta: "Chart.js, live" },
          ].map((stage, i, arr) => (
            <li key={stage.label} className="relative pl-6 sm:flex-1 sm:pl-0">
              <span
                aria-hidden="true"
                className="bg-accent absolute top-1.5 left-0 size-1.5 rounded-full sm:hidden"
              />
              {i < arr.length - 1 && (
                <span
                  aria-hidden="true"
                  className="bg-border-muted absolute top-4 left-[3px] h-[calc(100%-0.25rem)] w-px sm:hidden"
                />
              )}
              <div className="hidden items-center sm:flex">
                <span aria-hidden="true" className="bg-accent size-1.5 shrink-0 rounded-full" />
                {i < arr.length - 1 && (
                  <span aria-hidden="true" className="bg-border-muted mx-2 h-px flex-1" />
                )}
              </div>
              <p className="text-caption text-text mt-3 font-mono">{stage.label}</p>
              <p className="text-caption text-text-muted mt-1 font-mono">{stage.meta}</p>
            </li>
          ))}
        </ol>

        <p className="text-body text-text-muted mt-8 max-w-[var(--content-prose)]">
          This is shown because it&apos;s real, working proof of the hardware-software bridge — not
          a mockup, and not a paid engagement. It&apos;s the same standard we hold client work to
          before a client is ever involved.
        </p>
      </Container>

      {/* Case studies — honest status, no fabricated client work */}
      <Container className="mt-24 sm:mt-28 lg:mt-32">
        <div className="border-border-muted border-t pt-12">
          <p className="text-h3 text-text max-w-xl font-normal">
            The first dedicated hardware case study is still in progress.
          </p>
          <p className="text-body text-text-muted mt-5 max-w-[var(--content-prose)]">
            When it&apos;s real and complete, it&apos;ll be here, held to the same bar as every
            other case study HubZero publishes. Until then, the practice above and the Labs/R&amp;D
            work is the most honest proof we can offer — and a conversation is the fastest way to
            find out whether we&apos;re a fit for what you&apos;re building.
          </p>
          <Link
            href="/work"
            className="text-text mt-6 inline-flex items-center gap-1.5 no-underline hover:no-underline hover:opacity-80"
          >
            See completed work
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </Container>

      {/* Process — the circuit motif's connective use fits literally here */}
      <Container className="mt-24 sm:mt-28 lg:mt-32">
        <div className="lg:ml-auto lg:max-w-xl">
          <Reveal>
            <p className="text-caption text-text-muted font-mono tracking-wide uppercase">
              How an engagement runs
            </p>
          </Reveal>

          <div className="relative mt-8 pl-12">
            <CircuitConnector className="absolute top-1 left-0 h-[calc(100%-0.5rem)] w-6" />
            <ol className="space-y-10">
              {[
                {
                  n: "01",
                  t: "Discovery",
                  b: "We figure out which layer the problem actually lives in — firmware, board-level integration, or the connection between a device and the software using its data — before a part is ordered or a line of code is written.",
                },
                {
                  n: "02",
                  t: "Build",
                  b: "Embedded and software work happen inside the same team, so a firmware decision and a dashboard decision get made by people talking to each other directly, not relayed through a spec document.",
                },
                {
                  n: "03",
                  t: "Stay",
                  b: "Hardware ages differently than software — firmware needs updates, a device revision changes the code downstream of it. We stay on for both, not just the parts that are easy to patch remotely.",
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
        </div>
      </Container>

      {/* CTA close */}
      <Container className="mt-32 sm:mt-40 lg:mt-48">
        <div className="border-border-muted border-t pt-12">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-h3 text-text font-normal">
                Not sure if this is a hardware problem?
              </p>
              <Link
                href="/contact"
                className="text-accent text-h2 mt-4 inline-flex items-center gap-2 font-serif italic no-underline hover:no-underline hover:opacity-80"
              >
                Start a project
                <ArrowUpRight className="size-5 not-italic" aria-hidden="true" />
              </Link>
            </div>
            <Link
              href="/services/software"
              tone="muted"
              className="hover:text-text inline-flex items-center gap-1.5 no-underline hover:no-underline"
            >
              Looking for the software side?
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
