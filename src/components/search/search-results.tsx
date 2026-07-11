import { SearchX } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { Heading } from "@/components/ui/heading";
import { Link } from "@/components/ui/link";
import type { SearchResultGroup } from "@/lib/cms/search";

export interface SearchResultsProps {
  query: string;
  groups: SearchResultGroup[];
}

/** Renders `publicSearch()`'s grouped results, or a graceful empty state — for a blank query (nothing typed yet) and for a real query with zero matches alike, each with its own honest copy rather than one generic "nothing found." */
export function SearchResults({ query, groups }: SearchResultsProps) {
  if (!query.trim()) {
    return (
      <EmptyState
        icon={<SearchX className="size-8" />}
        title="Start typing to search"
        description="Search across case studies, blueprints, labs projects, notes, and team profiles."
      />
    );
  }

  if (groups.length === 0) {
    return (
      <EmptyState
        icon={<SearchX className="size-8" />}
        title="No results"
        description={`Nothing published matches "${query}". Try a different word or check the spelling.`}
      />
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {groups.map((group) => (
        <section key={group.resource}>
          <Heading level={3} className="mb-4">
            {group.label}
          </Heading>
          <ul className="divide-border-muted divide-y">
            {group.items.map((item) => (
              <li key={item.id} className="py-3">
                <Link href={item.href} className="text-body no-underline hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
