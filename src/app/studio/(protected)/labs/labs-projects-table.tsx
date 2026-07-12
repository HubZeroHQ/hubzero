"use client";

import { bulkPublish, bulkRemove } from "@/actions/studio/labs-projects";
import { DataTable } from "@/components/admin/data-table/data-table";
import {
  labsProjectEmptyStateMessage,
  labsProjectFilters,
  labsProjectListColumns,
} from "@/lib/cms/collections/labs-project-fields";
import type { ClientDocument } from "@/types/cms";
import type { LabsProjectDocument } from "@/models/labs-project";

interface LabsProjectsTableProps {
  items: ClientDocument<LabsProjectDocument>[];
  hasNext: boolean;
  hasPrev: boolean;
  nextCursor?: string;
  isFiltered: boolean;
  canDelete: boolean;
  canPublish: boolean;
}

export function LabsProjectsTable({
  items,
  hasNext,
  hasPrev,
  nextCursor,
  isFiltered,
  canDelete,
  canPublish,
}: LabsProjectsTableProps) {
  return (
    <DataTable
      columns={labsProjectListColumns}
      filters={labsProjectFilters}
      items={items}
      hasNext={hasNext}
      hasPrev={hasPrev}
      nextCursor={nextCursor}
      isFiltered={isFiltered}
      emptyStateMessage={labsProjectEmptyStateMessage}
      rowHref={(doc) => `/studio/labs/${doc._id}`}
      bulkDelete={canDelete ? bulkRemove : undefined}
      bulkPublish={canPublish ? bulkPublish : undefined}
    />
  );
}
