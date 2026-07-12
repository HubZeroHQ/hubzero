import { Plus } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { list } from "@/actions/studio/labs-projects";
import { LabsProjectsTable } from "@/app/studio/(protected)/labs/labs-projects-table";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui";
import { labsProjectFilters } from "@/lib/cms/collections/labs-project-fields";
import { can } from "@/lib/cms/permissions";
import { requireSessionUser } from "@/lib/cms/session";
import { parseTableSearchParams } from "@/lib/cms/table-search-params";

export const metadata: Metadata = {
  title: "Labs Projects — HubZero Studio",
};

interface LabsProjectsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const FILTER_KEYS = labsProjectFilters.map((filter) => filter.name);

export default async function LabsProjectsListPage({ searchParams }: LabsProjectsPageProps) {
  const user = await requireSessionUser();
  if (!can(user, "view", "labsProject")) redirect("/studio");

  const rawSearchParams = await searchParams;
  const params = parseTableSearchParams(rawSearchParams, FILTER_KEYS);
  const isFiltered = Boolean(params.q) || Object.keys(params.filters ?? {}).length > 0;

  const result = await list(params);

  return (
    <>
      <PageHeader
        title="Labs Projects"
        description="Exploratory engineering published to /labs."
        actions={
          can(user, "create", "labsProject") ? (
            <Button href="/studio/labs/new">
              <Plus className="h-4 w-4" aria-hidden="true" />
              New Labs project
            </Button>
          ) : undefined
        }
      />
      <LabsProjectsTable
        items={result.items}
        hasNext={result.hasNext}
        hasPrev={result.hasPrev}
        nextCursor={result.nextCursor}
        isFiltered={isFiltered}
        canDelete={can(user, "delete", "labsProject")}
        canPublish={can(user, "publish", "labsProject")}
      />
    </>
  );
}
