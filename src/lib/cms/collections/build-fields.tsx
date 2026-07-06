import { z } from "zod";

import { blocksField } from "@/lib/cms/blocks/schema";
import {
  cardFieldsSchemaShape,
  contributorsFormField,
  featuredFormField,
  featuredListColumn,
  statusListColumn,
} from "@/lib/cms/collections/card-fields";
import { practiceAreaOptions, practiceAreaValues } from "@/lib/cms/collections/shared-options";
import { optionalObjectIdField } from "@/lib/cms/collections/shared-validation";
import { emptyToUndefined } from "@/lib/utils";
import type { BuildDocument } from "@/models/build";
import type { ClientDocument, FieldConfig, FilterConfig, TableColumn } from "@/types/cms";

export type BuildRow = ClientDocument<BuildDocument>;

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const buildSchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "At least 3 characters.")
    .max(80, "Keep it under 80 characters.")
    .regex(slugPattern, "Lowercase letters, numbers, and hyphens only."),
  title: z.string().trim().min(1, "Required.").max(160),
  tagline: z.string().trim().min(1, "Required.").max(240),
  practiceArea: z.enum(practiceAreaValues, {
    error: "Choose a practice area.",
  }),
  content: blocksField(),
  techTags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  coverImage: optionalObjectIdField("Choose a cover image from the media library."),
  ...cardFieldsSchemaShape,
  launchDate: z.string().trim().min(1, "Required."),
  liveUrl: z.preprocess(emptyToUndefined, z.url("Enter a valid URL.").optional()),
  repoUrl: z.preprocess(emptyToUndefined, z.url("Enter a valid URL.").optional()),
});

export type BuildInput = z.infer<typeof buildSchema>;

export const buildEmptyStateMessage = "No Builds yet — create the first one to get started.";

export const buildFormFields: FieldConfig<BuildInput>[] = [
  { name: "title", label: "Title", type: "text", required: true },
  {
    name: "tagline",
    label: "Tagline",
    type: "text",
    required: true,
    description: "The card blurb.",
  },
  {
    name: "slug",
    label: "Slug",
    type: "text",
    required: true,
    description: "Used in the public URL — lowercase, hyphenated.",
  },
  {
    name: "practiceArea",
    label: "Practice area",
    type: "select",
    required: true,
    options: [...practiceAreaOptions],
  },
  { name: "content", label: "Content", type: "blocks", required: true },
  { name: "techTags", label: "Tech tags", type: "multiselect" },
  { name: "coverImage", label: "Cover image", type: "image" },
  contributorsFormField("Team members who worked on this build."),
  featuredFormField(),
  { name: "launchDate", label: "Launch date", type: "date", required: true },
  { name: "liveUrl", label: "Live URL", type: "url" },
  { name: "repoUrl", label: "Repo URL", type: "url" },
];

export const buildListColumns: TableColumn<BuildRow>[] = [
  { key: "title", label: "Title", sortable: true },
  { key: "practiceArea", label: "Practice area" },
  featuredListColumn(),
  statusListColumn(),
  {
    key: "launchDate",
    label: "Launched",
    sortable: true,
    render: (doc) => (doc.launchDate ? new Date(doc.launchDate).toLocaleDateString("en-US") : "—"),
  },
];

export const buildFilters: FilterConfig<BuildRow>[] = [
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
  {
    name: "practiceArea",
    label: "Practice area",
    type: "select",
    options: [...practiceAreaOptions],
  },
];
