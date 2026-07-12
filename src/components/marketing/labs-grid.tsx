"use client";

import { useState } from "react";

import { FeaturedBadge } from "@/components/marketing/card-meta";
import { EntryRow } from "@/components/marketing/entry-row";
import { FilterChip } from "@/components/marketing/filter-chip";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import type { PublicTeamMember } from "@/lib/cms/public-content";

export interface LabsGridItem {
  slug: string;
  title: string;
  descriptionTeaser: string;
  practiceArea: string;
  stage: string;
  cover: { url: string; alt: string; width?: number; height?: number } | null;
  techTags: string[];
  featured: boolean;
  readingTimeMinutes: number;
  contributors: PublicTeamMember[];
}

const practiceAreaLabels: Record<string, string> = {
  software: "Software",
  hardware: "Hardware & Embedded",
  both: "Software + Hardware",
  ai: "AI",
};

const stageLabels: Record<string, string> = {
  active: "Active",
  archived: "Archived",
  graduated: "Graduated to Builds",
};

const disciplineFilters = [
  { label: "All disciplines", value: "all" },
  { label: "Software", value: "software" },
  { label: "Hardware & Embedded", value: "hardware" },
  { label: "AI", value: "ai" },
] as const;

/**
 * `ARCHITECTURE/06_PAGE_SPECIFICATIONS.md`'s Labs index: stage badges
 * (active/archived/graduated) and a discipline filter — the pillar
 * explicitly "allowed to look unfinished/in-progress," so an honest empty
 * state per filter matters here as much as it does on `/work`.
 */
export function LabsGrid({ items }: { items: LabsGridItem[] }) {
  const [active, setActive] = useState<string>("all");
  const filtered = items.filter((item) => active === "all" || item.practiceArea === active);

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by discipline">
        {disciplineFilters.map((tag) => (
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
            title="Nothing here yet"
            description="No Labs project in this discipline has been published yet."
          />
        )}

        {filtered.map((item) => (
          <EntryRow
            key={item.slug}
            href={`/labs/${item.slug}`}
            cover={item.cover}
            meta={
              <>
                <p className="text-caption text-text-muted font-mono tracking-wide uppercase">
                  {practiceAreaLabels[item.practiceArea] ?? item.practiceArea}
                </p>
                <Badge tone={item.stage === "active" ? "info" : "default"}>
                  {stageLabels[item.stage] ?? item.stage}
                </Badge>
                {item.featured && <FeaturedBadge />}
              </>
            }
            title={item.title}
            summary={item.descriptionTeaser}
            tags={item.techTags}
            readingTimeMinutes={item.readingTimeMinutes}
            contributors={item.contributors}
            ctaLabel="Read the write-up"
          />
        ))}
      </div>
    </div>
  );
}
