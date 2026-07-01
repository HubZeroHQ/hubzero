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
 */
export function Logo({ variant = "full", className }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Image
        src={brandAssets.icon}
        alt={variant === "icon" ? "HubZero" : ""}
        width={32}
        height={32}
        priority
        className="size-8 shrink-0"
      />
      {variant === "full" && (
        <span className="text-h3 text-text font-semibold tracking-tight">Hub Zero</span>
      )}
    </span>
  );
}
