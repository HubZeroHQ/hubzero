import type { Metadata } from "next";

import "@/lib/cms/collections";

import { PageHeader } from "@/components/marketing/page-header";
import { SearchBox } from "@/components/search/search-box";
import { SearchResults } from "@/components/search/search-results";
import { Container } from "@/components/ui/container";
import { publicSearch } from "@/lib/cms/search";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Search",
  description: "Search HubZero's case studies, blueprints, labs projects, notes, and team.",
  path: "/search",
});

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

/**
 * The public site's search (Phase G) — reuses `publicSearch()`
 * (`lib/cms/search.ts`), the same engine and registry-driven shape Phase F's
 * Studio search uses, filtered to published documents on collections with a
 * real public route. URL-driven (`?q=`) so a shared/bookmarked search link
 * reproduces the same results — no client-only state holds the query.
 */
export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "" } = await searchParams;
  const groups = await publicSearch(q);

  return (
    <div className="pt-16 pb-28 sm:pt-20 lg:pt-24">
      <Container>
        <PageHeader eyebrow="Search" headline="Find work, blueprints, and people.">
          <div className="mt-10 max-w-2xl">
            <SearchBox initialQuery={q} />
          </div>
        </PageHeader>

        <div className="mt-12">
          <SearchResults query={q} groups={groups} />
        </div>
      </Container>
    </div>
  );
}
