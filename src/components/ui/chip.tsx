import { X } from "lucide-react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/utils";

// Hairline-bordered, no filled background — a real component-designator
// label ("R1", "U3") rather than a social-app hashtag chip. Active/selected
// state is carried by the accent border, never a filled wash
// (DESIGN/V3/06_COMPONENT_LANGUAGE.md §7).
const tones = {
  default: "text-text border-border-muted",
  accent: "text-accent-text border-accent",
} as const;

export interface ChipProps extends ComponentPropsWithoutRef<"span"> {
  /** @default "default" */
  tone?: keyof typeof tones;
  /** Renders a trailing remove control when provided. */
  onRemove?: () => void;
  children: ReactNode;
}

/** Tag/filter — optionally removable. For a static status indicator, see Badge. */
export function Chip({ tone = "default", onRemove, className, children, ...props }: ChipProps) {
  return (
    <span
      className={cn(
        // Square corners (0px, not the sitewide 4px) and the technical-label
        // register (Geist Mono, wide tracking) — tags read as data labels,
        // not UI affordances (14_VISUAL_TOKENS.md §3, 03_TYPOGRAPHY.md §7).
        "text-caption inline-flex items-center gap-1.5 rounded-none border py-1 pl-3 font-mono tracking-wide uppercase",
        onRemove ? "pr-1" : "pr-3",
        tones[tone],
        className,
      )}
      {...props}
    >
      {children}
      {onRemove && (
        <IconButton
          icon={<X className="h-3 w-3" />}
          aria-label={`Remove ${typeof children === "string" ? children : "tag"}`}
          variant="ghost"
          className="h-5 w-5"
          onClick={onRemove}
        />
      )}
    </span>
  );
}
