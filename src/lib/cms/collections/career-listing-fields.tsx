import { z } from "zod";

import { WorkflowStatusBadge } from "@/components/admin/workflow-status-badge";
import { Badge } from "@/components/ui/badge";
import type { CareerListingDocument } from "@/models/career-listing";
import type { ClientDocument, FieldConfig, FilterConfig, TableColumn } from "@/types/cms";

export type CareerListingRow = ClientDocument<CareerListingDocument>;

export const listingStatusOptions = [
  { value: "open", label: "Open" },
  { value: "closed", label: "Closed" },
] as const;

export const careerListingSchema = z.object({
  title: z.string().trim().min(1, "Required.").max(200),
  description: z.string().trim().min(1, "Required.").max(8000),
  requirements: z.array(z.string().trim().min(1).max(200)).max(30).default([]),
  listingStatus: z.enum(["open", "closed"], { error: "Choose open or closed." }),
});

export type CareerListingInput = z.infer<typeof careerListingSchema>;

export const careerListingEmptyStateMessage =
  "No career listings yet — add the first open role to get started.";

export const careerListingFormFields: FieldConfig<CareerListingInput>[] = [
  { name: "title", label: "Title", type: "text", required: true },
  { name: "description", label: "Description", type: "richtext", required: true },
  { name: "requirements", label: "Requirements", type: "multiselect" },
  {
    name: "listingStatus",
    label: "Listing status",
    type: "select",
    required: true,
    options: [...listingStatusOptions],
    description: "Whether this role is still accepting applicants.",
  },
];

export const careerListingListColumns: TableColumn<CareerListingRow>[] = [
  { key: "title", label: "Title", sortable: true },
  {
    key: "listingStatus",
    label: "Applicants",
    render: (doc) => (
      <Badge tone={doc.listingStatus === "open" ? "success" : "default"}>
        {doc.listingStatus === "open" ? "Open" : "Closed"}
      </Badge>
    ),
  },
  { key: "status", label: "Status", render: (doc) => <WorkflowStatusBadge status={doc.status} /> },
  {
    key: "updatedAt",
    label: "Updated",
    sortable: true,
    render: (doc) => (doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString("en-US") : "—"),
  },
];

export const careerListingFilters: FilterConfig<CareerListingRow>[] = [
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
    name: "listingStatus",
    label: "Applicants",
    type: "select",
    options: [...listingStatusOptions],
  },
];
