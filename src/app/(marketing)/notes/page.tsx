import type { Metadata } from "next";
import Image from "next/image";

import "@/lib/cms/collections";

import { CardTags, ContributorAvatars, FeaturedBadge } from "@/components/marketing/card-meta";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { Link } from "@/components/ui/link";
import { findPublished, getPublicTeamMembers, resolveCoverImage } from "@/lib/cms/public-content";
import { pageMetadata } from "@/lib/seo";
import { Note, type NoteDocument } from "@/models/note";
import { withArrayDefault, withCardFieldDefaults } from "@/models/shared/card-fields";

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
  const rawNotes = await findPublished<NoteDocument>(Note);
  const notes = rawNotes.map((doc) => withArrayDefault(withCardFieldDefaults(doc), "tags"));

  const peopleIds = [
    ...new Set(notes.flatMap((doc) => [String(doc.authorId), ...doc.contributors.map(String)])),
  ];
  const people = await getPublicTeamMembers(peopleIds);
  const peopleById = new Map(people.map((member) => [member.id, member]));

  const items = await Promise.all(
    notes.map(async (doc) => {
      const author = peopleById.get(String(doc.authorId));
      const contributors = doc.contributors
        .map((id) => peopleById.get(String(id)))
        .filter((member): member is NonNullable<typeof member> => Boolean(member));
      return {
        slug: doc.slug,
        title: doc.title,
        summary: doc.summary,
        category: doc.category,
        tags: doc.tags,
        featured: doc.featured,
        readingTimeMinutes: doc.readingTimeMinutes,
        authorName: author?.name ?? "HubZero",
        // The byline is the author plus any additional contributors — never
        // duplicated (the author never also appears in `contributors`).
        people: author ? [author, ...contributors] : contributors,
        cover: await resolveCoverImage(doc.coverImage ? String(doc.coverImage) : undefined),
      };
    }),
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
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-caption text-text-muted font-mono tracking-wide uppercase">
                      {note.category} <span aria-hidden="true">·</span> {note.readingTimeMinutes}{" "}
                      min read
                    </p>
                    {note.featured && <FeaturedBadge />}
                  </div>
                  <h2 className="text-h2 text-text mt-3 font-normal">{note.title}</h2>
                  <p className="text-body text-text-muted mt-3 max-w-lg">{note.summary}</p>
                  <CardTags tags={note.tags} />
                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <p className="text-caption text-text-muted">{note.authorName}</p>
                    <ContributorAvatars members={note.people} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
