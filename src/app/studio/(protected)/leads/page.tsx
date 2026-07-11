import type { Metadata } from "next";
import { redirect } from "next/navigation";

import "@/lib/cms/collections";

import { exportLeadsCsv, getAssignableUsers, list } from "@/actions/studio/leads";
import { LeadExportButton } from "@/app/studio/(protected)/leads/lead-export-button";
import { LeadsTable } from "@/app/studio/(protected)/leads/leads-table";
import { PageHeader } from "@/components/admin/page-header";
import { leadFilters } from "@/lib/cms/collections/lead-fields";
import { can } from "@/lib/cms/permissions";
import { requireSessionUser } from "@/lib/cms/session";
import { parseTableSearchParams } from "@/lib/cms/table-search-params";

export const metadata: Metadata = {
  title: "Leads — HubZero Studio",
};

interface LeadsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const FILTER_KEYS = leadFilters.map((filter) => filter.name);

/**
 * The lead inbox (`ARCHITECTURE/19_CMS_FOUNDATION.md` §4, §12) — search,
 * filter, and pagination are the generic `<DataTable>`'s, for free; there is
 * no "New lead" action (Leads are system-generated from `/contact`, never
 * authored here).
 */
export default async function LeadsListPage({ searchParams }: LeadsPageProps) {
  const user = await requireSessionUser();
  if (!can(user, "view", "lead")) redirect("/studio");

  const rawSearchParams = await searchParams;
  const params = parseTableSearchParams(rawSearchParams, FILTER_KEYS);
  const isFiltered = Boolean(params.q) || Object.keys(params.filters ?? {}).length > 0;

  const canEdit = can(user, "edit", "lead");
  const [result, assignableUsers] = await Promise.all([
    list(params),
    canEdit ? getAssignableUsers() : Promise.resolve([]),
  ]);

  return (
    <>
      <PageHeader
        title="Leads"
        description="Contact form submissions — search, filter, triage, and assign."
        actions={<LeadExportButton exportCsv={exportLeadsCsv} />}
      />
      <LeadsTable
        items={result.items}
        hasNext={result.hasNext}
        hasPrev={result.hasPrev}
        nextCursor={result.nextCursor}
        isFiltered={isFiltered}
        canDelete={can(user, "delete", "lead")}
        canEdit={canEdit}
        assignableUsers={assignableUsers}
      />
    </>
  );
}
