import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { blocksField } from "@/lib/cms/blocks/schema";
import {
  cardFieldsSchemaShape,
  contributorsFormField,
  featuredFormField,
  featuredListColumn,
  statusListColumn,
} from "@/lib/cms/collections/card-fields";
import { optionalObjectIdField } from "@/lib/cms/collections/shared-validation";
import { emptyToUndefined } from "@/lib/utils";
import type { BlueprintDocument } from "@/models/blueprint";
import type { ClientDocument, FieldConfig, FilterConfig, TableColumn } from "@/types/cms";

export type BlueprintRow = ClientDocument<BlueprintDocument>;

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const demoStatusOptions = [
  { value: "live", label: "Live" },
  { value: "stale", label: "Stale" },
  { value: "retired", label: "Retired" },
] as const;

export const blueprintSchema = z.object({
  blueprintId: z.string().trim().min(1, "Required.").max(60),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "At least 3 characters.")
    .max(80, "Keep it under 80 characters.")
    .regex(slugPattern, "Lowercase letters, numbers, and hyphens only."),
  name: z.string().trim().min(1, "Required.").max(160),
  category: z.string().trim().min(1, "Required.").max(80),
  summary: z.string().trim().min(1, "Required.").max(400),
  content: blocksField(),
  techStack: z.array(z.string().trim().min(1).max(40)).max(30).default([]),
  coverImage: optionalObjectIdField("Choose a cover image from the media library."),
  ...cardFieldsSchemaShape,
  previewUrl: z.preprocess(emptyToUndefined, z.url("Enter a valid URL.").optional()),
  demoDeploymentUrl: z.preprocess(emptyToUndefined, z.url("Enter a valid URL.").optional()),
  demoStatus: z.enum(["live", "stale", "retired"], { error: "Choose a demo status." }),
});

export type BlueprintInput = z.infer<typeof blueprintSchema>;

export const blueprintEmptyStateMessage =
  "No Blueprints yet — create the first one to get started.";

export const blueprintFormFields: FieldConfig<BlueprintInput>[] = [
  { name: "name", label: "Name", type: "text", required: true, group: "General" },
  { name: "blueprintId", label: "Blueprint ID", type: "text", required: true, group: "General" },
  {
    name: "slug",
    label: "Slug",
    type: "text",
    required: true,
    description: "Used in the public URL — lowercase, hyphenated.",
    group: "General",
  },
  { name: "category", label: "Category", type: "text", required: true, group: "General" },
  { name: "summary", label: "Card summary", type: "textarea", required: true, group: "General" },
  { name: "coverImage", label: "Cover image", type: "image", group: "Media" },
  { name: "techStack", label: "Tech stack", type: "multiselect", group: "Card" },
  contributorsFormField(),
  featuredFormField(),
  { name: "previewUrl", label: "Preview URL", type: "url", group: "Demo" },
  { name: "demoDeploymentUrl", label: "Demo deployment URL", type: "url", group: "Demo" },
  {
    name: "demoStatus",
    label: "Demo status",
    type: "select",
    required: true,
    options: [...demoStatusOptions],
    description: 'Publishing is blocked unless this is "Live".',
    group: "Demo",
  },
  { name: "content", label: "Content", type: "blocks", required: true, group: "Content" },
];

export const blueprintListColumns: TableColumn<BlueprintRow>[] = [
  { key: "name", label: "Name", sortable: true },
  { key: "category", label: "Category" },
  {
    key: "demoStatus",
    label: "Demo",
    render: (doc) => (
      <Badge
        tone={
          doc.demoStatus === "live" ? "success" : doc.demoStatus === "stale" ? "warning" : "default"
        }
      >
        {doc.demoStatus}
      </Badge>
    ),
  },
  featuredListColumn(),
  statusListColumn(),
];

export const blueprintFilters: FilterConfig<BlueprintRow>[] = [
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
  { name: "demoStatus", label: "Demo status", type: "select", options: [...demoStatusOptions] },
];
