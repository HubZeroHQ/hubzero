import {
  noteEmptyStateMessage,
  noteFilters,
  noteFormFields,
  noteListColumns,
  noteSchema,
  type NoteInput,
} from "@/lib/cms/collections/note-fields";
import { computeReadingTimeMinutes } from "@/lib/cms/blocks/text";
import { defineCollection, registerCollection } from "@/lib/cms/collection-config";
import { Note, type NoteDocument } from "@/models/note";

export const noteConfig = registerCollection(
  defineCollection<NoteDocument, NoteInput>({
    resource: "note",
    label: "Notes",
    model: Note,
    zodSchema: noteSchema,
    workflow: "draft-review-publish",
    listColumns: noteListColumns,
    filters: noteFilters,
    formFields: noteFormFields,
    searchableFields: ["title", "slug", "category"],
    emptyStateMessage: noteEmptyStateMessage,
    studioBasePath: "notes",
    recordLabel: (doc) => doc.title,
    // "Computed on save, not author-entered" (`ARCHITECTURE/11_DATABASE_ARCHITECTURE.md`
    // §1) — the sanctioned `computedFields` hook, not a bespoke code path.
    computedFields: (input) => ({ readingTimeMinutes: computeReadingTimeMinutes(input.content) }),
    // "/" is included since a Note can be a homepage-featured item
    // (`publicCard` below).
    revalidatesPaths: (doc) => ["/", "/notes", `/notes/${doc.slug}`],
    publicCard: (doc) => ({
      title: doc.title,
      summary: doc.summary,
      href: `/notes/${doc.slug}`,
      coverImageId: doc.coverImage ? String(doc.coverImage) : undefined,
      techTags: Array.isArray(doc.tags) ? doc.tags : [],
      featured: doc.featured,
      readingTimeMinutes: doc.readingTimeMinutes,
      // The primary author is included alongside any additional contributors
      // — a Note's homepage card credits the same people its own detail page
      // does (`ARCHITECTURE/20_CONTENT_BLOCKS.md` §4), not just `contributors`.
      contributorIds: [doc.authorId, ...(doc.contributors ?? [])].filter(Boolean).map(String),
    }),
  }),
);
