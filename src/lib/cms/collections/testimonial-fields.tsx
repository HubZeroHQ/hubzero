import { z } from "zod";

import { WorkflowStatusBadge } from "@/components/admin/workflow-status-badge";
import { optionalObjectIdField } from "@/lib/cms/collections/shared-validation";
import { emptyToUndefined } from "@/lib/utils";
import type { TestimonialDocument } from "@/models/testimonial";
import type { ClientDocument, FieldConfig, FilterConfig, TableColumn } from "@/types/cms";

export type TestimonialRow = ClientDocument<TestimonialDocument>;

export const testimonialSchema = z.object({
  quote: z.string().trim().min(1, "Required.").max(2000, "Keep it under 2,000 characters."),
  name: z.string().trim().min(1, "Required.").max(160),
  title: z.string().trim().min(1, "Required.").max(160),
  company: z.preprocess(emptyToUndefined, z.string().trim().max(160).optional()),
  linkedCaseStudy: optionalObjectIdField("Enter a valid Case Study ID."),
});

export type TestimonialInput = z.infer<typeof testimonialSchema>;

export const testimonialEmptyStateMessage =
  "No testimonials yet — add the first one to get started.";

export const testimonialFormFields: FieldConfig<TestimonialInput>[] = [
  { name: "quote", label: "Quote", type: "textarea", required: true },
  { name: "name", label: "Attributed name", type: "text", required: true },
  { name: "title", label: "Title", type: "text", required: true },
  { name: "company", label: "Company", type: "text" },
  {
    name: "linkedCaseStudy",
    label: "Linked case study",
    type: "reference",
    resource: "caseStudy",
    labelField: "client",
  },
];

export const testimonialListColumns: TableColumn<TestimonialRow>[] = [
  { key: "name", label: "Name", sortable: true },
  { key: "title", label: "Title" },
  { key: "company", label: "Company" },
  { key: "status", label: "Status", render: (doc) => <WorkflowStatusBadge status={doc.status} /> },
  {
    key: "updatedAt",
    label: "Updated",
    sortable: true,
    render: (doc) => (doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString("en-US") : "—"),
  },
];

export const testimonialFilters: FilterConfig<TestimonialRow>[] = [
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "draft", label: "Draft" },
      { value: "published", label: "Published" },
    ],
  },
];
