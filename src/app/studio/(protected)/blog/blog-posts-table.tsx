"use client";

import { bulkPublish, bulkRemove } from "@/actions/studio/blog-posts";
import { DataTable } from "@/components/admin/data-table/data-table";
import {
  blogPostEmptyStateMessage,
  blogPostFilters,
  blogPostListColumns,
} from "@/lib/cms/collections/blog-post-fields";
import type { ClientDocument } from "@/types/cms";
import type { BlogPostDocument } from "@/models/blog-post";

interface BlogPostsTableProps {
  items: ClientDocument<BlogPostDocument>[];
  hasNext: boolean;
  hasPrev: boolean;
  nextCursor?: string;
  isFiltered: boolean;
}

export function BlogPostsTable({
  items,
  hasNext,
  hasPrev,
  nextCursor,
  isFiltered,
}: BlogPostsTableProps) {
  return (
    <DataTable
      columns={blogPostListColumns}
      filters={blogPostFilters}
      items={items}
      hasNext={hasNext}
      hasPrev={hasPrev}
      nextCursor={nextCursor}
      isFiltered={isFiltered}
      emptyStateMessage={blogPostEmptyStateMessage}
      rowHref={(doc) => `/studio/blog/${doc._id}`}
      bulkDelete={bulkRemove}
      bulkPublish={bulkPublish}
    />
  );
}
