import { Plus } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { list } from "@/actions/studio/blog-posts";
import { BlogPostsTable } from "@/app/studio/(protected)/blog/blog-posts-table";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui";
import { blogPostFilters } from "@/lib/cms/collections/blog-post-fields";
import { can } from "@/lib/cms/permissions";
import { requireSessionUser } from "@/lib/cms/session";
import { parseTableSearchParams } from "@/lib/cms/table-search-params";

export const metadata: Metadata = {
  title: "Blog — HubZero Studio",
};

interface BlogPostsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const FILTER_KEYS = blogPostFilters.map((filter) => filter.name);

export default async function BlogPostsListPage({ searchParams }: BlogPostsPageProps) {
  const user = await requireSessionUser();
  if (!can(user, "view", "blogPost")) redirect("/studio");

  const rawSearchParams = await searchParams;
  const params = parseTableSearchParams(rawSearchParams, FILTER_KEYS);
  const isFiltered = Boolean(params.q) || Object.keys(params.filters ?? {}).length > 0;

  const result = await list(params);

  return (
    <>
      <PageHeader
        title="Blog"
        description="Posts published to /blog."
        actions={
          can(user, "create", "blogPost") ? (
            <Button href="/studio/blog/new">
              <Plus className="h-4 w-4" aria-hidden="true" />
              New post
            </Button>
          ) : undefined
        }
      />
      <BlogPostsTable
        items={result.items}
        hasNext={result.hasNext}
        hasPrev={result.hasPrev}
        nextCursor={result.nextCursor}
        isFiltered={isFiltered}
      />
    </>
  );
}
