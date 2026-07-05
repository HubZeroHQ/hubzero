import {
  leadEmptyStateMessage,
  leadFilters,
  leadFormFields,
  leadListColumns,
  leadSchema,
} from "@/lib/cms/collections/lead-fields";
import { defineCollection, registerCollection } from "@/lib/cms/collection-config";
import type { LeadInput } from "@/lib/lead-schema";
import { Lead, type LeadDocument } from "@/models/lead";

/**
 * The Mongoose-touching half of the Lead collection — deliberately
 * separate from `lead-fields.tsx`, matching every other collection's split.
 * `workflow: "none"` (`ARCHITECTURE/19_CMS_FOUNDATION.md` §12): registering
 * this is what lets the Leads inbox reuse the generic `list()`/`getOne()`/
 * `remove()` (cursor pagination, filter/search wiring, `<DataTable>`) for
 * free — the one piece of reuse §12 explicitly calls "legitimate and free" —
 * without pulling in any draft/publish/version-history machinery, since
 * `createCrudActions()`'s `submitForReview`/`publish` both refuse to run
 * against a `workflow: "none"` config.
 */
export const leadConfig = registerCollection(
  defineCollection<LeadDocument, LeadInput>({
    resource: "lead",
    label: "Leads",
    model: Lead,
    zodSchema: leadSchema,
    workflow: "none",
    listColumns: leadListColumns,
    filters: leadFilters,
    formFields: leadFormFields,
    searchableFields: ["name", "email", "company", "message"],
    emptyStateMessage: leadEmptyStateMessage,
    studioBasePath: "leads",
    recordLabel: (doc) => doc.name,
  }),
);
