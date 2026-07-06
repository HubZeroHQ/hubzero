import { ArrowUpRight } from "lucide-react";
import Image from "next/image";

import { Reveal } from "@/components/marketing/reveal";
import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import { getFeaturedCaseStudy, resolveCoverImage } from "@/lib/cms/public-content";

const practiceAreaLabels: Record<string, string> = {
  software: "Software",
  hardware: "Hardware",
  both: "Software + Hardware",
  ai: "AI",
};

/**
 * The homepage's trust climax (`ARCHITECTURE/15_HOMEPAGE_DESIGN.md` §7/§9):
 * one real case study, presented editorially. Previously a hand-written
 * component hardcoding "Bhatkal Time Luxe" — now CMS-driven
 * (`ARCHITECTURE/20_CONTENT_BLOCKS.md` §6): `getFeaturedCaseStudy()` reads
 * the first still-published entry in `SiteSettings.featuredCaseStudyIds`
 * when the founder has explicitly curated one (an ordered list, future-
 * proofed for showing more than one without another schema change — this
 * component still renders exactly one, unchanged), falling back to the most
 * recently published `featured: true` Case Study, then to the most recently
 * published Case Study of any kind. No hardcoded slug/id anywhere in this
 * file.
 *
 * Renders nothing if no published Case Study exists yet — an honest empty
 * state (`ARCHITECTURE/17_COMPANY_STRUCTURE.md` §5's discipline applied
 * here), not a broken section referencing content that doesn't exist.
 */
export async function CaseStudy() {
  const doc = await getFeaturedCaseStudy();
  if (!doc) return null;

  const cover = await resolveCoverImage(doc.coverImage ? String(doc.coverImage) : undefined);

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
            {doc.client}
          </h2>
        </Reveal>
      </Container>

      {cover && (
        <Reveal delayMs={120}>
          <Container className="mt-14 sm:mt-16 lg:mt-20">
            {/* Asymmetric placement, not centered — the image runs toward the
                right edge of the same content grid the text above/below uses.
                Anchored to the bounded marketing Container (not the bare
                viewport, per the anchoring rule in ARCHITECTURE/16 §10) so
                the offset holds steady at every width. */}
            <div className="ml-auto w-full max-w-5xl">
              <Image
                src={cover.url}
                alt={cover.alt}
                width={cover.width ?? 2557}
                height={cover.height ?? 1270}
                sizes="(min-width: 1024px) 64rem, 92vw"
                className="h-auto w-full"
                priority
              />
            </div>
          </Container>
        </Reveal>
      )}

      <Container className="mt-16 sm:mt-20 lg:mt-24">
        <div className="max-w-[var(--content-prose)]">
          <Reveal>
            <p className="text-h3 text-text font-serif italic">{doc.summary}</p>
          </Reveal>

          <Reveal delayMs={100}>
            <p className="text-caption text-text-muted mt-8 font-mono">
              {practiceAreaLabels[doc.practiceArea] ?? doc.practiceArea}
              {doc.techTags.length > 0 && (
                <>
                  {" "}
                  <span aria-hidden="true">·</span> {doc.techTags.join(" · ")}
                </>
              )}
            </p>
          </Reveal>

          <Reveal delayMs={140}>
            <Link
              href={`/work/${doc.slug}`}
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
