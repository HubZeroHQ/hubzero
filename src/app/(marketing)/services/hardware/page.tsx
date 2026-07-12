import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";

import { CtaPanel } from "@/components/marketing/cta-panel";
import { PageHeader } from "@/components/marketing/page-header";
import { Reveal } from "@/components/marketing/reveal";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

const title = "Hardware & Embedded Engineering";
const description =
  "What hardware and embedded engineering at HubZero actually involves — the path a physical signal takes from a sensor to a screen, and the engineering decision at every stage of it.";

export const metadata: Metadata = pageMetadata({ title, description, path: "/services/hardware" });

const stages = [
  {
    n: "01",
    label: "Signal",
    body: "A voltage, a switch state, a pulse train — a sensor's raw output isn't a number yet. Deciding what it means is the first engineering decision on this list, not an afterthought handled later.",
  },
  {
    n: "02",
    label: "Firmware",
    body: "Microcontroller-level code — C, C++, or Python, chosen by the timing budget the hardware actually has, not by default — is where that decision gets made. A misread signal here becomes a wrong reading with no undo.",
  },
  {
    n: "03",
    label: "Transport",
    body: "I2C or UART carry it the short distance from sensor to board. HTTP or a WebSocket carries it the rest of the way — a live connection if someone's waiting on a real-time number, a simple request if they're not.",
  },
  {
    n: "04",
    label: "Interface",
    body: "The same software discipline that builds a client's product: a dashboard, an API, an app. The point where a physical event finally becomes something a person can act on.",
  },
] as const;

/**
 * ARCHITECTURE/06_PAGE_SPECIFICATIONS.md "Services — Hardware & Embedded
 * Engineering": what's included, why this matters, Labs/R&D (summary +
 * link), relevant case studies, CTA. Per DESIGN/00_AI_DESIGN_GUIDE.md §6,
 * this page answers a different question than Services or Software: not
 * "what does HubZero do" (Services) and not "what does the software stack
 * look like" (Software's Interface/System/Automation depth-arc) but "what
 * does it mean to engineer a system that touches the physical world."
 *
 * Composition, deliberately not shared with either sibling: instead of
 * Software's vertical stack of independent prose blocks, this page's core
 * section is one continuous signal path — Signal, Firmware, Transport,
 * Interface — because that connectedness *is* the argument. Hardware,
 * embedded firmware, physical protocols, network delivery, and the
 * software reading the result aren't four services; they're four stages
 * of one problem, and the page's own shape is the proof. No numbered
 * practice list over a texture background, no italic pull-quote (the
 * commissioned review and DESIGN/00 both flag pull-quotes and process
 * lists as the site's most overused devices — this page uses neither).
 *
 * Labs/R&D, per `00_FOUNDER_APPROVAL.md` §8 and `17_COMPANY_STRUCTURE.md`
 * §9: reduced from a full write-up (diagram, dates, long description) to
 * a short editorial summary. The full IoT Sensor Dashboard write-up moves
 * to the future `/labs/[slug]` canonical entry — not built this session —
 * so this section intentionally stops short of re-deriving that page.
 * When `/labs` ships, the paragraph below becomes a link; nothing else on
 * this page needs to change.
 */
