"use client";

import { useState } from "react";

import { FeaturedBadge } from "@/components/marketing/card-meta";
import { EntryRow } from "@/components/marketing/entry-row";
import { FilterChip } from "@/components/marketing/filter-chip";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusIndicatorIcon } from "@/components/ui/icons";
import type { PublicTeamMember } from "@/lib/cms/public-content";

export interface BlueprintsGridItem {
  slug: string;
  name: string;
  category: string;
  descriptionTeaser: string;
  hasLiveDemo: boolean;
  cover: { url: string; alt: string; width?: number; height?: number } | null;
  techStack: string[];
  featured: boolean;
  readingTimeMinutes: number;
  contributors: PublicTeamMember[];
}

/**
 * `ARCHITECTURE/06_PAGE_SPECIFICATIONS.md`'s Blueprints index: "filter by
 * category." Unlike Work/Labs' `practiceArea` (a fixed schema enum),
 * `Blueprint.category` is editor-provided free text
 * (`lib/cms/collections/blueprint-fields.tsx`) — so the filter list is
 * derived from the categories actually present among published Blueprints,
 * not a hardcoded vocabulary that would drift from real content.
 */
export function BlueprintsGrid({ items }: { items: BlueprintsGridItem[] }) {
  const categories = Array.from(new Set(items.map((item) => item.category))).sort();
  const [active, setActive] = useState<string>("all");
  const filtered = items.filter((item) => active === "all" || item.category === active);

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        {[
          { label: "All categories", value: "all" },
          ...categories.map((c) => ({ label: c, value: c })),
        ].map((tag) => (
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
            description="No Blueprint in this category has been published yet — check back soon, or get in touch to talk through what you need."
          />
        )}

        {filtered.map((item) => (
          <EntryRow
            key={item.slug}
            href={`/blueprints/${item.slug}`}
            cover={item.cover}
            meta={
              <>
                <p className="text-caption text-text-muted font-mono tracking-wide uppercase">
                  {item.category}
                </p>
                {item.hasLiveDemo && (
                  <span className="text-caption text-success inline-flex items-center gap-1">
                    {/* Filled square, not a circle — a status dot is a
                        square/diamond primitive, never a circle
                        (14_VISUAL_TOKENS.md §6). */}
                    <StatusIndicatorIcon className="text-success size-2" aria-hidden="true" />
                    Live demo
                  </span>
                )}
                {item.featured && <FeaturedBadge />}
              </>
            }
            title={item.name}
            summary={item.descriptionTeaser}
            tags={item.techStack}
            readingTimeMinutes={item.readingTimeMinutes}
            contributors={item.contributors}
            ctaLabel="Explore this Blueprint"
          />
        ))}
      </div>
    </div>
  );
}
