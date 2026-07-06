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
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Link } from "@/components/ui/link";
import type { PublicTeamMember } from "@/lib/cms/public-content";
import { cn } from "@/lib/utils";

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
        {disciplineFilters.map((tag) => {
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
            description="No Labs project in this discipline has been published yet."
          />
        )}

        {filtered.map((item) => (
          <Link
            key={item.slug}
            href={`/labs/${item.slug}`}
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
                  {practiceAreaLabels[item.practiceArea] ?? item.practiceArea}
                </p>
                <Badge tone={item.stage === "active" ? "info" : "default"}>
                  {stageLabels[item.stage] ?? item.stage}
                </Badge>
                {item.featured && <FeaturedBadge />}
              </div>
              <h3 className="text-h2 text-text mt-3 font-normal">{item.title}</h3>
              <p className="text-body text-text-muted mt-3 max-w-md">{item.descriptionTeaser}</p>
              <CardTags tags={item.techTags} />
              <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="text-text inline-flex items-center gap-1.5">
                  Read the write-up
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
