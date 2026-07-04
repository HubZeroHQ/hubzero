import { Plus } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { list } from "@/actions/studio/testimonials";
import { TestimonialsTable } from "@/app/studio/(protected)/testimonials/testimonials-table";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui";
import { testimonialFilters } from "@/lib/cms/collections/testimonial-fields";
import { can } from "@/lib/cms/permissions";
import { requireSessionUser } from "@/lib/cms/session";
import { parseTableSearchParams } from "@/lib/cms/table-search-params";

export const metadata: Metadata = {
  title: "Testimonials — HubZero Studio",
};

interface TestimonialsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const FILTER_KEYS = testimonialFilters.map((filter) => filter.name);

export default async function TestimonialsListPage({ searchParams }: TestimonialsPageProps) {
  const user = await requireSessionUser();
  if (!can(user, "view", "testimonial")) redirect("/studio");

  const rawSearchParams = await searchParams;
  const params = parseTableSearchParams(rawSearchParams, FILTER_KEYS);
  const isFiltered = Boolean(params.q) || Object.keys(params.filters ?? {}).length > 0;

  const result = await list(params);

  return (
    <>
      <PageHeader
        title="Testimonials"
        description="Client quotes published across the site."
        actions={
          can(user, "create", "testimonial") ? (
            <Button href="/studio/testimonials/new">
              <Plus className="h-4 w-4" aria-hidden="true" />
              New testimonial
            </Button>
          ) : undefined
        }
      />
      <TestimonialsTable
        items={result.items}
        hasNext={result.hasNext}
        hasPrev={result.hasPrev}
        nextCursor={result.nextCursor}
        isFiltered={isFiltered}
      />
    </>
  );
}
