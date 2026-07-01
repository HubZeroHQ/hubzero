import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";

import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import { WorkGrid } from "@/components/work/work-grid";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Real, completed engineering work from HubZero — every project here was worth doing.",
};

/**
 * ARCHITECTURE/06_PAGE_SPECIFICATIONS.md "Work — index": intro line
 * (selectivity framing), filter by practice area, case study cards, CTA.
 * Built as a real, filterable list from day one so it scales from one case
 * study to many without a redesign.
 */
export default function WorkPage() {
  return (
    <div className="pt-16 pb-28 sm:pt-20 lg:pt-24">
      <Container>
        <p className="text-caption text-text-muted font-mono tracking-wide uppercase">Work</p>
        <h1 className="text-text mt-4 max-w-2xl text-[clamp(2rem,1rem+4vw,3.5rem)] leading-[1.1] font-normal tracking-tight">
          Every project here was worth doing.
        </h1>
        <p className="text-body text-text-muted mt-6 max-w-xl">
          HubZero is selective about the work it takes on. What follows isn&apos;t a high-volume
          portfolio — it&apos;s the real, completed engineering behind it.
        </p>
      </Container>

      <Container className="mt-16 lg:mt-20">
        <WorkGrid />
      </Container>

      <Container className="mt-24 lg:mt-32">
        <div className="border-border-muted border-t pt-12">
          <p className="text-h3 text-text font-normal">Have something like this to build?</p>
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
