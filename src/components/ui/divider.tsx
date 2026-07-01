import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

export interface DividerProps extends ComponentPropsWithoutRef<"div"> {
  /** @default "horizontal" */
  orientation?: "horizontal" | "vertical";
  /** @default "muted" */
  tone?: "default" | "muted";
}

export function Divider({
  orientation = "horizontal",
  tone = "muted",
  className,
  ...props
}: DividerProps) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        tone === "muted" ? "bg-border-muted" : "bg-border",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className,
      )}
      {...props}
    />
  );
}
