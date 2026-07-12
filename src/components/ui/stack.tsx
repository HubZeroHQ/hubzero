import type { ElementType, ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

const gaps = {
  none: "gap-0",
  xs: "gap-2",
  sm: "gap-4",
  md: "gap-6",
  lg: "gap-8",
  xl: "gap-12",
} as const;

const aligns = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
} as const;

const justifies = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
} as const;

export interface StackProps extends ComponentPropsWithoutRef<"div"> {
  as?: ElementType;
  /** @default "column" */
  direction?: "row" | "column";
  /** @default "md" */
  gap?: keyof typeof gaps;
  align?: keyof typeof aligns;
  justify?: keyof typeof justifies;
  wrap?: boolean;
}

export function Stack({
  as: Tag = "div",
  direction = "column",
  gap = "md",
  align,
  justify,
  wrap = false,
  className,
  ...props
}: StackProps) {
  return (
    <Tag
      className={cn(
        "flex",
        direction === "row" ? "flex-row" : "flex-col",
        gaps[gap],
        align && aligns[align],
        justify && justifies[justify],
        wrap && "flex-wrap",
        className,
      )}
      {...props}
    />
  );
}
