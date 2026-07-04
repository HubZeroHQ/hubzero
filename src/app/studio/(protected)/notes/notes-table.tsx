"use client";

import { bulkPublish, bulkRemove } from "@/actions/studio/notes";
import { DataTable } from "@/components/admin/data-table/data-table";
import {
  noteEmptyStateMessage,
  noteFilters,
  noteListColumns,
} from "@/lib/cms/collections/note-fields";
import type { ClientDocument } from "@/types/cms";
import type { NoteDocument } from "@/models/note";

interface NotesTableProps {
  items: ClientDocument<NoteDocument>[];
  hasNext: boolean;
  hasPrev: boolean;
  nextCursor?: string;
  isFiltered: boolean;
}

export function NotesTable({ items, hasNext, hasPrev, nextCursor, isFiltered }: NotesTableProps) {
  return (
    <DataTable
      columns={noteListColumns}
      filters={noteFilters}
      items={items}
      hasNext={hasNext}
      hasPrev={hasPrev}
      nextCursor={nextCursor}
      isFiltered={isFiltered}
      emptyStateMessage={noteEmptyStateMessage}
      rowHref={(doc) => `/studio/notes/${doc._id}`}
      bulkDelete={bulkRemove}
      bulkPublish={bulkPublish}
    />
  );
}
