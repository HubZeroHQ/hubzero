import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";

import { Reveal } from "@/components/marketing/reveal";
import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Software Engineering and Hardware & Embedded Engineering — two co-equal practices at HubZero, engineered as one team rather than run as separate vendors.",
};

interface Practice {
  number: string;
  name: string;
  href: string;
  body: string;
  texture: string;
  textureSize?: string;
}

const practices: Practice[] = [
  {
    number: "01",
    name: "Software Engineering",
    href: "/services/software",
    body: "Web and mobile applications, the backend systems behind them, and the AI-assisted automation threaded through both.",
    texture:
      "repeating-linear-gradient(90deg, color-mix(in oklch, var(--color-accent) 9%, transparent) 0 1px, transparent 1px 56px)",
  },
  {
    number: "02",
    name: "Hardware & Embedded Engineering",
    href: "/services/hardware",
    body: "Embedded systems, IoT integration, and the hardware-software bridge most software agencies can't touch.",
    texture:
      "radial-gradient(circle at 1px 1px, color-mix(in oklch, var(--color-accent) 14%, transparent) 1px, transparent 0)",
    textureSize: "22px 22px",
  },
];

/**
 * ARCHITECTURE/06_PAGE_SPECIFICATIONS.md "Services overview" (`/services`):
 * a clean IA/SEO parent for the two real service pages — states the
 * two-practice structure, links to each, and names how engagements
 * typically combine both. Legacy had no equivalent (four disconnected,
 * shallow pages), so this is new rather than rebuilt.
 *
 * Reuses the hairline/dot-grid textures established on the homepage's
 * `WhatWeDo` panels and carried into each individual service page, so the
 * visual signature reads as one continuous thread rather than three
 * unrelated treatments of the same two practice areas.
 */
export default function ServicesPage() {
  return (
    <div className="pb-32">
      <div className="pt-20 pb-16 sm:pt-24 lg:pt-28">
        <Container>
          <p className="text-caption text-text-muted font-mono tracking-wide uppercase">Services</p>
          <h1 className="text-text mt-6 max-w-2xl text-[clamp(2.25rem,1rem+4.5vw,4.5rem)] leading-[1.08] font-normal tracking-tight">
            Two disciplines, engineered as one practice.
          </h1>
          <p className="text-body text-text-muted mt-6 max-w-xl">
            HubZero runs software and hardware engineering as co-equal practices, not a software
            vendor with an electronics contractor bolted on. Most engagements draw on one side more
            than the other; the ones that draw on both are exactly where this structure earns its
            keep — one team, not a handoff between two.
          </p>
        </Container>
      </div>

      <Container>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
          {practices.map((practice, i) => (
            <Reveal key={practice.number} delayMs={i * 80}>
              <Link
                href={practice.href}
                tone="muted"
                className="group relative -mx-7 block px-7 py-10 no-underline hover:no-underline sm:-mx-10 sm:px-10 sm:py-12"
                style={{
                  backgroundImage: practice.texture,
                  backgroundSize: practice.textureSize,
                }}
              >
                <p className="text-caption text-text-muted font-mono">
                  {practice.number} — {practice.name}
                </p>
                <h2 className="text-h2 text-text mt-4 font-normal">{practice.name}</h2>
                <p className="text-body text-text-muted mt-5 max-w-sm">{practice.body}</p>
                <span className="text-text mt-8 inline-flex items-center gap-1.5 group-hover:opacity-80">
                  Explore {practice.name}
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>

      <Container className="mt-24 sm:mt-28 lg:mt-32">
        <Reveal>
          <p className="text-h3 text-text max-w-2xl font-serif italic">
            The projects worth doing rarely stay on one side of this line for long.
          </p>
        </Reveal>
      </Container>

      <Container className="mt-24 sm:mt-28 lg:mt-32">
        <div className="border-border-muted border-t pt-12">
          <p className="text-h3 text-text font-normal">Not sure which side yours needs?</p>
          <Link
            href="/contact"
            className="text-accent text-h3 mt-4 inline-flex items-center gap-2 font-serif italic no-underline hover:no-underline hover:opacity-80"
          >
            Start a project
            <ArrowUpRight className="size-4 not-italic" aria-hidden="true" />
          </Link>
        </div>
      </Container>
    </div>
  );
}
