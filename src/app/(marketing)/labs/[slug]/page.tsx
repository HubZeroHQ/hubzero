import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import "@/lib/cms/collections";

import { ContentRenderer } from "@/components/marketing/blocks/content-renderer";
import { ContributorChips } from "@/components/marketing/blocks/contributor-chips";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import {
  findOnePublished,
  findPublished,
  getPublicTeamMembers,
  resolveCoverImage,
} from "@/lib/cms/public-content";
import { absoluteUrl, pageMetadata } from "@/lib/seo";
import { LabsProject, type LabsProjectDocument } from "@/models/labs-project";
import { withArrayDefault, withCardFieldDefaults } from "@/models/shared/card-fields";

interface LabsProjectPageProps {
  params: Promise<{ slug: string }>;
}

const stageLabels: Record<string, string> = {
  active: "Active",
  archived: "Archived",
  graduated: "Graduated to Builds",
};

export const revalidate = 3600;

async function getLabsProject(slug: string) {
  const doc = await findOnePublished<LabsProjectDocument>(LabsProject, { slug });
  // See `work/[slug]/page.tsx`'s `getCaseStudy` — same `.lean()`-bypasses-
  // defaults hazard, applied to LabsProject's own array fields.
  return doc && withArrayDefault(withCardFieldDefaults(doc), "techTags");
}

export async function generateStaticParams() {
  const labsProjects = await findPublished<LabsProjectDocument>(LabsProject);
  return labsProjects.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: LabsProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = await getLabsProject(slug);
  if (!doc) return {};
  const cover = await resolveCoverImage(doc.coverImage ? String(doc.coverImage) : undefined);
  return pageMetadata({
    title: doc.title,
    description: doc.summary,
    path: `/labs/${doc.slug}`,
    image: cover ? { url: cover.url, alt: cover.alt } : undefined,
  });
}

export default async function LabsProjectPage({ params }: LabsProjectPageProps) {
  const { slug } = await params;
  const doc = await getLabsProject(slug);
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
          name: doc.title,
          description: doc.summary,
          genre: "Research & Development",
          ...(cover ? { image: absoluteUrl(cover.url) } : {}),
        }}
      />
      <div className="pt-20 pb-16 sm:pt-24 lg:pt-28">
        <Container>
          <p className="text-caption text-text-muted font-mono tracking-wide uppercase">
            HubZero Labs
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <h1 className="text-text max-w-3xl text-[clamp(2.25rem,1rem+4.5vw,4.5rem)] leading-[1.08] font-normal tracking-tight">
              {doc.title}
            </h1>
            <Badge>Internal R&amp;D — not client work</Badge>
          </div>
          <p className="text-caption text-text-muted mt-8 font-mono">
            {stageLabels[doc.stage] ?? doc.stage}
            {doc.techTags.length > 0 && (
              <>
                {" "}
                <span aria-hidden="true">·</span> {doc.techTags.join(" · ")}
              </>
            )}
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

      <div className="mt-8 sm:mt-12 lg:mt-16">
        <ContentRenderer blocks={doc.content} />
      </div>

      {contributors.length > 0 && (
        <div className="mt-16">
          <ContributorChips members={contributors} />
        </div>
      )}

      <Container className="mt-32 sm:mt-40 lg:mt-48">
        <div className="border-border-muted border-t pt-12 text-center">
          <p className="text-h3 text-text font-normal">Curious how this connects to client work?</p>
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
