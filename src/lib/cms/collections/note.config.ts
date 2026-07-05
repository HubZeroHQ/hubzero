import {
  computeReadingTimeMinutes,
  noteEmptyStateMessage,
  noteFilters,
  noteFormFields,
  noteListColumns,
  noteSchema,
  type NoteInput,
} from "@/lib/cms/collections/note-fields";
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
    computedFields: (input) => ({ readingTimeMinutes: computeReadingTimeMinutes(input.body) }),
    revalidatesPaths: (doc) => ["/notes", `/notes/${doc.slug}`],
  }),
);
