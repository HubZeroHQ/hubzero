"use client";

import { bulkPublish, bulkRemove } from "@/actions/studio/blueprints";
import { DataTable } from "@/components/admin/data-table/data-table";
import {
  blueprintEmptyStateMessage,
  blueprintFilters,
  blueprintListColumns,
} from "@/lib/cms/collections/blueprint-fields";
import type { ClientDocument } from "@/types/cms";
import type { BlueprintDocument } from "@/models/blueprint";

interface BlueprintsTableProps {
  items: ClientDocument<BlueprintDocument>[];
  hasNext: boolean;
  hasPrev: boolean;
  nextCursor?: string;
  isFiltered: boolean;
}

export function BlueprintsTable({
  items,
  hasNext,
  hasPrev,
  nextCursor,
  isFiltered,
}: BlueprintsTableProps) {
  return (
    <DataTable
      columns={blueprintListColumns}
      filters={blueprintFilters}
      items={items}
      hasNext={hasNext}
      hasPrev={hasPrev}
      nextCursor={nextCursor}
      isFiltered={isFiltered}
      emptyStateMessage={blueprintEmptyStateMessage}
      rowHref={(doc) => `/studio/blueprints/${doc._id}`}
      bulkDelete={bulkRemove}
      bulkPublish={bulkPublish}
    />
  );
}
