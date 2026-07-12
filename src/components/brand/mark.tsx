import type { ComponentPropsWithoutRef } from "react";

import {
  MARK_CHEVRON_PATH,
  MARK_LEFT_PATH,
  MARK_TRIANGLE_PATH,
  MARK_VIEWBOX,
} from "@/components/brand/mark-geometry";
import { cn } from "@/lib/utils";

export interface MarkProps extends ComponentPropsWithoutRef<"svg"> {
  /** @default "currentColor" — set text color on an ancestor to theme it. */
  className?: string;
}

/**
 * The static, assembled HZ mark — a Server Component, `fill="currentColor"`
 * so it themes with the surrounding text color instead of needing separate
 * light/dark raster swaps. Used everywhere the mark appears at rest: the
 * collapsed nav, the footer, the mobile nav trigger. See `mark-geometry.ts`
 * for how this relates to the canonical raster files.
 */
export function Mark({ className, ...props }: MarkProps) {
  return (
    <svg
      viewBox={MARK_VIEWBOX}
      className={cn("text-text", className)}
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d={MARK_LEFT_PATH} fillRule="evenodd" />
      <path d={MARK_TRIANGLE_PATH} />
      <path d={MARK_CHEVRON_PATH} />
    </svg>
  );
}
