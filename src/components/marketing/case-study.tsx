import { ArrowUpRight } from "lucide-react";
import Image from "next/image";

import { Reveal } from "@/components/marketing/reveal";
import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";

/**
 * The homepage's trust climax (ARCHITECTURE/15_HOMEPAGE_DESIGN.md §7/§9):
 * the one real case study, presented editorially rather than as a
 * portfolio card. Every fact below is sourced from
 * `docs/research/PROJECT_CASE_STUDY_ANALYSIS_BHATKAL_TIME_LUXE.md` §4/§6/§8
 * — nothing here is an invented metric or outcome. The build month/duration
 * that document's own confidentiality note flags as unverifiable against
 * this repo's git history (the "April 2025" instruction vs. the earliest
 * corroborating commit) is deliberately left off; only the year is stated.
 *
 * The image is the official `hero-homepage.webp` capture supplied for this
 * case study (per task brief — real assets replace the previous low-
 * resolution placeholder crop). Presented at native aspect ratio, no
 * browser-chrome mockup, no card/border framing — the screenshot's own
 * editorial typography and gold accent are the presentation.
 */
export function CaseStudy() {
  return (
    <div className="pt-32 pb-28 sm:pt-40 sm:pb-36 lg:pt-52 lg:pb-44">
      <Container>
        <Reveal>
          <p className="text-caption text-text-muted font-mono tracking-wide uppercase">
            Featured case study
          </p>
        </Reveal>
        <Reveal delayMs={60}>
          <h2 className="text-text mt-4 text-[clamp(2rem,1rem+4vw,4rem)] leading-[1.1] font-normal tracking-tight">
            Bhatkal Time Luxe
          </h2>
        </Reveal>
      </Container>

      <Reveal delayMs={120}>
        <Container size="full" className="mt-14 sm:mt-16 lg:mt-20">
          {/* Asymmetric placement, not centered — the image runs toward the
              right edge of the wider container, the text column below sits
              back at the default content width, so the two don't share an
              edge. Native-resolution aspect ratio (2557:1270) is preserved. */}
          <div className="ml-auto w-full max-w-5xl">
            <Image
              src="/case-studies/bhatkal-time-luxe/hero-homepage.webp"
              alt="Bhatkal Time Luxe homepage — dark editorial storefront with gold accent and a featured Rolex Datejust listing"
              width={2557}
              height={1270}
              sizes="(min-width: 1024px) 64rem, 92vw"
              className="h-auto w-full"
              priority
            />
          </div>
        </Container>
      </Reveal>

      <Container className="mt-16 sm:mt-20 lg:mt-24">
        <div className="max-w-[var(--content-prose)]">
          <Reveal>
            <p className="text-h3 text-text font-serif italic">
              Built to feel as considered as the watches it sells.
            </p>
          </Reveal>

          <Reveal delayMs={60} className="mt-8 space-y-5">
            <p className="text-body text-text-muted">
              A luxury watch retailer needed a storefront that didn&apos;t feel like a template
              dropped over their catalog — plus a back office their own staff could run without
              calling a developer.
            </p>
            <p className="text-body text-text-muted">
              We built it on Next.js and MongoDB, with full-catalog search and filtering,
              WhatsApp-based checkout, and a two-tier Cloudinary-and-CDN image pipeline that took a
              representative product photo from 458KB down to 42KB — without touching a line of page
              markup.
            </p>
            <p className="text-body text-text-muted">
              The result: a platform Bhatkal Time Luxe runs independently — catalog, pricing, and
              homepage curation, all from its own admin panel.
            </p>
          </Reveal>

          <Reveal delayMs={100}>
            <p className="text-caption text-text-muted mt-8 font-mono">
              Next.js <span aria-hidden="true">·</span> MongoDB <span aria-hidden="true">·</span>{" "}
              Cloudinary <span aria-hidden="true">·</span> 2025
            </p>
          </Reveal>

          <Reveal delayMs={140}>
            <Link
              href="/work/bhatkal-time-luxe"
              className="text-text mt-10 inline-flex items-center gap-1.5 no-underline hover:no-underline hover:opacity-80"
            >
              Read the full case study
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </Container>
    </div>
  );
}
