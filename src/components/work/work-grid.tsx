"use client";

import { useState } from "react";

import { FeaturedBadge } from "@/components/marketing/card-meta";
import { EntryRow } from "@/components/marketing/entry-row";
import { FilterChip } from "@/components/marketing/filter-chip";
import { EmptyState } from "@/components/ui/empty-state";
import type { PublicTeamMember } from "@/lib/cms/public-content";

export interface WorkGridItem {
  slug: string;
  client: string;
  /** A short, single-line teaser derived from the full `result` field — see `[slug]/page.tsx` for the full write-up. */
  resultTeaser: string;
  practiceArea: string;
  cover: { url: string; alt: string; width?: number; height?: number } | null;
  techTags: string[];
  featured: boolean;
  readingTimeMinutes: number;
  contributors: PublicTeamMember[];
}

const practiceAreaLabels: Record<string, string> = {
  software: "Software Engineering",
  hardware: "Hardware & Embedded",
  both: "Software + Hardware",
  ai: "AI",
};

const practiceTags = [
  { label: "All work", value: "all" },
  { label: "Software Engineering", value: "software" },
  { label: "Hardware & Embedded", value: "hardware" },
] as const;

/**
 * ARCHITECTURE/06_PAGE_SPECIFICATIONS.md "Work — index": filter by practice
 * area, case study cards. Now reads real `CaseStudy` documents (passed in as
 * `items`, fetched server-side in `page.tsx`) instead of the retired static
 * `config/case-studies.ts` — same editorial row layout, same honest
 * empty-state-per-filter behavior.
 */
export function WorkGrid({ items }: { items: WorkGridItem[] }) {
  const [active, setActive] = useState<string>("all");
  const filtered = items.filter((item) => active === "all" || item.practiceArea === active);

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by practice area">
        {practiceTags.map((tag) => (
          <FilterChip
            key={tag.value}
            active={tag.value === active}
            onClick={() => setActive(tag.value)}
          >
            {tag.label}
          </FilterChip>
        ))}
      </div>

      <div className="divide-border-muted mt-12 divide-y">
        {filtered.length === 0 && (
          <EmptyState
            title="No case studies here yet"
            description="This practice area doesn't have a published case study yet — but the work is real and ongoing. Get in touch to talk through it directly."
          />
        )}

        {filtered.map((item) => (
          <EntryRow
            key={item.slug}
            href={`/work/${item.slug}`}
            cover={item.cover}
            meta={
              <>
                <p className="text-caption text-text-muted font-mono tracking-wide uppercase">
                  {practiceAreaLabels[item.practiceArea] ?? item.practiceArea}
                </p>
                {item.featured && <FeaturedBadge />}
              </>
            }
            title={item.client}
            summary={item.resultTeaser}
            tags={item.techTags}
            readingTimeMinutes={item.readingTimeMinutes}
            contributors={item.contributors}
            ctaLabel="Read the case study"
          />
        ))}
      </div>
    </div>
  );
}
