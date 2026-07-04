import { z } from "zod";

import { WorkflowStatusBadge } from "@/components/admin/workflow-status-badge";
import { objectIdField } from "@/lib/cms/collections/shared-validation";
import { emptyToUndefined } from "@/lib/utils";
import type { BlogPostDocument } from "@/models/blog-post";
import type { ClientDocument, FieldConfig, FilterConfig, TableColumn } from "@/types/cms";

export type BlogPostRow = ClientDocument<BlogPostDocument>;

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const blogPostSchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "At least 3 characters.")
    .max(160, "Keep it under 160 characters.")
    .regex(slugPattern, "Lowercase letters, numbers, and hyphens only."),
  title: z.string().trim().min(1, "Required.").max(200),
  summary: z.string().trim().min(1, "Required.").max(400),
  body: z.string().trim().min(1, "Required.").max(50000),
  authorId: objectIdField("Enter the author's TeamMember ID."),
  category: z.string().trim().min(1, "Required.").max(80),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  coverImage: z.preprocess(emptyToUndefined, z.url("Enter a valid URL.").optional()),
});

export type BlogPostInput = z.infer<typeof blogPostSchema>;

/**
 * "Computed on save, not author-entered" (`ARCHITECTURE/11_DATABASE_ARCHITECTURE.md`
 * §1) — a standard 200-words-per-minute reading speed assumption, rounded up
 * so a short post never reads as "0 minutes."
 */
const WORDS_PER_MINUTE = 200;

export function computeReadingTimeMinutes(body: string): number {
  const wordCount = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}

export const blogPostEmptyStateMessage = "No blog posts yet — create the first one to get started.";

export const blogPostFormFields: FieldConfig<BlogPostInput>[] = [
  { name: "title", label: "Title", type: "text", required: true },
  {
    name: "slug",
    label: "Slug",
    type: "text",
    required: true,
    description: "Used in the public URL — lowercase, hyphenated.",
  },
  { name: "summary", label: "Summary", type: "textarea", required: true },
  { name: "body", label: "Body", type: "richtext", required: true },
  {
    name: "authorId",
    label: "Author",
    type: "reference",
    resource: "teamMember",
    labelField: "name",
    required: true,
  },
  { name: "category", label: "Category", type: "text", required: true },
  { name: "tags", label: "Tags", type: "multiselect" },
  { name: "coverImage", label: "Cover image", type: "image" },
];

export const blogPostListColumns: TableColumn<BlogPostRow>[] = [
  { key: "title", label: "Title", sortable: true },
  { key: "category", label: "Category" },
  {
    key: "readingTimeMinutes",
    label: "Read time",
    render: (doc) => `${doc.readingTimeMinutes} min`,
  },
  { key: "status", label: "Status", render: (doc) => <WorkflowStatusBadge status={doc.status} /> },
  {
    key: "updatedAt",
    label: "Updated",
    sortable: true,
    render: (doc) => (doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString("en-US") : "—"),
  },
];

export const blogPostFilters: FilterConfig<BlogPostRow>[] = [
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
