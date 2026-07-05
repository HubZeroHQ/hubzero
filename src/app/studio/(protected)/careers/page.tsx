import { Plus } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { list } from "@/actions/studio/career-listings";
import { CareerListingsTable } from "@/app/studio/(protected)/careers/career-listings-table";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui";
import { careerListingFilters } from "@/lib/cms/collections/career-listing-fields";
import { can } from "@/lib/cms/permissions";
import { requireSessionUser } from "@/lib/cms/session";
import { parseTableSearchParams } from "@/lib/cms/table-search-params";

export const metadata: Metadata = {
  title: "Careers — HubZero Studio",
};

interface CareerListingsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const FILTER_KEYS = careerListingFilters.map((filter) => filter.name);

export default async function CareerListingsListPage({ searchParams }: CareerListingsPageProps) {
  const user = await requireSessionUser();
  if (!can(user, "view", "careerListing")) redirect("/studio");

  const rawSearchParams = await searchParams;
  const params = parseTableSearchParams(rawSearchParams, FILTER_KEYS);
  const isFiltered = Boolean(params.q) || Object.keys(params.filters ?? {}).length > 0;

  const result = await list(params);

  return (
    <>
      <PageHeader
        title="Careers"
        description="Open roles published to /careers."
        actions={
          can(user, "create", "careerListing") ? (
            <Button href="/studio/careers/new">
              <Plus className="h-4 w-4" aria-hidden="true" />
              New listing
            </Button>
          ) : undefined
        }
      />
      <CareerListingsTable
        items={result.items}
        hasNext={result.hasNext}
        hasPrev={result.hasPrev}
        nextCursor={result.nextCursor}
        isFiltered={isFiltered}
        canDelete={can(user, "delete", "careerListing")}
        canPublish={can(user, "publish", "careerListing")}
      />
    </>
  );
}
