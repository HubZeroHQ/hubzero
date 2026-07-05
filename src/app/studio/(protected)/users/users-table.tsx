"use client";

import { DataTable } from "@/components/admin/data-table/data-table";
import {
  userEmptyStateMessage,
  userFilters,
  userListColumns,
} from "@/lib/cms/collections/user-fields";
import type { UserDocument } from "@/models/user";
import type { ClientDocument } from "@/types/cms";

interface UsersTableProps {
  items: ClientDocument<UserDocument>[];
  hasNext: boolean;
  hasPrev: boolean;
  nextCursor?: string;
  isFiltered: boolean;
}

/**
 * No bulk delete here — unlike Case Studies/Leads, deleting a Head Admin
 * account is a one-at-a-time, deliberate action (the `[id]` page's danger
 * zone), not something to expose as a multi-row bulk operation.
 */
export function UsersTable({ items, hasNext, hasPrev, nextCursor, isFiltered }: UsersTableProps) {
  return (
    <DataTable
      columns={userListColumns}
      filters={userFilters}
      items={items}
      hasNext={hasNext}
      hasPrev={hasPrev}
      nextCursor={nextCursor}
      isFiltered={isFiltered}
      emptyStateMessage={userEmptyStateMessage}
      rowHref={(doc) => `/studio/users/${doc._id}`}
    />
  );
}
