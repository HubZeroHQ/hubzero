import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import "@/lib/cms/collections";

import { RichText } from "@/components/marketing/rich-text";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import { findOnePublished, resolveCoverImage } from "@/lib/cms/public-content";
import { Blueprint, type BlueprintDocument } from "@/models/blueprint";

interface BlueprintPageProps {
  params: Promise<{ slug: string }>;
}

async function getBlueprint(slug: string) {
  return findOnePublished<BlueprintDocument>(Blueprint, { slug });
}

export async function generateMetadata({ params }: BlueprintPageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = await getBlueprint(slug);
  if (!doc) return {};
  return { title: doc.name, description: doc.description.split("\n")[0]?.slice(0, 200) };
}

/**
 * `ARCHITECTURE/06_PAGE_SPECIFICATIONS.md`'s Blueprints detail: "this is the
 * one pillar where the live demo/preview is the actual hero content, not a
 * supporting image — the page's job is 'let them touch it.'" Rendered as a
 * prominent demo panel (cover image + a primary "Open the live demo" link)
 * rather than an `<iframe>` embed of a third-party deployment — a Blueprint's
 * `demoDeploymentUrl` points at infrastructure this codebase doesn't control,
 * and most hosts send `X-Frame-Options`/CSP `frame-ancestors` that silently
 * blank an embed with no error a visitor can act on. A direct link always
 * works; a same-origin-only embed sometimes silently doesn't.
 */
export default async function BlueprintPage({ params }: BlueprintPageProps) {
  const { slug } = await params;
  const doc = await getBlueprint(slug);
  if (!doc) notFound();

  const cover = await resolveCoverImage(doc.coverImage ? String(doc.coverImage) : undefined);
  const demoUrl = doc.demoDeploymentUrl ?? doc.previewUrl;

  return (
    <div className="pb-32">
      <div className="pt-20 pb-16 sm:pt-24 lg:pt-28">
        <Container>
          <p className="text-caption text-text-muted font-mono tracking-wide uppercase">
            Blueprint · {doc.blueprintId}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <h1 className="text-text max-w-3xl text-[clamp(2.25rem,1rem+4.5vw,4.5rem)] leading-[1.08] font-normal tracking-tight">
              {doc.name}
            </h1>
            <Badge>{doc.category}</Badge>
          </div>
        </Container>

        <Container size="full" className="mt-14 sm:mt-16 lg:mt-20">
          <div className="mx-auto w-full max-w-6xl">
            {cover ? (
              <Image
                src={cover.url}
                alt={cover.alt}
                width={cover.width ?? 1600}
                height={cover.height ?? 900}
                sizes="(min-width: 1024px) 72rem, 92vw"
                className="h-auto w-full"
                priority
              />
            ) : (
              <div className="bg-bg-light aspect-video w-full" aria-hidden="true" />
            )}

            {demoUrl && (
              <div className="border-border-muted mt-6 flex flex-wrap items-center justify-between gap-4 border-t pt-6">
                <p className="text-body text-text">Try it yourself — this demo is live.</p>
                <a
                  href={demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-text text-bg text-caption inline-flex items-center gap-1.5 rounded-md px-4 py-2 font-medium no-underline hover:opacity-90"
                >
                  Open the live demo
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </a>
              </div>
            )}
          </div>
        </Container>
      </div>

      <Container className="mt-8 sm:mt-12 lg:mt-16">
        <div className="max-w-[var(--content-prose)]">
          <RichText>{doc.description}</RichText>
        </div>
      </Container>

      {doc.techStack.length > 0 && (
        <Container className="mt-16">
          <p className="text-caption text-text-muted font-mono">{doc.techStack.join(" · ")}</p>
        </Container>
      )}

      {doc.customizationNotes && (
        <Container className="mt-24 sm:mt-28 lg:mt-32">
          <div className="max-w-[var(--content-prose)]">
            <h2 className="text-h2 text-text font-normal">What you can customize</h2>
            <RichText>{doc.customizationNotes}</RichText>
          </div>
        </Container>
      )}

      <Container className="mt-32 sm:mt-40 lg:mt-48">
        <div className="border-border-muted border-t pt-12 text-center">
          <p className="text-h3 text-text font-normal">Start a project built on this foundation?</p>
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
