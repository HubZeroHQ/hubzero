import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import "@/lib/cms/collections";

import { RichText } from "@/components/marketing/rich-text";
import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import { findOnePublished, resolveCoverImage } from "@/lib/cms/public-content";
import { Note, type NoteDocument } from "@/models/note";
import { TeamMember } from "@/models/team-member";

interface NotePageProps {
  params: Promise<{ slug: string }>;
}

async function getNote(slug: string) {
  return findOnePublished<NoteDocument>(Note, { slug });
}

export async function generateMetadata({ params }: NotePageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = await getNote(slug);
  if (!doc) return {};
  return { title: doc.title, description: doc.summary };
}

export default async function NotePage({ params }: NotePageProps) {
  const { slug } = await params;
  const doc = await getNote(slug);
  if (!doc) notFound();

  const [cover, author] = await Promise.all([
    resolveCoverImage(doc.coverImage ? String(doc.coverImage) : undefined),
    TeamMember.findById(doc.authorId).select("name username").lean<{ name: string; username: string } | null>(),
  ]);

  return (
    <div className="pb-32">
      <div className="pt-20 pb-16 sm:pt-24 lg:pt-28">
        <Container>
          <p className="text-caption text-text-muted font-mono tracking-wide uppercase">
            {doc.category} <span aria-hidden="true">·</span> {doc.readingTimeMinutes} min read
          </p>
          <h1 className="text-text mt-6 max-w-3xl text-[clamp(2.25rem,1rem+4.5vw,4.5rem)] leading-[1.08] font-normal tracking-tight">
            {doc.title}
          </h1>
          <p className="text-body text-text-muted mt-6 max-w-xl">{doc.summary}</p>
          {author && (
            <p className="text-caption text-text-muted mt-8 font-mono">
              {author.username ? (
                <Link href={`/team/${author.username}`} className="text-text-muted hover:text-text">
                  {author.name}
                </Link>
              ) : (
                author.name
              )}
            </p>
          )}
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
          <RichText>{doc.body}</RichText>
        </div>
      </Container>

      {doc.tags.length > 0 && (
        <Container className="mt-16">
          <p className="text-caption text-text-muted font-mono">{doc.tags.join(" · ")}</p>
        </Container>
      )}

      <Container className="mt-16">
        <Link href="/notes">← Back to Notes</Link>
      </Container>
    </div>
  );
}
