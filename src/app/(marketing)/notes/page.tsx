import type { Metadata } from "next";
import Image from "next/image";

import "@/lib/cms/collections";

import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { Link } from "@/components/ui/link";
import { findPublished, resolveCoverImage } from "@/lib/cms/public-content";
import { connectToDatabase } from "@/lib/db";
import { pageMetadata } from "@/lib/seo";
import { Note, type NoteDocument } from "@/models/note";
import { TeamMember } from "@/models/team-member";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Notes",
    description: "Engineering write-ups, dev logs, and lessons learned from HubZero.",
    path: "/notes",
  }),
  // Feed discovery — points readers/aggregators at `rss.xml/route.ts`.
  alternates: { canonical: "/notes", types: { "application/rss+xml": "/notes/rss.xml" } },
};

export const revalidate = 3600;

/**
 * `ARCHITECTURE/06_PAGE_SPECIFICATIONS.md` Notes index — real, published
 * `Note` documents. No cornerstone articles are seeded here: writing 3-5
 * launch notes is real editorial work for the team, not something an
 * engineering pass fabricates — this ships the reading pipeline the team
 * publishes into, with an honest empty state until they do.
 */
export default async function NotesIndexPage() {
  const notes = await findPublished<NoteDocument>(Note);

  await connectToDatabase();
  const authorIds = [...new Set(notes.map((note) => String(note.authorId)))];
  const authors =
    authorIds.length > 0
      ? await TeamMember.find({ _id: { $in: authorIds } })
          .select("name")
          .lean<{ _id: unknown; name: string }[]>()
      : [];
  const authorNames = Object.fromEntries(
    authors.map((author) => [String(author._id), author.name]),
  );

  const items = await Promise.all(
    notes.map(async (doc) => ({
      slug: doc.slug,
      title: doc.title,
      summary: doc.summary,
      category: doc.category,
      readingTimeMinutes: doc.readingTimeMinutes,
      authorName: authorNames[String(doc.authorId)] ?? "HubZero",
      cover: await resolveCoverImage(doc.coverImage ? String(doc.coverImage) : undefined),
    })),
  );

  return (
    <div className="pt-16 pb-28 sm:pt-20 lg:pt-24">
      <Container>
        <p className="text-caption text-text-muted font-mono tracking-wide uppercase">Notes</p>
        <h1 className="text-text mt-4 max-w-2xl text-[clamp(2rem,1rem+4vw,3.5rem)] leading-[1.1] font-normal tracking-tight">
          Engineering write-ups, not a marketing blog.
        </h1>
        <p className="text-body text-text-muted mt-6 max-w-xl">
          Dev logs, architectural thinking, and lessons learned — written by the people who did the
          work.
        </p>
      </Container>

      <Container className="mt-16 lg:mt-20">
        {items.length === 0 ? (
          <EmptyState
            title="No notes published yet"
            description="The first write-ups are on the way — check back soon."
          />
        ) : (
          <div className="divide-border-muted divide-y">
            {items.map((note) => (
              <Link
                key={note.slug}
                href={`/notes/${note.slug}`}
                className="group grid grid-cols-1 gap-6 py-12 no-underline first:pt-0 hover:no-underline sm:grid-cols-12 sm:gap-8"
              >
                <div className="sm:order-2 sm:col-span-4">
                  {note.cover ? (
                    <Image
                      src={note.cover.url}
                      alt={note.cover.alt}
                      width={note.cover.width ?? 800}
                      height={note.cover.height ?? 500}
                      sizes="(min-width: 640px) 33vw, 92vw"
                      className="h-auto w-full transition-opacity duration-150 group-hover:opacity-90"
                    />
                  ) : (
                    <div className="bg-bg-light aspect-video w-full" aria-hidden="true" />
                  )}
                </div>
                <div className="sm:order-1 sm:col-span-8">
                  <p className="text-caption text-text-muted font-mono tracking-wide uppercase">
                    {note.category} <span aria-hidden="true">·</span> {note.readingTimeMinutes} min
                    read
                  </p>
                  <h2 className="text-h2 text-text mt-3 font-normal">{note.title}</h2>
                  <p className="text-body text-text-muted mt-3 max-w-lg">{note.summary}</p>
                  <p className="text-caption text-text-muted mt-4">{note.authorName}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
