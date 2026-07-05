import { Plus } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import "@/lib/cms/collections";

import { list } from "@/actions/studio/users";
import { UsersTable } from "@/app/studio/(protected)/users/users-table";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui";
import { userFilters } from "@/lib/cms/collections/user-fields";
import { can } from "@/lib/cms/permissions";
import { requireSessionUser } from "@/lib/cms/session";
import { parseTableSearchParams } from "@/lib/cms/table-search-params";

export const metadata: Metadata = {
  title: "Users — HubZero Studio",
};

interface UsersPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const FILTER_KEYS = userFilters.map((filter) => filter.name);

/**
 * Head-Admin-only account management (`ARCHITECTURE/12_ADMIN_PANEL_SPECIFICATION.md`
 * §2) — search, filter, and pagination are the generic `<DataTable>`'s, for
 * free, the same reuse the Leads inbox already establishes for a
 * `workflow: "none"` collection.
 */
export default async function UsersListPage({ searchParams }: UsersPageProps) {
  const user = await requireSessionUser();
  if (!can(user, "manageUsers", "user")) redirect("/studio");

  const rawSearchParams = await searchParams;
  const params = parseTableSearchParams(rawSearchParams, FILTER_KEYS);
  const isFiltered = Boolean(params.q) || Object.keys(params.filters ?? {}).length > 0;

  const result = await list(params);

  return (
    <>
      <PageHeader
        title="Users"
        description="Studio accounts — roles, access, and disable/delete safeguards."
        actions={
          <Button href="/studio/users/new">
            <Plus className="h-4 w-4" aria-hidden="true" />
            New user
          </Button>
        }
      />
      <UsersTable
        items={result.items}
        hasNext={result.hasNext}
        hasPrev={result.hasPrev}
        nextCursor={result.nextCursor}
        isFiltered={isFiltered}
      />
    </>
  );
}
