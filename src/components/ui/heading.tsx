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
}

/**
 * No color-fill treatment (retired alongside --brand-gradient,
 * DESIGN/V4/00_IMPLEMENTATION_STRATEGY.md §3.2 — a headline fill is exactly
 * the kind of brand-decoration use the Signal color is never for). Where a
 * single word needs emphasis within a headline, use `italic` on that span
 * instead — the same typographic-only device already correct on `CtaClose`.
 */
export function Heading({ level = 2, size, className, ...props }: HeadingProps) {
  const Tag = levelTags[level];
  return (
    <Tag className={cn(sizes[size ?? levelDefaults[level]], "text-text", className)} {...props} />
  );
}
