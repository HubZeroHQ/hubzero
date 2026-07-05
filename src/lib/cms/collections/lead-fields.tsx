import { LeadStatusBadge } from "@/components/admin/leads/lead-status-badge";
import { budgetRangeOptions, leadSchema, projectTypeOptions } from "@/lib/lead-schema";
import type { LeadInput } from "@/lib/lead-schema";
import type { LeadDocument } from "@/models/lead";
import type { ClientDocument, FieldConfig, FilterConfig, TableColumn } from "@/types/cms";

/**
 * Lead's table/filter config — kept Mongoose-import-free for the same reason
 * every other collection's `*-fields.tsx` is. Reuses `leadSchema`
 * (`lib/lead-schema.ts`, already the contact form's own validation) as the
 * collection config's `zodSchema` purely for type-shape purposes: Leads are
 * never created or edited through a generic `<CmsForm>` in `/studio`
 * (`formFields` below is empty), only read, triaged, and removed
 * (`ARCHITECTURE/19_CMS_FOUNDATION.md` §12's explicit "no draft/publish
 * workflow... system-generated, not authored" call).
 */

export type LeadRow = ClientDocument<LeadDocument>;

const projectTypeLabels = Object.fromEntries(
  projectTypeOptions.map((option) => [option.value, option.label]),
);
const budgetRangeLabels = Object.fromEntries(
  budgetRangeOptions.map((option) => [option.value, option.label]),
);

export { leadSchema };

export const leadEmptyStateMessage =
  "No leads yet — contact form submissions will show up here as they come in.";

// Never rendered — Leads have no create/edit `<CmsForm>` screen in `/studio`
// (`ARCHITECTURE/19_CMS_FOUNDATION.md` §12). Kept as an empty, correctly
// typed array purely so `leadConfig` (`lead.config.ts`) satisfies
// `CollectionConfig`'s shape without inventing a mismatched placeholder type.
export const leadFormFields: FieldConfig<LeadInput>[] = [];

export const leadListColumns: TableColumn<LeadRow>[] = [
  { key: "name", label: "Name", sortable: true },
  { key: "email", label: "Email" },
  {
    key: "projectType",
    label: "Project type",
    render: (doc) => projectTypeLabels[doc.projectType] ?? doc.projectType,
  },
  {
    key: "budgetRange",
    label: "Budget",
    render: (doc) => (doc.budgetRange ? (budgetRangeLabels[doc.budgetRange] ?? doc.budgetRange) : "—"),
  },
  { key: "status", label: "Status", render: (doc) => <LeadStatusBadge status={doc.status} /> },
  {
    key: "createdAt",
    label: "Submitted",
    sortable: true,
    render: (doc) => (doc.createdAt ? new Date(doc.createdAt).toLocaleDateString("en-US") : "—"),
  },
];

export const leadFilters: FilterConfig<LeadRow>[] = [
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "new", label: "New" },
      { value: "contacted", label: "Contacted" },
      { value: "closed", label: "Closed" },
    ],
  },
  {
    name: "projectType",
    label: "Project type",
    type: "select",
    options: [...projectTypeOptions],
  },
];
