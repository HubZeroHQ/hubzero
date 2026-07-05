"use client";

import { bulkRemove } from "@/actions/studio/leads";
import { DataTable } from "@/components/admin/data-table/data-table";
import { leadEmptyStateMessage, leadFilters, leadListColumns } from "@/lib/cms/collections/lead-fields";
import type { ClientDocument } from "@/types/cms";
import type { LeadDocument } from "@/models/lead";

interface LeadsTableProps {
  items: ClientDocument<LeadDocument>[];
  hasNext: boolean;
  hasPrev: boolean;
  nextCursor?: string;
  isFiltered: boolean;
  canDelete: boolean;
}

/** No `bulkPublish` — Leads have no publish workflow (`workflow: "none"`); bulk delete alone matches the "deletion on request" retention rule (`ARCHITECTURE/11_DATABASE_ARCHITECTURE.md` §7). */
export function LeadsTable({
  items,
  hasNext,
  hasPrev,
  nextCursor,
  isFiltered,
  canDelete,
}: LeadsTableProps) {
  return (
    <DataTable
      columns={leadListColumns}
      filters={leadFilters}
      items={items}
      hasNext={hasNext}
      hasPrev={hasPrev}
      nextCursor={nextCursor}
      isFiltered={isFiltered}
      emptyStateMessage={leadEmptyStateMessage}
      rowHref={(doc) => `/studio/leads/${doc._id}`}
      bulkDelete={canDelete ? bulkRemove : undefined}
    />
  );
}
