"use client";

import { bulkPublish, bulkRemove } from "@/actions/studio/career-listings";
import { DataTable } from "@/components/admin/data-table/data-table";
import {
  careerListingEmptyStateMessage,
  careerListingFilters,
  careerListingListColumns,
} from "@/lib/cms/collections/career-listing-fields";
import type { ClientDocument } from "@/types/cms";
import type { CareerListingDocument } from "@/models/career-listing";

interface CareerListingsTableProps {
  items: ClientDocument<CareerListingDocument>[];
  hasNext: boolean;
  hasPrev: boolean;
  nextCursor?: string;
  isFiltered: boolean;
  canDelete: boolean;
  canPublish: boolean;
}

export function CareerListingsTable({
  items,
  hasNext,
  hasPrev,
  nextCursor,
  isFiltered,
  canDelete,
  canPublish,
}: CareerListingsTableProps) {
  return (
    <DataTable
      columns={careerListingListColumns}
      filters={careerListingFilters}
      items={items}
      hasNext={hasNext}
      hasPrev={hasPrev}
      nextCursor={nextCursor}
      isFiltered={isFiltered}
      emptyStateMessage={careerListingEmptyStateMessage}
      rowHref={(doc) => `/studio/careers/${doc._id}`}
      bulkDelete={canDelete ? bulkRemove : undefined}
      bulkPublish={canPublish ? bulkPublish : undefined}
    />
  );
}
