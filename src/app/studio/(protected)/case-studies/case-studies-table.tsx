"use client";

import { bulkPublish, bulkRemove } from "@/actions/studio/case-studies";
import { DataTable } from "@/components/admin/data-table/data-table";
import {
  caseStudyEmptyStateMessage,
  caseStudyFilters,
  caseStudyListColumns,
} from "@/lib/cms/collections/case-study-fields";
import type { ClientDocument } from "@/types/cms";
import type { CaseStudyDocument } from "@/models/case-study";

interface CaseStudiesTableProps {
  items: ClientDocument<CaseStudyDocument>[];
  hasNext: boolean;
  hasPrev: boolean;
  nextCursor?: string;
  isFiltered: boolean;
  canDelete: boolean;
  canPublish: boolean;
}

/**
 * A per-collection Client Component wrapper, not a `DataTable` used directly
 * from the Server Component list page: `caseStudyListColumns`' `render`
 * functions return JSX closures, which can't cross the Server→Client props
 * boundary (only plain data and Server Actions can). Importing the column
 * config directly here, inside the Client Component's own module, avoids
 * that boundary entirely — only `items` and the two bulk Server Actions
 * cross it.
 */
export function CaseStudiesTable({
  items,
  hasNext,
  hasPrev,
  nextCursor,
  isFiltered,
  canDelete,
  canPublish,
}: CaseStudiesTableProps) {
  return (
    <DataTable
      columns={caseStudyListColumns}
      filters={caseStudyFilters}
      items={items}
      hasNext={hasNext}
      hasPrev={hasPrev}
      nextCursor={nextCursor}
      isFiltered={isFiltered}
      emptyStateMessage={caseStudyEmptyStateMessage}
      rowHref={(doc) => `/studio/case-studies/${doc._id}`}
      bulkDelete={canDelete ? bulkRemove : undefined}
      bulkPublish={canPublish ? bulkPublish : undefined}
    />
  );
}
