import { z } from "zod";

import { WorkflowStatusBadge } from "@/components/admin/workflow-status-badge";
import { Badge } from "@/components/ui/badge";
import { practiceAreaOptions, practiceAreaValues } from "@/lib/cms/collections/shared-options";
import { optionalObjectIdField } from "@/lib/cms/collections/shared-validation";
import type { LabsProjectDocument } from "@/models/labs-project";
import type { ClientDocument, FieldConfig, FilterConfig, TableColumn } from "@/types/cms";

export type LabsProjectRow = ClientDocument<LabsProjectDocument>;

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Deliberately excludes `"graduated"` — that stage is only ever reached via
 * the bespoke "mark as graduated" action (`models/labs-project.ts`'s header
 * comment), never a direct dropdown pick, so an editor can't set
 * `stage: "graduated"` without the paired `graduatedToBuildId` the action
 * also writes.
 */
const editableStageOptions = [
  { value: "active", label: "Active" },
  { value: "archived", label: "Archived" },
] as const;

export const labsProjectSchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "At least 3 characters.")
    .max(80, "Keep it under 80 characters.")
    .regex(slugPattern, "Lowercase letters, numbers, and hyphens only."),
  title: z.string().trim().min(1, "Required.").max(160),
  practiceArea: z.enum(practiceAreaValues, {
    error: "Choose a practice area.",
  }),
  description: z.string().trim().min(1, "Required.").max(20000),
  techTags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  coverImage: optionalObjectIdField("Choose a cover image from the media library."),
  stage: z.enum(["active", "archived"], { error: "Choose active or archived." }),
});

export type LabsProjectInput = z.infer<typeof labsProjectSchema>;

export const labsProjectEmptyStateMessage =
  "No Labs projects yet — create the first one to get started.";

export const labsProjectFormFields: FieldConfig<LabsProjectInput>[] = [
  { name: "title", label: "Title", type: "text", required: true },
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
  {
    name: "stage",
    label: "Stage",
    type: "select",
    required: true,
    options: [...editableStageOptions],
  },
];

export const labsProjectListColumns: TableColumn<LabsProjectRow>[] = [
  { key: "title", label: "Title", sortable: true },
  { key: "practiceArea", label: "Practice area" },
  {
    key: "stage",
    label: "Stage",
    render: (doc) => (
      <Badge
        tone={
          doc.stage === "graduated" ? "success" : doc.stage === "archived" ? "default" : "warning"
        }
      >
        {doc.stage}
      </Badge>
    ),
  },
  { key: "status", label: "Status", render: (doc) => <WorkflowStatusBadge status={doc.status} /> },
];

export const labsProjectFilters: FilterConfig<LabsProjectRow>[] = [
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "draft", label: "Draft" },
      { value: "published", label: "Published" },
    ],
  },
  {
    name: "practiceArea",
    label: "Practice area",
    type: "select",
    options: [...practiceAreaOptions],
  },
  {
    name: "stage",
    label: "Stage",
    type: "select",
    options: [...editableStageOptions, { value: "graduated", label: "Graduated" }],
  },
];
