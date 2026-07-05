import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import "@/lib/cms/collections";

import { RichText } from "@/components/marketing/rich-text";
import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import { findOnePublished, resolveCoverImage } from "@/lib/cms/public-content";
import { CaseStudy, type CaseStudyDocument } from "@/models/case-study";

interface CaseStudyPageProps {
  params: Promise<{ slug: string }>;
}

const practiceAreaLabels: Record<string, string> = {
  software: "Software Engineering",
  hardware: "Hardware & Embedded",
  both: "Software + Hardware",
  ai: "AI",
};

async function getCaseStudy(slug: string) {
  return findOnePublished<CaseStudyDocument>(CaseStudy, { slug });
}

export async function generateMetadata({ params }: CaseStudyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = await getCaseStudy(slug);
  if (!doc) return {};
  return {
    title: doc.client,
    description: doc.result.split("\n")[0]?.slice(0, 200),
  };
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

  const cover = await resolveCoverImage(doc.coverImage ? String(doc.coverImage) : undefined);

  return (
    <div className="pb-32">
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
            <span aria-hidden="true">·</span> {practiceAreaLabels[doc.practiceArea] ?? doc.practiceArea}
          </p>
        </Container>

        {cover && (
          <Container size="full" className="mt-14 sm:mt-16 lg:mt-20">
            <div className="mx-auto w-full max-w-6xl">
              <Image
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

      <Container className="mt-8 sm:mt-12 lg:mt-16">
        <div className="max-w-[var(--content-prose)]">
          <h2 className="text-h2 text-text font-normal">The brief</h2>
          <RichText>{doc.problem}</RichText>
        </div>
      </Container>

      <Container className="mt-24 sm:mt-28 lg:mt-32">
        <div className="max-w-[var(--content-prose)]">
          <h2 className="text-h2 text-text font-normal">Approach</h2>
          <RichText>{doc.approach}</RichText>
        </div>
      </Container>

      <Container className="mt-24 sm:mt-28 lg:mt-32">
        <div className="max-w-[var(--content-prose)]">
          <h2 className="text-h2 text-text font-normal">Result</h2>
          <RichText>{doc.result}</RichText>
        </div>
      </Container>

      {doc.techTags.length > 0 && (
        <Container className="mt-16">
          <p className="text-caption text-text-muted font-mono">{doc.techTags.join(" · ")}</p>
        </Container>
      )}

      <Container className="mt-32 sm:mt-40 lg:mt-48">
        <div className="border-border-muted border-t pt-12 text-center">
          <p className="text-h3 text-text font-normal">Building something similar?</p>
          <Link
            href="/contact"
            className="text-accent text-h2 mt-6 inline-flex items-center gap-2 font-serif italic no-underline hover:no-underline hover:opacity-80"
          >
            Start a project
            <ArrowUpRight className="size-5 not-italic" aria-hidden="true" />
          </Link>
        </div>
      </Container>
    </div>
  );
}
