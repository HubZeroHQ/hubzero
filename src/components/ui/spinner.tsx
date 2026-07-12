import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

const sizes = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-8 w-8 border-[3px]",
} as const;

export interface SpinnerProps extends ComponentPropsWithoutRef<"span"> {
  /** @default "md" */
  size?: keyof typeof sizes;
  /**
   * Accessible label. Pass `null` when a sibling already announces the
   * loading state (e.g. Button's own label text) to avoid double-announcing.
   * @default "Loading…"
   */
  label?: string | null;
}

export function Spinner({ size = "md", label = "Loading…", className, ...props }: SpinnerProps) {
  return (
    <span
      role={label ? "status" : undefined}
      className={cn("inline-flex shrink-0", className)}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          // currentColor so a Spinner nested in a Button/Alert/etc. automatically
          // matches that context's text color instead of a hardcoded tone.
          "text-text animate-spin rounded-full border-current/25 border-t-current",
          sizes[size],
        )}
      />
      {label && <span className="sr-only">{label}</span>}
    </span>
  );
}
