import type { Metadata } from "next";

import "@/lib/cms/collections";

import { FeaturedBadge } from "@/components/marketing/card-meta";
import { EntryRow } from "@/components/marketing/entry-row";
import { PageHeader } from "@/components/marketing/page-header";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
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
        <PageHeader
          eyebrow="Notes"
          headline="Engineering write-ups, not a marketing blog."
          description="Dev logs, architectural thinking, and lessons learned — written by the people who did the work."
        />
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
              <EntryRow
                key={note.slug}
                href={`/notes/${note.slug}`}
                cover={note.cover}
                columns={[8, 4]}
                meta={
                  <>
                    <p className="text-caption text-text-muted font-mono tracking-wide uppercase">
                      {note.category}
                    </p>
                    {note.featured && <FeaturedBadge />}
                  </>
                }
                title={note.title}
                summary={note.summary}
                tags={note.tags}
                readingTimeMinutes={note.readingTimeMinutes}
                contributors={note.people}
                ctaLabel="Read the write-up"
                byline={<p className="text-caption text-text-muted">{note.authorName}</p>}
              />
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
