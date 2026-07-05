"use client";

import { bulkPublish, bulkRemove } from "@/actions/studio/team-members";
import { DataTable } from "@/components/admin/data-table/data-table";
import {
  teamMemberEmptyStateMessage,
  teamMemberFilters,
  teamMemberListColumns,
} from "@/lib/cms/collections/team-member-fields";
import type { ClientDocument } from "@/types/cms";
import type { TeamMemberDocument } from "@/models/team-member";

interface TeamMembersTableProps {
  items: ClientDocument<TeamMemberDocument>[];
  hasNext: boolean;
  hasPrev: boolean;
  nextCursor?: string;
  isFiltered: boolean;
}

/**
 * A per-collection Client Component wrapper, not a `DataTable` used directly
 * from the Server Component list page — `teamMemberListColumns`'s `render`
 * functions return JSX closures, which can't cross the Server→Client props
 * boundary (see `case-studies-table.tsx`'s identical note).
 */
export function TeamMembersTable({
  items,
  hasNext,
  hasPrev,
  nextCursor,
  isFiltered,
}: TeamMembersTableProps) {
  return (
    <DataTable
      columns={teamMemberListColumns}
      filters={teamMemberFilters}
      items={items}
      hasNext={hasNext}
      hasPrev={hasPrev}
      nextCursor={nextCursor}
      isFiltered={isFiltered}
      emptyStateMessage={teamMemberEmptyStateMessage}
      rowHref={(doc) => `/studio/team/${doc._id}`}
      bulkDelete={bulkRemove}
      bulkPublish={bulkPublish}
    />
  );
}
