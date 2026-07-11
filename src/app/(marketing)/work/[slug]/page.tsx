import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import "@/lib/cms/collections";

import { ContentRenderer } from "@/components/marketing/blocks/content-renderer";
import { ContributorChips } from "@/components/marketing/blocks/contributor-chips";
import { MediaImage } from "@/components/marketing/media-image";
import { JsonLd } from "@/components/seo/json-ld";
import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import {
  findOnePublished,
  findPublished,
  getPublicTeamMembers,
  resolveCoverImage,
} from "@/lib/cms/public-content";
import { absoluteUrl, pageMetadata } from "@/lib/seo";
import { CaseStudy, type CaseStudyDocument } from "@/models/case-study";
import { withArrayDefault, withCardFieldDefaults } from "@/models/shared/card-fields";

interface CaseStudyPageProps {
  params: Promise<{ slug: string }>;
}

const practiceAreaLabels: Record<string, string> = {
  software: "Software Engineering",
  hardware: "Hardware & Embedded",
  both: "Software + Hardware",
  ai: "AI",
};

// Re-rendered in the background at most once an hour after a request hits a
// stale copy — `publish()`'s `revalidatePath` (`crud-actions.ts`) already
// invalidates this immediately on a real content change, so this is only
// the fallback ceiling, not the primary invalidation path.
export const revalidate = 3600;

async function getCaseStudy(slug: string) {
  const doc = await findOnePublished<CaseStudyDocument>(CaseStudy, { slug });
  // Guarantees `content`/`contributors`/`featured`/`readingTimeMinutes`/
  // `techTags` are always the array/boolean/number shape this page (and
  // `ContentRenderer`) assume — necessary because `.lean()` bypasses schema
  // defaults for any document written before one of these fields existed
  // (`models/shared/card-fields.ts`'s `withCardFieldDefaults`).
  return doc && withArrayDefault(withCardFieldDefaults(doc), "techTags");
}

/** Pre-renders every published case study at build time — the rest of ISR's `revalidate`/`revalidatePath` machinery only has a static page to invalidate once this exists. */
export async function generateStaticParams() {
  const caseStudies = await findPublished<CaseStudyDocument>(CaseStudy);
  return caseStudies.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: CaseStudyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = await getCaseStudy(slug);
  if (!doc) return {};
  const cover = await resolveCoverImage(doc.coverImage ? String(doc.coverImage) : undefined);
  return pageMetadata({
    title: doc.client,
    description: doc.summary,
    path: `/work/${doc.slug}`,
    image: cover ? { url: cover.url, alt: cover.alt } : undefined,
    type: "article",
  });
}

/**
 * The dynamic case-study template `ARCHITECTURE/06_PAGE_SPECIFICATIONS.md`
 * always specified — replaces the one hand-written
 * `work/bhatkal-time-luxe/page.tsx` route now that `CaseStudy` is a real,
 * CMS-authored collection. Renders exactly the fields the schema models
 * (`problem`/`approach`/`result`/`techTags`/`coverImage`) — the hand-written
 * page's richer per-image annotations and "by the numbers" stat block don't
 * have a schema home yet (flagged as tracked future work, the same footing
 * as `CaseStudy.quote`/`relatedTeamMembers`'s existing deferral), so this
 * page is honestly a narrower visual than what it replaces, not a
 * reproduction of it.
 */
export default async function CaseStudyPage({ params }: CaseStudyPageProps) {
  const { slug } = await params;
  const doc = await getCaseStudy(slug);
  if (!doc) notFound();

  const [cover, contributors] = await Promise.all([
    resolveCoverImage(doc.coverImage ? String(doc.coverImage) : undefined),
    getPublicTeamMembers((doc.contributors ?? []).map((id) => String(id))),
  ]);

  return (
    <div className="pb-32">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: doc.client,
          description: doc.summary,
          about: practiceAreaLabels[doc.practiceArea] ?? doc.practiceArea,
          ...(cover ? { image: absoluteUrl(cover.url) } : {}),
        }}
      />
      <div className="pt-20 pb-16 sm:pt-24 lg:pt-28">
        <Container>
          <p className="text-caption text-text-muted font-mono tracking-wide uppercase">
            Case study
          </p>
          <h1 className="text-text mt-6 max-w-3xl text-[clamp(2.25rem,1rem+4.5vw,4.5rem)] leading-[1.08] font-normal tracking-tight">
            {doc.client}
          </h1>
          <p className="text-caption text-text-muted mt-8 font-mono">
            {doc.client} <span aria-hidden="true">·</span> {doc.industry}{" "}
            <span aria-hidden="true">·</span>{" "}
            {practiceAreaLabels[doc.practiceArea] ?? doc.practiceArea}
          </p>
        </Container>

        {cover && (
          <Container size="full" className="mt-14 sm:mt-16 lg:mt-20">
            <div className="mx-auto w-full max-w-6xl">
              <MediaImage
                src={cover.url}
                alt={cover.alt}
                width={cover.width ?? 1600}
                height={cover.height ?? 900}
                sizes="(min-width: 1024px) 72rem, 92vw"
                className="h-auto w-full"
                priority
              />
            </div>
          </Container>
        )}
      </div>

      <div className="mt-8 sm:mt-12 lg:mt-16">
        <ContentRenderer blocks={doc.content} />
      </div>

      {doc.techTags.length > 0 && (
        <Container className="mt-16">
          <p className="text-caption text-text-muted font-mono">{doc.techTags.join(" · ")}</p>
        </Container>
      )}

      {contributors.length > 0 && (
        <div className="mt-16">
          <ContributorChips members={contributors} />
        </div>
      )}

      <Container className="mt-32 sm:mt-40 lg:mt-48">
        <div className="border-border-muted border-t pt-12 text-center">
          <p className="text-h3 text-text font-normal">Building something similar?</p>
          <Link
            href="/contact"
            className="text-accent-text text-h2 mt-6 inline-flex items-center gap-2 font-serif italic no-underline hover:no-underline hover:opacity-80"
          >
            Start a project
            <ArrowUpRight className="size-5 not-italic" aria-hidden="true" />
          </Link>
        </div>
      </Container>
    </div>
  );
}
