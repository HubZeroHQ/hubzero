"use client";

import {
  bulkArchiveLeads,
  bulkAssignLeads,
  bulkRemove,
  type AssignableUser,
} from "@/actions/studio/leads";
import { LeadBulkAssign } from "@/app/studio/(protected)/leads/lead-bulk-assign";
import { DataTable } from "@/components/admin/data-table/data-table";
import {
  leadEmptyStateMessage,
  leadFilters,
  leadListColumns,
} from "@/lib/cms/collections/lead-fields";
import type { ClientDocument } from "@/types/cms";
import type { LeadDocument } from "@/models/lead";

interface LeadsTableProps {
  items: ClientDocument<LeadDocument>[];
  hasNext: boolean;
  hasPrev: boolean;
  nextCursor?: string;
  isFiltered: boolean;
  canDelete: boolean;
  canEdit: boolean;
  assignableUsers: AssignableUser[];
}

/** No `bulkPublish` — Leads have no publish workflow (`workflow: "none"`); bulk delete alone matches the "deletion on request" retention rule (`ARCHITECTURE/11_DATABASE_ARCHITECTURE.md` §7). */
export function LeadsTable({
  items,
  hasNext,
  hasPrev,
  nextCursor,
  isFiltered,
  canDelete,
  canEdit,
  assignableUsers,
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
      bulkArchive={canEdit ? bulkArchiveLeads : undefined}
      extraBulkActions={
        canEdit
          ? (selectedIds, onDone) => (
              <LeadBulkAssign
                selectedIds={selectedIds}
                onDone={onDone}
                assignableUsers={assignableUsers}
                bulkAssign={bulkAssignLeads}
              />
            )
          : undefined
      }
    />
  );
}
