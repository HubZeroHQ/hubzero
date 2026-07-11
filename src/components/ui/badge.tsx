import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

// Hairline-bordered, no filled background — same tags treatment as Chip
// (DESIGN/V3/06_COMPONENT_LANGUAGE.md §7); status color is carried by the
// border/text hue plus the label's own text, never a color wash alone
// (12_ACCESSIBILITY.md §2 — color is never the only signal of state).
const tones = {
  default: "text-text-muted border-border-muted",
  accent: "text-accent-text border-accent",
  success: "text-success border-success/50",
  warning: "text-warning border-warning/50",
  danger: "text-danger border-danger/50",
  info: "text-info border-info/50",
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
        // Square corners and the technical-label register — see Chip.
        "text-caption inline-flex items-center gap-1 rounded-none border px-2 py-0.5 font-mono tracking-wide uppercase",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
