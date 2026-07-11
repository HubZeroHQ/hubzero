import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";

import "@/lib/cms/collections";

import { LabsGrid, type LabsGridItem } from "@/components/marketing/labs-grid";
import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import { findPublishedWithCardMeta, resolveCoverImage } from "@/lib/cms/public-content";
import { pageMetadata } from "@/lib/seo";
import { LabsProject, type LabsProjectDocument } from "@/models/labs-project";

export const metadata: Metadata = pageMetadata({
  title: "Labs",
  description:
    "Internal R&D — hardware, software, and AI exploration built with no client watching.",
  path: "/labs",
});

export const revalidate = 3600;

/**
 * `ARCHITECTURE/06_PAGE_SPECIFICATIONS.md`'s Labs index — real, published
 * `LabsProject` documents, migrated from the previous embedded Hardware-page
 * write-up (`scripts/migrate-content.ts`) rather than invented for this page.
 */
export default async function LabsIndexPage() {
  const { docs: projects, contributorsById } = await findPublishedWithCardMeta<LabsProjectDocument>(
    LabsProject,
    "techTags",
  );

  const items: LabsGridItem[] = await Promise.all(
    projects.map(async (doc) => ({
      slug: doc.slug,
      title: doc.title,
      descriptionTeaser: doc.summary,
      practiceArea: doc.practiceArea,
      stage: doc.stage,
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
        <p className="text-caption text-text-muted font-mono tracking-wide uppercase">
          HubZero Labs
        </p>
        <h1 className="text-text mt-4 max-w-2xl text-[clamp(2rem,1rem+4vw,3.5rem)] leading-[1.1] font-normal tracking-tight">
          What we build with no client watching.
        </h1>
        <p className="text-body text-text-muted mt-6 max-w-xl">
          Internal R&amp;D across software, hardware, and AI — real projects, allowed to look
          in-progress, tested here before a pattern ever reaches client work.
        </p>
      </Container>

      <Container className="mt-16 lg:mt-20">
        <LabsGrid items={items} />
      </Container>

      <Container className="mt-24 lg:mt-32">
        <div className="border-border-muted border-t pt-12">
          <p className="text-h3 text-text font-normal">Have something like this to build?</p>
          <Link
            href="/contact"
            className="text-accent-text text-h3 mt-4 inline-flex items-center gap-2 font-serif italic no-underline hover:no-underline hover:opacity-80"
          >
            Start a project
            <ArrowUpRight className="size-4 not-italic" aria-hidden="true" />
          </Link>
        </div>
      </Container>
    </div>
  );
}
