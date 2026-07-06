import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";

import "@/lib/cms/collections";

import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import { WorkGrid, type WorkGridItem } from "@/components/work/work-grid";
import { findPublished, getPublicTeamMembers, resolveCoverImage } from "@/lib/cms/public-content";
import { pageMetadata } from "@/lib/seo";
import { CaseStudy, type CaseStudyDocument } from "@/models/case-study";
import { withArrayDefault, withCardFieldDefaults } from "@/models/shared/card-fields";

export const metadata: Metadata = pageMetadata({
  title: "Work",
  description:
    "Real, completed engineering work from HubZero — every project here was worth doing.",
  path: "/work",
});

// `publish()`/`remove()` (`crud-actions.ts`) already `revalidatePath("/work")`
// on a real change — this is only the background-refresh ceiling for
// whatever a stale cached copy might otherwise miss.
export const revalidate = 3600;

/**
 * ARCHITECTURE/06_PAGE_SPECIFICATIONS.md "Work — index": intro line
 * (selectivity framing), filter by practice area, case study cards, CTA.
 * Reads real, published `CaseStudy` documents — replaces the static
 * `config/case-studies.ts` list (`ARCHITECTURE/19_CMS_FOUNDATION.md` §13's
 * flagged migration).
 */
export default async function WorkPage() {
  const rawCaseStudies = await findPublished<CaseStudyDocument>(CaseStudy);
  const caseStudies = rawCaseStudies.map((doc) =>
    withArrayDefault(withCardFieldDefaults(doc), "techTags"),
  );

  const contributorIds = [...new Set(caseStudies.flatMap((doc) => doc.contributors.map(String)))];
  const contributors = await getPublicTeamMembers(contributorIds);
  const contributorsById = new Map(contributors.map((member) => [member.id, member]));

  const items: WorkGridItem[] = await Promise.all(
    caseStudies.map(async (doc) => ({
      slug: doc.slug,
      client: doc.client,
      resultTeaser: doc.summary,
      practiceArea: doc.practiceArea,
      cover: await resolveCoverImage(doc.coverImage ? String(doc.coverImage) : undefined),
      techTags: doc.techTags,
      featured: doc.featured,
      readingTimeMinutes: doc.readingTimeMinutes,
      contributors: doc.contributors
        .map((id) => contributorsById.get(String(id)))
        .filter((member): member is NonNullable<typeof member> => Boolean(member)),
    })),
  );

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
        <WorkGrid items={items} />
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
