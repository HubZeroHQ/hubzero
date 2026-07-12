import { Mark } from "@/components/brand/mark";
import { cn } from "@/lib/utils";

export interface LogoProps {
  /**
   * "full" pairs the mark with the wordmark as real text — used in the
   * Footer and anywhere the collapsed nav's mark-only treatment (§4) isn't
   * appropriate. "icon" is the mark alone.
   * @default "full"
   */
  variant?: "full" | "icon";
  className?: string;
}

/**
 * `Mark` is a real, `currentColor` SVG (see `mark.tsx`) — theming follows
 * text color automatically, so this stays a Server Component with zero
 * hydration-flash risk and no separate light/dark raster pair to keep in
 * sync. Wordmark is set entirely in the one grotesk family (§3.3 — no
 * serif, anywhere): weight alone, not a second typeface, distinguishes it
 * from body copy.
 */
export function Logo({ variant = "full", className }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Mark className="size-7 shrink-0" />
      {variant === "full" && (
        <span className="text-h3 text-text font-semibold tracking-tight">HubZero</span>
      )}
    </span>
  );
}
