"use client";

import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

export interface FilterChipProps extends ComponentPropsWithoutRef<"button"> {
  active: boolean;
}

/**
 * A togglable filter control for index-page facets (practice area,
 * discipline, category). Matches Chip/Badge's tag language — hairline
 * border, 0px corner radius, technical-label register, accent carried by
 * the border rather than a filled wash — instead of the fully-rounded pill
 * a generic filter button defaults to (DESIGN/V3/06_COMPONENT_LANGUAGE.md
 * §7, 14_VISUAL_TOKENS.md §3).
 */
export function FilterChip({ active, className, children, ...props }: FilterChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "text-caption rounded-none border px-3 py-1.5 font-mono tracking-wide uppercase transition-colors duration-150",
        active
          ? "border-accent text-accent-text"
          : "border-border-muted text-text-muted hover:text-text hover:border-border",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
