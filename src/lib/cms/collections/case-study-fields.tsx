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
 *
 * `problem`/`approach`/`result` are replaced by `content`, a single ordered
 * `Block[]` field (`ARCHITECTURE/20_CONTENT_BLOCKS.md`) — the author decides
 * the story, this collection no longer forces a three-part structure.
 * `summary`/`featured`/`contributors` are the card-metadata and
 * team-relationship additions the same evolution introduces.
 * `readingTimeMinutes` is computed (`case-study.config.ts`'s
 * `computedFields`), never a form field.
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
  summary: z.string().trim().min(1, "Required.").max(400),
  content: blocksField(),
  techTags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  coverImage: optionalObjectIdField("Choose a cover image from the media library."),
  ...cardFieldsSchemaShape,
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
  {
    name: "summary",
    label: "Card summary",
    type: "textarea",
    required: true,
    description: "Shown on /work and anywhere else this case study appears as a card.",
  },
  { name: "content", label: "Content", type: "blocks", required: true },
  { name: "techTags", label: "Tech tags", type: "multiselect" },
  { name: "coverImage", label: "Cover image", type: "image" },
  contributorsFormField("Team members who worked on this project."),
  featuredFormField(
    "Used as the default homepage feature when Site Settings doesn't pick one explicitly.",
  ),
];

export const caseStudyListColumns: TableColumn<CaseStudyRow>[] = [
  { key: "client", label: "Client", sortable: true },
  { key: "industry", label: "Industry" },
  { key: "practiceArea", label: "Practice area" },
  featuredListColumn(),
  statusListColumn(),
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