export default function HardwareEngineeringPage() {
  return (
    <div className="pb-28 sm:pb-32 lg:pb-40">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: title,
          description,
          provider: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
        }}
      />
      {/* Opening. Bottom padding scales with the breakpoint the same way top
          does (matching /services' opening beat) — previously fixed at
          pb-16 regardless of viewport, which read as cramped going into
          "The path a reading takes" at desktop widths. */}
      <div className="pt-20 pb-20 sm:pt-24 sm:pb-24 lg:pt-28 lg:pb-28">
        <Container>
          <Reveal>
            <PageHeader
              eyebrow="Hardware & Embedded"
              headline="A sensor reading isn't information until an engineered system decides what it means."
              size="large"
              maxWidth="3xl"
              description="Firmware, the protocols that carry a reading off a board, and the software that turns it into something someone can act on — engineered as one system, by one team, not handed between a hardware vendor and a software vendor."
            />
          </Reveal>
        </Container>
      </div>

      {/* The system — one signal path, not a list of three services */}
      <Container>
        <Reveal>
          <p className="text-caption text-text-muted font-mono tracking-wide uppercase">
            The path a reading takes
          </p>
        </Reveal>

        <div className="mt-10">
          {/*
            One list, three deliberately different compositions per
            ARCHITECTURE/16 — not one desktop layout reflowed. Mobile: a
            vertical path with a connecting line, read top to bottom. Tablet:
            a 2x2 grid in normal reading order, un-connected — a wrapped grid
            can't honestly draw one continuous line across two rows, so it
            doesn't try to. Desktop: the full path, left to right, one line.
          */}
          <ol className="relative flex flex-col gap-10 md:grid md:grid-cols-2 md:gap-x-10 md:gap-y-12 lg:flex lg:flex-row lg:gap-8">
            <span
              aria-hidden="true"
              className="bg-border-muted absolute inset-x-0 top-[3px] hidden h-px lg:block"
            />
            {stages.map((stage, i) => (
              <Reveal
                as="li"
                key={stage.n}
                delayMs={i * 60}
                className="relative pl-7 md:pl-0 lg:flex-1 lg:pt-7"
              >
                <span
                  aria-hidden="true"
                  className="bg-accent absolute top-1.5 left-0 size-1.5 rounded-full md:hidden"
                />
                {i < stages.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="bg-border-muted absolute top-4 left-[3px] h-[calc(100%+1.5rem)] w-px md:hidden"
                  />
                )}
                <span
                  aria-hidden="true"
                  className="bg-accent absolute top-0 left-0 hidden size-1.5 rounded-full lg:block"
                />
                <p className="text-caption text-text-muted font-mono">{stage.n}</p>
                <h2 className="text-h3 text-text mt-1 font-normal">{stage.label}</h2>
                <p className="text-body text-text-muted mt-3 max-w-md lg:max-w-[22ch]">
                  {stage.body}
                </p>
              </Reveal>
            ))}
          </ol>
        </div>
      </Container>

      {/* Evidence — Labs, reduced to a summary; then the honest case-study gap */}
      <Container className="mt-24 sm:mt-28 lg:mt-32">
        <div className="border-border-muted border-t pt-12">
          <p className="text-caption text-text-muted font-mono tracking-wide uppercase">
            HubZero Labs
          </p>
          <div className="mt-6 max-w-[var(--content-prose)]">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-h3 text-text font-normal">IoT Sensor Dashboard</h2>
              <Badge className="tracking-normal normal-case">
                Internal R&amp;D — not client work
              </Badge>
            </div>
            <p className="text-body text-text-muted mt-5">
              A real-time environmental monitoring system built internally, end to end, by
              HubZero&apos;s electronics lead — a sensor node, a microcontroller bridge, and a live
              dashboard, following the same signal path above with no client involved. It&apos;s the
              clearest working proof of this practice we can currently show.
            </p>
            <p className="text-caption text-text-muted mt-5 font-mono">
              Arduino <span aria-hidden="true">·</span> Node.js <span aria-hidden="true">·</span>{" "}
              Socket.IO <span aria-hidden="true">·</span> Chart.js <span aria-hidden="true">·</span>{" "}
              Nov 2024 – Jan 2025
            </p>
            <Link
              href="/labs/iot-sensor-dashboard"
              className="text-text mt-6 inline-flex items-center gap-1.5 no-underline hover:no-underline hover:opacity-80"
            >
              Read the full write-up at HubZero Labs
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-12 max-w-[var(--content-prose)]">
            <p className="text-h3 text-text font-normal">
              A dedicated hardware case study is still in progress.
            </p>
            <p className="text-body text-text-muted mt-5">
              When it&apos;s real and complete, it&apos;ll be here, held to the same bar as every
              other case study HubZero publishes. Until then, the path above and the Labs project
              are the most honest proof we can offer.
            </p>
            <Link
              href="/work"
              className="text-text mt-6 inline-flex items-center gap-1.5 no-underline hover:no-underline hover:opacity-80"
            >
              See completed work
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </Container>

      {/* CTA close */}
      <Container className="mt-28 sm:mt-32 lg:mt-40">
        <CtaPanel
          heading="Not sure if this is a hardware problem?"
          primaryLabel="Start a project"
          primaryHref="/contact"
          secondary={{ label: "Looking for the software side?", href: "/services/software" }}
        />
      </Container>
    </div>
  );
}
