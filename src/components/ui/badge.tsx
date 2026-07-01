import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

const tones = {
  default: "bg-bg-light text-text-muted border-border-muted",
  accent: "bg-accent/15 text-accent border-accent/30",
  success: "bg-success/15 text-success border-success/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  danger: "bg-danger/15 text-danger border-danger/30",
  info: "bg-info/15 text-info border-info/30",
} as const;

export interface BadgeProps extends ComponentPropsWithoutRef<"span"> {
  /** @default "default" */
  tone?: keyof typeof tones;
}

/** Static status indicator (e.g. "Draft", "Published"). For removable tags, see Chip. */
export function Badge({ tone = "default", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "text-caption inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
