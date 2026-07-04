import { Plus } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { list } from "@/actions/studio/faqs";
import { FaqsTable } from "@/app/studio/(protected)/faqs/faqs-table";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui";
import { faqFilters } from "@/lib/cms/collections/faq-fields";
import { can } from "@/lib/cms/permissions";
import { requireSessionUser } from "@/lib/cms/session";
import { parseTableSearchParams } from "@/lib/cms/table-search-params";

export const metadata: Metadata = {
  title: "FAQs — HubZero Studio",
};

interface FaqsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const FILTER_KEYS = faqFilters.map((filter) => filter.name);

export default async function FaqsListPage({ searchParams }: FaqsPageProps) {
  const user = await requireSessionUser();
  if (!can(user, "view", "faq")) redirect("/studio");

  const rawSearchParams = await searchParams;
  const params = parseTableSearchParams(rawSearchParams, FILTER_KEYS);
  const isFiltered = Boolean(params.q) || Object.keys(params.filters ?? {}).length > 0;

  const result = await list(params);

  return (
    <>
      <PageHeader
        title="FAQs"
        description="Questions and answers published to the site."
        actions={
          can(user, "create", "faq") ? (
            <Button href="/studio/faqs/new">
              <Plus className="h-4 w-4" aria-hidden="true" />
              New FAQ
            </Button>
          ) : undefined
        }
      />
      <FaqsTable
        items={result.items}
        hasNext={result.hasNext}
        hasPrev={result.hasPrev}
        nextCursor={result.nextCursor}
        isFiltered={isFiltered}
      />
    </>
  );
}
