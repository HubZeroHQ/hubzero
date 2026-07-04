import { z } from "zod";

import { WorkflowStatusBadge } from "@/components/admin/workflow-status-badge";
import { practiceAreaOptions, practiceAreaValues } from "@/lib/cms/collections/shared-options";
import { emptyToUndefined } from "@/lib/utils";
import type { CaseStudyDocument } from "@/models/case-study";
import type { ClientDocument, FieldConfig, FilterConfig, TableColumn } from "@/types/cms";

/**
 * Case Studies' Zod validation, form fields, and table/filter config — kept
 * in a module that never imports the Mongoose model. `case-studies-table.tsx`,
 * `new-case-study-form.tsx`, and `edit-case-study-form.tsx` are Client
 * Components that need these; importing anything that also imports
 * `@/models/case-study` (Mongoose → the `mongodb` driver → Node-only builtins
 * like `net`/`tls`) into a Client Component's module graph fails the browser
 * build, the same "Module not found: timers/promises" class of bug
 * `lib/cms/logout-action.ts` already documents and works around. The
 * Mongoose-touching half (`caseStudyConfig`, importing `CaseStudy` from
 * here) lives in the sibling `case-study.config.ts`, imported only from
 * `actions/studio/case-studies.ts` and Server Components.
 */

export type CaseStudyRow = ClientDocument<CaseStudyDocument>;

export { practiceAreaOptions };

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const caseStudySchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "At least 3 characters.")
    .max(80, "Keep it under 80 characters.")
    .regex(slugPattern, "Lowercase letters, numbers, and hyphens only."),
  client: z.string().trim().min(1, "Required.").max(160, "Keep it under 160 characters."),
  industry: z.string().trim().min(1, "Required.").max(160, "Keep it under 160 characters."),
  practiceArea: z.enum(practiceAreaValues, { error: "Choose a practice area." }),
  problem: z.string().trim().min(1, "Required.").max(20000),
  approach: z.string().trim().min(1, "Required.").max(20000),
  result: z.string().trim().min(1, "Required.").max(20000),
  techTags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  coverImage: z.preprocess(emptyToUndefined, z.url("Enter a valid URL.").optional()),
});

export type CaseStudyInput = z.infer<typeof caseStudySchema>;

export const caseStudyEmptyStateMessage =
  "No case studies yet — create the first one to get started.";

export const caseStudyFormFields: FieldConfig<CaseStudyInput>[] = [
  { name: "client", label: "Client", type: "text", required: true },
  { name: "industry", label: "Industry", type: "text", required: true },
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
  { name: "problem", label: "Problem", type: "richtext", required: true },
  { name: "approach", label: "Approach", type: "richtext", required: true },
  { name: "result", label: "Result", type: "richtext", required: true },
  { name: "techTags", label: "Tech tags", type: "multiselect" },
  { name: "coverImage", label: "Cover image", type: "image" },
];

export const caseStudyListColumns: TableColumn<CaseStudyRow>[] = [
  { key: "client", label: "Client", sortable: true },
  { key: "industry", label: "Industry" },
  { key: "practiceArea", label: "Practice area" },
  { key: "status", label: "Status", render: (doc) => <WorkflowStatusBadge status={doc.status} /> },
  {
    key: "updatedAt",
    label: "Updated",
    sortable: true,
    // A fixed locale, not the runtime's default: the server (Node) and the
    // client (the visitor's browser) can have different default locales,
    // and an implicit `toLocaleDateString()` renders "7/4/2026" on one and
    // "04/07/2026" on the other — a hydration mismatch, not just a cosmetic
    // difference, since React compares the server-rendered string byte for
    // byte against the client's first render.
    render: (doc) => (doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString("en-US") : "—"),
  },
];

export const caseStudyFilters: FilterConfig<CaseStudyRow>[] = [
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
