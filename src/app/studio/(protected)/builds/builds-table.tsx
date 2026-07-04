"use client";

import { bulkPublish, bulkRemove } from "@/actions/studio/builds";
import { DataTable } from "@/components/admin/data-table/data-table";
import {
  buildEmptyStateMessage,
  buildFilters,
  buildListColumns,
} from "@/lib/cms/collections/build-fields";
import type { ClientDocument } from "@/types/cms";
import type { BuildDocument } from "@/models/build";

interface BuildsTableProps {
  items: ClientDocument<BuildDocument>[];
  hasNext: boolean;
  hasPrev: boolean;
  nextCursor?: string;
  isFiltered: boolean;
}

export function BuildsTable({ items, hasNext, hasPrev, nextCursor, isFiltered }: BuildsTableProps) {
  return (
    <DataTable
      columns={buildListColumns}
      filters={buildFilters}
      items={items}
      hasNext={hasNext}
      hasPrev={hasPrev}
      nextCursor={nextCursor}
      isFiltered={isFiltered}
      emptyStateMessage={buildEmptyStateMessage}
      rowHref={(doc) => `/studio/builds/${doc._id}`}
      bulkDelete={bulkRemove}
      bulkPublish={bulkPublish}
    />
  );
}
