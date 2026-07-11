import { X } from "lucide-react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/utils";

const tones = {
  default: "bg-bg-light text-text border-border-muted",
  accent: "bg-accent/15 text-accent-text border-accent/30",
} as const;

export interface ChipProps extends ComponentPropsWithoutRef<"span"> {
  /** @default "default" */
  tone?: keyof typeof tones;
  /** Renders a trailing remove control when provided. */
  onRemove?: () => void;
  children: ReactNode;
}

/** Tag/filter pill — optionally removable. For a static status indicator, see Badge. */
export function Chip({ tone = "default", onRemove, className, children, ...props }: ChipProps) {
  return (
    <span
      className={cn(
        "text-caption inline-flex items-center gap-1.5 rounded-full border py-1 pl-3 font-medium",
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
