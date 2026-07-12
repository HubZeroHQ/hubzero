"use client";

import { useState } from "react";

import { SpineLabel } from "@/components/marketing/homepage/spine";
import { Reveal } from "@/components/marketing/reveal";
import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import { cn } from "@/lib/utils";

interface ArchitectureFact {
  value: string;
  label: string;
  detail: string;
}

/**
 * The Assembly Line's first attached part (`CREATIVE_DIRECTION.md` §13.1,
 * §7.2 rule 2) — real, checkable facts from the one real case study's own
 * published body (`scripts/migrate-content.ts`'s "Under the hood" section of
 * `/work/bhatkal-time-luxe`), not invented for this component. Precision
 * proven the way a hardware product proves it — by exposing real internals —
 * applied honestly to a real software system instead of asserted in prose.
 * Deliberately not a count-up animation: that pattern is common enough
 * across 2026 SaaS marketing sites to read as template, not craft (research
 * synthesis, plan §1). If the case study's own content is ever revised,
 * these six figures need to be checked against it.
 */
const FACTS: ArchitectureFact[] = [
  { value: "64", label: "routes", detail: "Generated at build" },
  { value: "44", label: "API handlers", detail: "Next.js Route Handlers, colocated" },
  { value: "12", label: "data models", detail: "MongoDB via Mongoose" },
  { value: "32", label: "UI components", detail: "Shared across desktop and mobile trees" },
  { value: "11", label: "currencies", detail: "Priced and checked out natively" },
  { value: "5", label: "buying guides", detail: "Published, editorial, not filler" },
];

export function ArchitectureDetail() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <section className="py-16 sm:py-20">
      <Container>
        <Reveal>
          <SpineLabel>The architecture</SpineLabel>
          <h2 className="text-h1 text-text mt-6 max-w-2xl font-semibold text-balance">
            One real system, exposed the way we&apos;d expose a real piece of hardware.
          </h2>
          <p className="text-body text-text-muted mt-4 max-w-xl text-balance">
            Every number below is real and shipped in production for Bhatkal Time Luxe — not a
            claim, a count.
          </p>
        </Reveal>

        <Reveal delayMs={80}>
          <div className="mt-12 grid grid-cols-2 gap-px sm:grid-cols-3 lg:grid-cols-6">
            {FACTS.map((fact, i) => (
              <button
                key={fact.label}
                type="button"
                onMouseEnter={() => setActiveIndex(i)}
                onFocus={() => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(null)}
                onBlur={() => setActiveIndex(null)}
                className="border-border-muted hover:bg-bg-light focus-visible:bg-bg-light flex min-h-32 flex-col items-start gap-1 border p-5 text-left transition-colors duration-150"
              >
                <span className="text-h2 text-text font-mono font-semibold">{fact.value}</span>
                <span className="text-caption text-text-muted font-mono">{fact.label}</span>
                <span
                  className={cn(
                    "text-caption text-text-muted mt-2 transition-opacity duration-150",
                    activeIndex === i ? "opacity-100" : "opacity-0",
                  )}
                >
                  {fact.detail}
                </span>
              </button>
            ))}
          </div>
        </Reveal>

        <Reveal delayMs={140} className="mt-8">
          <Link
            href="/work/bhatkal-time-luxe"
            className="text-body text-text inline-flex items-center gap-2 font-medium no-underline hover:underline"
          >
            Read the full case study
            <span aria-hidden="true">→</span>
          </Link>
        </Reveal>
      </Container>
    </section>
  );
}
