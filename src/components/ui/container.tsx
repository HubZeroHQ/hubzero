import type { ElementType, ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

const widths = {
  /** Marketing pages — ARCHITECTURE/07_DESIGN_SYSTEM.md §3 (1100-1200px). */
  default: "max-w-[var(--content-marketing)]",
  /** Long-form reading — blog posts, case study bodies (720-760px). */
  prose: "max-w-[var(--content-prose)]",
  /** No width constraint — horizontal gutter only (edge-to-edge sections). */
  full: "max-w-none",
} as const;

export interface ContainerProps extends ComponentPropsWithoutRef<"div"> {
  as?: ElementType;
  /** @default "default" */
  size?: keyof typeof widths;
}

export function Container({
  as: Tag = "div",
  size = "default",
  className,
  ...props
}: ContainerProps) {
  return <Tag className={cn("mx-auto w-full px-6 md:px-8", widths[size], className)} {...props} />;
}
