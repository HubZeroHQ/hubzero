import type { ElementType, ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

const paddings = {
  none: "p-0",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
} as const;

const shadows = {
  none: "shadow-none",
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
} as const;

export interface SurfaceProps extends ComponentPropsWithoutRef<"div"> {
  as?: ElementType;
  /** @default "md" */
  padding?: keyof typeof paddings;
  /** @default "none" */
  shadow?: keyof typeof shadows;
  /** @default true */
  border?: boolean;
}

/** The base elevated-background primitive — Card and future overlays compose this. */
export function Surface({
  as: Tag = "div",
  padding = "md",
  shadow = "none",
  border = true,
  className,
  ...props
}: SurfaceProps) {
  return (
    <Tag
      className={cn(
        "bg-bg-light rounded-lg",
        border && "border-border-muted border",
        paddings[padding],
        shadows[shadow],
        className,
      )}
      {...props}
    />
  );
}
