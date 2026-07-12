import { Plus } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { list } from "@/actions/studio/notes";
import { NotesTable } from "@/app/studio/(protected)/notes/notes-table";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui";
import { noteFilters } from "@/lib/cms/collections/note-fields";
import { can } from "@/lib/cms/permissions";
import { requireSessionUser } from "@/lib/cms/session";
import { parseTableSearchParams } from "@/lib/cms/table-search-params";

export const metadata: Metadata = {
  title: "Notes — HubZero Studio",
};

interface NotesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const FILTER_KEYS = noteFilters.map((filter) => filter.name);

export default async function NotesListPage({ searchParams }: NotesPageProps) {
  const user = await requireSessionUser();
  if (!can(user, "view", "note")) redirect("/studio");

  const rawSearchParams = await searchParams;
  const params = parseTableSearchParams(rawSearchParams, FILTER_KEYS);
  const isFiltered = Boolean(params.q) || Object.keys(params.filters ?? {}).length > 0;

  const result = await list(params);

  return (
    <>
      <PageHeader
        title="Notes"
        description="Notes published to /notes."
        actions={
          can(user, "create", "note") ? (
            <Button href="/studio/notes/new">
              <Plus className="h-4 w-4" aria-hidden="true" />
              New note
            </Button>
          ) : undefined
        }
      />
      <NotesTable
        items={result.items}
        hasNext={result.hasNext}
        hasPrev={result.hasPrev}
        nextCursor={result.nextCursor}
        isFiltered={isFiltered}
        canDelete={can(user, "delete", "note")}
        canPublish={can(user, "publish", "note")}
      />
    </>
  );
}
