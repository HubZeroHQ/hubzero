import { Plus } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { list } from "@/actions/studio/case-studies";
import { CaseStudiesTable } from "@/app/studio/(protected)/case-studies/case-studies-table";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui";
import { caseStudyFilters } from "@/lib/cms/collections/case-study-fields";
import { can } from "@/lib/cms/permissions";
import { requireSessionUser } from "@/lib/cms/session";
import { parseTableSearchParams } from "@/lib/cms/table-search-params";

export const metadata: Metadata = {
  title: "Case Studies — HubZero Studio",
};

interface CaseStudiesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const FILTER_KEYS = caseStudyFilters.map((filter) => filter.name);

export default async function CaseStudiesListPage({ searchParams }: CaseStudiesPageProps) {
  // Defense in depth (`ARCHITECTURE/19_CMS_FOUNDATION.md` §3): `list()` below
  // enforces this too, but the page deciding whether to render at all is one
  // of the three sanctioned enforcement points, not just the Server Action.
  const user = await requireSessionUser();
  if (!can(user, "view", "caseStudy")) redirect("/studio");

  const rawSearchParams = await searchParams;
  const params = parseTableSearchParams(rawSearchParams, FILTER_KEYS);
  const isFiltered = Boolean(params.q) || Object.keys(params.filters ?? {}).length > 0;

  const result = await list(params);

  return (
    <>
      <PageHeader
        title="Case Studies"
        description="Client work published to /work."
        actions={
          can(user, "create", "caseStudy") ? (
            <Button href="/studio/case-studies/new">
              <Plus className="h-4 w-4" aria-hidden="true" />
              New case study
            </Button>
          ) : undefined
        }
      />
      <CaseStudiesTable
        items={result.items}
        hasNext={result.hasNext}
        hasPrev={result.hasPrev}
        nextCursor={result.nextCursor}
        isFiltered={isFiltered}
      />
    </>
  );
}
