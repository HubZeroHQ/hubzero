import { z } from "zod";

import { blocksField } from "@/lib/cms/blocks/schema";
import {
  cardFieldsSchemaShape,
  contributorsFormField,
  featuredFormField,
  featuredListColumn,
  statusListColumn,
} from "@/lib/cms/collections/card-fields";
import { objectIdField, optionalObjectIdField } from "@/lib/cms/collections/shared-validation";
import type { NoteDocument } from "@/models/note";
import type { ClientDocument, FieldConfig, FilterConfig, TableColumn } from "@/types/cms";

export type NoteRow = ClientDocument<NoteDocument>;

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const noteSchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "At least 3 characters.")
    .max(160, "Keep it under 160 characters.")
    .regex(slugPattern, "Lowercase letters, numbers, and hyphens only."),
  title: z.string().trim().min(1, "Required.").max(200),
  summary: z.string().trim().min(1, "Required.").max(400),
  content: blocksField(),
  authorId: objectIdField("Select the author."),
  category: z.string().trim().min(1, "Required.").max(80),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  coverImage: optionalObjectIdField("Choose a cover image from the media library."),
  ...cardFieldsSchemaShape,
});

export type NoteInput = z.infer<typeof noteSchema>;

export const noteEmptyStateMessage = "No notes yet — create the first one to get started.";

export const noteFormFields: FieldConfig<NoteInput>[] = [
  { name: "title", label: "Title", type: "text", required: true },
  {
    name: "slug",
    label: "Slug",
    type: "text",
    required: true,
    description: "Used in the public URL — lowercase, hyphenated.",
  },
  { name: "summary", label: "Summary", type: "textarea", required: true },
  { name: "content", label: "Content", type: "blocks", required: true },
  {
    name: "authorId",
    label: "Author",
    type: "reference",
    resource: "teamMember",
    labelField: "name",
    required: true,
  },
  contributorsFormField("Anyone else who worked on this note, beyond the author."),
  { name: "category", label: "Category", type: "text", required: true },
  { name: "tags", label: "Tags", type: "multiselect" },
  { name: "coverImage", label: "Cover image", type: "image" },
  featuredFormField(),
];

export const noteListColumns: TableColumn<NoteRow>[] = [
  { key: "title", label: "Title", sortable: true },
  { key: "category", label: "Category" },
  {
    key: "readingTimeMinutes",
    label: "Read time",
    render: (doc) => `${doc.readingTimeMinutes} min`,
  },
  featuredListColumn(),
  statusListColumn(),
  {
    key: "updatedAt",
    label: "Updated",
    sortable: true,
    render: (doc) => (doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString("en-US") : "—"),
  },
];

export const noteFilters: FilterConfig<NoteRow>[] = [
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "draft", label: "Draft" },
      { value: "review", label: "In review" },
      { value: "published", label: "Published" },
    ],
  },
  { name: "category", label: "Category", type: "text" },
];
