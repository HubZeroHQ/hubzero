import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

/**
 * Static class lookups, not template-literal interpolation — Tailwind only
 * generates utilities it can see as literal strings in source.
 */
const colsAtBase = { 1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4" };
const colsAtMd = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
  6: "md:grid-cols-6",
};
const colsAtLg = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  6: "lg:grid-cols-6",
  12: "lg:grid-cols-12",
};

const gaps = {
  none: "gap-0",
  xs: "gap-2",
  sm: "gap-4",
  md: "gap-6",
  lg: "gap-8",
  xl: "gap-12",
} as const;

export interface GridProps extends ComponentPropsWithoutRef<"div"> {
  /** Columns at the base breakpoint. @default 1 */
  cols?: keyof typeof colsAtBase;
  /** Columns from `md:` up. */
  colsMd?: keyof typeof colsAtMd;
  /** Columns from `lg:` up. */
  colsLg?: keyof typeof colsAtLg;
  /** @default "md" */
  gap?: keyof typeof gaps;
}

export function Grid({ cols = 1, colsMd, colsLg, gap = "md", className, ...props }: GridProps) {
  return (
    <div
      className={cn(
        "grid",
        colsAtBase[cols],
        colsMd && colsAtMd[colsMd],
        colsLg && colsAtLg[colsLg],
        gaps[gap],
        className,
      )}
      {...props}
    />
  );
}
