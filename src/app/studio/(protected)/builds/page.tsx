import { Plus } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { list } from "@/actions/studio/builds";
import { BuildsTable } from "@/app/studio/(protected)/builds/builds-table";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui";
import { buildFilters } from "@/lib/cms/collections/build-fields";
import { can } from "@/lib/cms/permissions";
import { requireSessionUser } from "@/lib/cms/session";
import { parseTableSearchParams } from "@/lib/cms/table-search-params";

export const metadata: Metadata = {
  title: "Builds — HubZero Studio",
};

interface BuildsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const FILTER_KEYS = buildFilters.map((filter) => filter.name);

export default async function BuildsListPage({ searchParams }: BuildsPageProps) {
  const user = await requireSessionUser();
  if (!can(user, "view", "build")) redirect("/studio");

  const rawSearchParams = await searchParams;
  const params = parseTableSearchParams(rawSearchParams, FILTER_KEYS);
  const isFiltered = Boolean(params.q) || Object.keys(params.filters ?? {}).length > 0;

  const result = await list(params);

  return (
    <>
      <PageHeader
        title="Builds"
        description="First-party HubZero products."
        actions={
          can(user, "create", "build") ? (
            <Button href="/studio/builds/new">
              <Plus className="h-4 w-4" aria-hidden="true" />
              New Build
            </Button>
          ) : undefined
        }
      />
      <BuildsTable
        items={result.items}
        hasNext={result.hasNext}
        hasPrev={result.hasPrev}
        nextCursor={result.nextCursor}
        isFiltered={isFiltered}
      />
    </>
  );
}
