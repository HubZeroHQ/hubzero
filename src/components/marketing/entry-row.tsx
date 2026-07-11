import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";

import { CardTags, ContributorAvatars, ReadingTimeLabel } from "@/components/marketing/card-meta";
import { Link } from "@/components/ui/link";
import type { PublicTeamMember } from "@/lib/cms/public-content";
import { cn } from "@/lib/utils";

// Tailwind v4 only picks up literal class strings present somewhere in the
// source — a template-interpolated `sm:col-span-${n}` would silently never
// be generated. This is the closed set every caller below actually uses.
const spanClasses: Record<number, string> = {
  4: "sm:col-span-4",
  5: "sm:col-span-5",
  7: "sm:col-span-7",
  8: "sm:col-span-8",
};

export interface EntryRowProps {
  href: string;
  cover: { url: string; alt: string; width?: number; height?: number } | null;
  /** Rendered above the title — each pillar's own badge/label combination (practice area, stage, category, live-demo indicator). Deliberately a slot, not a fixed field set: a shared macro-composition is not the goal here, only the shared row shell (DESIGN/V3/09_PAGE_ARCHETYPES.md §4). */
  meta: ReactNode;
  title: ReactNode;
  summary: ReactNode;
  tags: string[];
  readingTimeMinutes: number;
  contributors: PublicTeamMember[];
  ctaLabel: string;
  /** An extra line in the footer row, before the contributor avatars — Notes' byline is the one pillar that needs it. */
  byline?: ReactNode;
  /** [text, image] column split out of 12. Notes runs a narrower image column than Work/Labs/Blueprints. @default [5, 7] */
  columns?: [text: number, image: number];
}

/**
 * The shared row shell behind Work/Labs/Blueprints/Notes' index lists — a
 * panel within the drafting-sheet grid (image/text alternating row, hairline
 * `divide-y` between entries), not a card. Cards are retired as a default
 * pattern for narrative/evidence content (06_COMPONENT_LANGUAGE.md §2); a
 * shared *component* is fine as long as each pillar's macro-composition
 * (its `meta` slot) still reads as visibly distinct (09_PAGE_ARCHETYPES.md
 * §4's "must not resemble" rule) — Work/Labs/Blueprints/Notes all consume
 * this one shell, each supplying its own badge combination.
 */
export function EntryRow({
  href,
  cover,
  meta,
  title,
  summary,
  tags,
  readingTimeMinutes,
  contributors,
  ctaLabel,
  byline,
  columns = [5, 7],
}: EntryRowProps) {
  const [textSpan, imageSpan] = columns;

  return (
    <Link
      href={href}
      className="group grid grid-cols-1 gap-6 py-12 no-underline first:pt-0 hover:no-underline sm:grid-cols-12 sm:gap-8 lg:py-16"
    >
      <div className={cn("sm:order-2", spanClasses[imageSpan])}>
        {/* Index thumbnails: 4:3, consistent whether or not a real cover
            exists (DESIGN/V3/14_VISUAL_TOKENS.md §7). */}
        <div className="bg-bg-light aspect-[4/3] w-full overflow-hidden">
          {cover && (
            <Image
              src={cover.url}
              alt={cover.alt}
              width={cover.width ?? 1600}
              height={cover.height ?? 1200}
              sizes="(min-width: 640px) 58vw, 92vw"
              className="h-full w-full object-cover transition-opacity duration-150 group-hover:opacity-90"
            />
          )}
        </div>
      </div>
      <div className={cn("flex flex-col justify-center sm:order-1", spanClasses[textSpan])}>
        <div className="flex flex-wrap items-center gap-3">{meta}</div>
        <h2 className="text-h2 text-text mt-3 font-normal">{title}</h2>
        <p className="text-body text-text-muted mt-3 max-w-md">{summary}</p>
        <CardTags tags={tags} />
        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="text-text inline-flex items-center gap-1.5">
            {ctaLabel}
            <ArrowUpRight
              className="size-4 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          </span>
          <span className="text-caption text-text-muted">
            <ReadingTimeLabel minutes={readingTimeMinutes} />
          </span>
          {byline}
          <ContributorAvatars members={contributors} />
        </div>
      </div>
    </Link>
  );
}
