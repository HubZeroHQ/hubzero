import { z } from "zod";

import { WorkflowStatusBadge } from "@/components/admin/workflow-status-badge";
import type { FaqDocument } from "@/models/faq";
import type { ClientDocument, FieldConfig, FilterConfig, TableColumn } from "@/types/cms";

export type FaqRow = ClientDocument<FaqDocument>;

export const faqSchema = z.object({
  question: z.string().trim().min(1, "Required.").max(300),
  answer: z.string().trim().min(1, "Required.").max(8000),
  category: z.string().trim().min(1, "Required.").max(80),
  // `order` is a numeric field rendered through the `text` form control
  // (`models/faq.ts`'s note) — `z.coerce.number()` turns the input's raw
  // string back into the number the Mongoose schema stores.
  order: z.coerce.number().int("Whole numbers only.").min(0, "Must be 0 or greater."),
});

export type FaqInput = z.infer<typeof faqSchema>;

export const faqEmptyStateMessage = "No FAQs yet — add the first one to get started.";

export const faqFormFields: FieldConfig<FaqInput>[] = [
  { name: "question", label: "Question", type: "text", required: true },
  { name: "answer", label: "Answer", type: "richtext", required: true },
  { name: "category", label: "Category", type: "text", required: true },
  {
    name: "order",
    label: "Order",
    type: "text",
    required: true,
    description: "Lower numbers sort first within a category.",
  },
];

export const faqListColumns: TableColumn<FaqRow>[] = [
  { key: "question", label: "Question", sortable: true },
  { key: "category", label: "Category", sortable: true },
  { key: "order", label: "Order", sortable: true },
  { key: "status", label: "Status", render: (doc) => <WorkflowStatusBadge status={doc.status} /> },
];

export const faqFilters: FilterConfig<FaqRow>[] = [
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "draft", label: "Draft" },
      { value: "published", label: "Published" },
    ],
  },
  { name: "category", label: "Category", type: "text" },
];
