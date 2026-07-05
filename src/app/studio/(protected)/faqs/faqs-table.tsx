"use client";

import { bulkPublish, bulkRemove } from "@/actions/studio/faqs";
import { DataTable } from "@/components/admin/data-table/data-table";
import { faqEmptyStateMessage, faqFilters, faqListColumns } from "@/lib/cms/collections/faq-fields";
import type { ClientDocument } from "@/types/cms";
import type { FaqDocument } from "@/models/faq";

interface FaqsTableProps {
  items: ClientDocument<FaqDocument>[];
  hasNext: boolean;
  hasPrev: boolean;
  nextCursor?: string;
  isFiltered: boolean;
  canDelete: boolean;
  canPublish: boolean;
}

export function FaqsTable({
  items,
  hasNext,
  hasPrev,
  nextCursor,
  isFiltered,
  canDelete,
  canPublish,
}: FaqsTableProps) {
  return (
    <DataTable
      columns={faqListColumns}
      filters={faqFilters}
      items={items}
      hasNext={hasNext}
      hasPrev={hasPrev}
      nextCursor={nextCursor}
      isFiltered={isFiltered}
      emptyStateMessage={faqEmptyStateMessage}
      rowHref={(doc) => `/studio/faqs/${doc._id}`}
      bulkDelete={canDelete ? bulkRemove : undefined}
      bulkPublish={canPublish ? bulkPublish : undefined}
    />
  );
}
