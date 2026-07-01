import { ArrowUpRight } from "lucide-react";
import Image from "next/image";

import { Reveal } from "@/components/marketing/reveal";
import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";

/**
 * The homepage's trust climax (ARCHITECTURE/15_HOMEPAGE_DESIGN.md §7/§9):
 * the one real case study, presented editorially rather than as a
 * portfolio card. Every fact below (client, stack, timeline, what was
 * built) is the approved fact set from `15_HOMEPAGE_DESIGN.md` §7/§11 —
 * nothing here is an invented metric or outcome.
 *
 * The image is a curated crop of the product-detail panel from the
 * existing `ecommerce-thumbnail.png` collage (per §9/§11 — the collage
 * itself must never be embedded as-is). Source note for future
 * refinement: the only screenshot asset in the repo is a low-resolution
 * thumbnail (~335x187 native); it's presented here at a deliberately
 * contained size with generous surrounding whitespace rather than
 * stretched to a literal full-viewport bleed, which would visibly
 * pixelate. A real, high-resolution capture of the live site should
 * replace this before this beat is considered final — see the
 * end-of-task review for detail.
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
              edge. Native-resolution aspect ratio (335:187) is preserved;
              width is capped rather than stretched full-bleed (see note above). */}
          <div className="ml-auto w-full max-w-3xl">
            <div className="border-border-muted overflow-hidden rounded-lg border shadow-xl">
              <Image
                src="/case-studies/bhatkal-time-luxe-detail.png"
                alt="Bhatkal Time Luxe product detail page — Audemars Piguet Royal Oak listing"
                width={335}
                height={187}
                sizes="(min-width: 1024px) 48rem, 90vw"
                className="h-auto w-full"
              />
            </div>
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
              A local luxury boutique — watches, bags, apparel across a dozen premium brands —
              needed a storefront that didn&apos;t feel like a template dropped over their catalog.
            </p>
            <p className="text-body text-text-muted">
              We built it as a MERN application in about six weeks, with advanced filtering across
              the full multi-brand catalog and Imgix-driven image delivery — so product photography
              loads fast and sharp on every device.
            </p>
            <p className="text-body text-text-muted">
              The result: a real, working storefront a small boutique can actually run — fast,
              filterable, and built to the same standard of care as the products it sells.
            </p>
          </Reveal>

          <Reveal delayMs={100}>
            <p className="text-caption text-text-muted mt-8 font-mono">
              MERN <span aria-hidden="true">·</span> Imgix <span aria-hidden="true">·</span> Apr–May
              2025 <span aria-hidden="true">·</span> ~6 weeks
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
