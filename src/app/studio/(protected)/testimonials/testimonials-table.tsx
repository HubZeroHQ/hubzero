"use client";

import { bulkPublish, bulkRemove } from "@/actions/studio/testimonials";
import { DataTable } from "@/components/admin/data-table/data-table";
import {
  testimonialEmptyStateMessage,
  testimonialFilters,
  testimonialListColumns,
} from "@/lib/cms/collections/testimonial-fields";
import type { ClientDocument } from "@/types/cms";
import type { TestimonialDocument } from "@/models/testimonial";

interface TestimonialsTableProps {
  items: ClientDocument<TestimonialDocument>[];
  hasNext: boolean;
  hasPrev: boolean;
  nextCursor?: string;
  isFiltered: boolean;
}

export function TestimonialsTable({
  items,
  hasNext,
  hasPrev,
  nextCursor,
  isFiltered,
}: TestimonialsTableProps) {
  return (
    <DataTable
      columns={testimonialListColumns}
      filters={testimonialFilters}
      items={items}
      hasNext={hasNext}
      hasPrev={hasPrev}
      nextCursor={nextCursor}
      isFiltered={isFiltered}
      emptyStateMessage={testimonialEmptyStateMessage}
      rowHref={(doc) => `/studio/testimonials/${doc._id}`}
      bulkDelete={bulkRemove}
      bulkPublish={bulkPublish}
    />
  );
}
