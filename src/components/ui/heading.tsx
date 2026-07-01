import type { ComponentPropsWithoutRef, ElementType } from "react";

import { cn } from "@/lib/utils";

/**
 * `text-{size}` also carries the paired --text-{size}--line-height and
 * --text-{size}--letter-spacing custom properties defined in globals.css —
 * Tailwind v4 applies them automatically, so no separate tracking-* utility
 * is needed here.
 */
const sizes = {
  display: "text-display font-semibold",
  h1: "text-h1 font-semibold",
  h2: "text-h2 font-semibold",
  h3: "text-h3 font-semibold",
} as const;

type Level = 1 | 2 | 3 | 4;

/** No dedicated scale below h3 (§1) — level 4 reuses the h3 size with an <h4> tag. */
const levelDefaults: Record<Level, keyof typeof sizes> = { 1: "h1", 2: "h2", 3: "h3", 4: "h3" };
const levelTags: Record<Level, ElementType> = { 1: "h1", 2: "h2", 3: "h3", 4: "h4" };

export interface HeadingProps extends ComponentPropsWithoutRef<"h1"> {
  /** Semantic heading level — controls the rendered tag. @default 2 */
  level?: Level;
  /** Visual size, independent of `level` (e.g. an <h1> rendered at display size). */
  size?: keyof typeof sizes;
  /**
   * The one named gradient token, applied to text (§2). Reserve for a single
   * hero headline per page — never a default heading treatment.
   */
  gradient?: boolean;
}

export function Heading({ level = 2, size, gradient = false, className, ...props }: HeadingProps) {
  const Tag = levelTags[level];
  return (
    <Tag
      className={cn(
        sizes[size ?? levelDefaults[level]],
        "text-text",
        gradient && "bg-[image:var(--brand-gradient)] bg-clip-text text-transparent",
        className,
      )}
      {...props}
    />
  );
}
