import { Plus } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { list } from "@/actions/studio/team-members";
import { TeamMembersTable } from "@/app/studio/(protected)/team/team-members-table";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui";
import { teamMemberFilters } from "@/lib/cms/collections/team-member-fields";
import { can } from "@/lib/cms/permissions";
import { requireSessionUser } from "@/lib/cms/session";
import { parseTableSearchParams } from "@/lib/cms/table-search-params";

export const metadata: Metadata = {
  title: "Team — HubZero Studio",
};

interface TeamListPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const FILTER_KEYS = teamMemberFilters.map((filter) => filter.name);

export default async function TeamListPage({ searchParams }: TeamListPageProps) {
  const user = await requireSessionUser();
  if (!can(user, "view", "teamMember")) redirect("/studio");

  const rawSearchParams = await searchParams;
  const params = parseTableSearchParams(rawSearchParams, FILTER_KEYS);
  const isFiltered = Boolean(params.q) || Object.keys(params.filters ?? {}).length > 0;

  const result = await list(params);

  return (
    <>
      <PageHeader
        title="Team"
        description="Profiles published to /team."
        actions={
          can(user, "create", "teamMember") ? (
            <Button href="/studio/team/new">
              <Plus className="h-4 w-4" aria-hidden="true" />
              New team member
            </Button>
          ) : undefined
        }
      />
      <TeamMembersTable
        items={result.items}
        hasNext={result.hasNext}
        hasPrev={result.hasPrev}
        nextCursor={result.nextCursor}
        isFiltered={isFiltered}
        canDelete={can(user, "delete", "teamMember")}
        canPublish={can(user, "publish", "teamMember")}
      />
    </>
  );
}
