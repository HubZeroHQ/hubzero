import Image from "next/image";

import { brandAssets } from "@/config/brand";
import { cn } from "@/lib/utils";

export interface LogoProps {
  /**
   * "full" pairs the icon with the wordmark as real text (theme-adaptive,
   * crisp at any size) — used in the Navbar and Footer. "icon" is the mark
   * alone, for compact contexts (mobile nav bar, favicon-adjacent UI).
   * @default "full"
   */
  variant?: "full" | "icon";
  className?: string;
}

/**
 * The only mark asset that's transparent (`brandAssets.icon`) is used here
 * so the logo reads correctly on both themes. The raster `primary`/
 * `wordmark` brand assets are flattened onto an opaque dark canvas by
 * design and are intentionally NOT used for chrome — see `config/brand.ts`.
 *
 * Wordmark deliberately splits across both type families instead of
 * defaulting to bold sans (the legacy site's treatment, and the generic
 * choice everywhere else): "Hub" in Geist Sans, "Zero" in the same
 * Instrument Serif italic used for the hero's one emphasis word. This is
 * what ties the nav to the rest of the page's typographic identity instead
 * of reading as an unrelated UI-chrome wordmark bolted onto an editorial
 * hero.
 */
export function Logo({ variant = "full", className }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Image
        src={brandAssets.icon}
        alt={variant === "icon" ? "HubZero" : ""}
        width={28}
        height={28}
        priority
        className="size-7 shrink-0"
      />
      {variant === "full" && (
        <span className="text-h3 text-text tracking-tight">
          <span className="font-semibold">Hub</span>
          <span className="text-accent-text font-serif italic">Zero</span>
        </span>
      )}
    </span>
  );
}
