"use client";

import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import {
  CardTags,
  ContributorAvatars,
  FeaturedBadge,
  ReadingTimeLabel,
} from "@/components/marketing/card-meta";
import { EmptyState } from "@/components/ui/empty-state";
import { Link } from "@/components/ui/link";
import type { PublicTeamMember } from "@/lib/cms/public-content";
import { cn } from "@/lib/utils";

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
        ].map((tag) => {
          const isActive = tag.value === active;
          return (
            <button
              key={tag.value}
              type="button"
              aria-pressed={isActive}
              onClick={() => setActive(tag.value)}
              className={cn(
                "text-caption rounded-full border px-4 py-1.5 font-medium transition-colors duration-150",
                isActive
                  ? "border-accent/30 bg-accent/15 text-accent"
                  : "border-border-muted text-text-muted hover:text-text hover:border-border",
              )}
            >
              {tag.label}
            </button>
          );
        })}
      </div>

      <div className="divide-border-muted mt-12 divide-y">
        {filtered.length === 0 && (
          <EmptyState
            title="Nothing here yet"
            description="No Blueprint in this category has been published yet — check back soon, or get in touch to talk through what you need."
          />
        )}

        {filtered.map((item) => (
          <Link
            key={item.slug}
            href={`/blueprints/${item.slug}`}
            className="group grid grid-cols-1 gap-6 py-12 no-underline first:pt-0 hover:no-underline sm:grid-cols-12 sm:gap-8 lg:py-16"
          >
            <div className="sm:order-2 sm:col-span-7">
              {item.cover ? (
                <Image
                  src={item.cover.url}
                  alt={item.cover.alt}
                  width={item.cover.width ?? 1600}
                  height={item.cover.height ?? 900}
                  sizes="(min-width: 640px) 58vw, 92vw"
                  className="h-auto w-full transition-opacity duration-150 group-hover:opacity-90"
                />
              ) : (
                <div className="bg-bg-light aspect-video w-full" aria-hidden="true" />
              )}
            </div>
            <div className="flex flex-col justify-center sm:order-1 sm:col-span-5">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-caption text-text-muted font-mono tracking-wide uppercase">
                  {item.category}
                </p>
                {item.hasLiveDemo && (
                  <span className="text-caption text-success inline-flex items-center gap-1">
                    <span className="bg-success size-1.5 rounded-full" aria-hidden="true" />
                    Live demo
                  </span>
                )}
                {item.featured && <FeaturedBadge />}
              </div>
              <h3 className="text-h2 text-text mt-3 font-normal">{item.name}</h3>
              <p className="text-body text-text-muted mt-3 max-w-md">{item.descriptionTeaser}</p>
              <CardTags tags={item.techStack} />
              <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="text-text inline-flex items-center gap-1.5">
                  Explore this Blueprint
                  <ArrowUpRight
                    className="size-4 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden="true"
                  />
                </span>
                <span className="text-caption text-text-muted">
                  <ReadingTimeLabel minutes={item.readingTimeMinutes} />
                </span>
                <ContributorAvatars members={item.contributors} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
