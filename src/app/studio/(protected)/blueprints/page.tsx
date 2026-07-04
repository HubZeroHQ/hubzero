import { Plus } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { list } from "@/actions/studio/blueprints";
import { BlueprintsTable } from "@/app/studio/(protected)/blueprints/blueprints-table";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui";
import { blueprintFilters } from "@/lib/cms/collections/blueprint-fields";
import { can } from "@/lib/cms/permissions";
import { requireSessionUser } from "@/lib/cms/session";
import { parseTableSearchParams } from "@/lib/cms/table-search-params";

export const metadata: Metadata = {
  title: "Blueprints — HubZero Studio",
};

interface BlueprintsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const FILTER_KEYS = blueprintFilters.map((filter) => filter.name);

export default async function BlueprintsListPage({ searchParams }: BlueprintsPageProps) {
  const user = await requireSessionUser();
  if (!can(user, "view", "blueprint")) redirect("/studio");

  const rawSearchParams = await searchParams;
  const params = parseTableSearchParams(rawSearchParams, FILTER_KEYS);
  const isFiltered = Boolean(params.q) || Object.keys(params.filters ?? {}).length > 0;

  const result = await list(params);

  return (
    <>
      <PageHeader
        title="Blueprints"
        description="Reusable, customizable production-ready foundations."
        actions={
          can(user, "create", "blueprint") ? (
            <Button href="/studio/blueprints/new">
              <Plus className="h-4 w-4" aria-hidden="true" />
              New Blueprint
            </Button>
          ) : undefined
        }
      />
      <BlueprintsTable
        items={result.items}
        hasNext={result.hasNext}
        hasPrev={result.hasPrev}
        nextCursor={result.nextCursor}
        isFiltered={isFiltered}
      />
    </>
  );
}
