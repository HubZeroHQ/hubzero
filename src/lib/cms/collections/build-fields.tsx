import { z } from "zod";

import { WorkflowStatusBadge } from "@/components/admin/workflow-status-badge";
import { practiceAreaOptions } from "@/lib/cms/collections/shared-options";
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
  practiceArea: z.enum(practiceAreaOptions.map((option) => option.value) as [string, ...string[]], {
    error: "Choose a practice area.",
  }),
  description: z.string().trim().min(1, "Required.").max(20000),
  techTags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  coverImage: optionalObjectIdField("Choose a cover image from the media library."),
  launchDate: z.string().trim().min(1, "Required."),
  liveUrl: z.preprocess(emptyToUndefined, z.url("Enter a valid URL.").optional()),
  repoUrl: z.preprocess(emptyToUndefined, z.url("Enter a valid URL.").optional()),
});

export type BuildInput = z.infer<typeof buildSchema>;

export const buildEmptyStateMessage = "No Builds yet — create the first one to get started.";

export const buildFormFields: FieldConfig<BuildInput>[] = [
  { name: "title", label: "Title", type: "text", required: true },
  { name: "tagline", label: "Tagline", type: "text", required: true },
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
  { name: "description", label: "Description", type: "richtext", required: true },
  { name: "techTags", label: "Tech tags", type: "multiselect" },
  { name: "coverImage", label: "Cover image", type: "image" },
  { name: "launchDate", label: "Launch date", type: "date", required: true },
  { name: "liveUrl", label: "Live URL", type: "url" },
  { name: "repoUrl", label: "Repo URL", type: "url" },
];

export const buildListColumns: TableColumn<BuildRow>[] = [
  { key: "title", label: "Title", sortable: true },
  { key: "practiceArea", label: "Practice area" },
  { key: "status", label: "Status", render: (doc) => <WorkflowStatusBadge status={doc.status} /> },
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
