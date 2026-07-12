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
 * Renders both real, transparent monochrome mark variants
 * (`brandAssets.iconLight`/`iconDark` — black glyph, white glyph) and lets
 * CSS pick the right one for the active theme, so this stays a Server
 * Component with zero hydration-flash risk — no `useTheme()`, no
 * client-side branch. `dark:` is keyed to the app's actual `.dark`/`.light`
 * toggle via the `@custom-variant dark` rule in globals.css, not the OS
 * `prefers-color-scheme` media query Tailwind defaults to.
 *
 * Wordmark deliberately splits across both type families instead of
 * defaulting to bold sans (the legacy site's treatment, and the generic
 * choice everywhere else): "Hub" in Geist Sans, "Zero" in the same IBM Plex
 * Serif used for the site's rare emphasis-word moments — upright, not
 * italic. Monochrome pass (DESIGN/V4/00_IMPLEMENTATION_STRATEGY.md §2): both
 * halves render in the ink text color now — no accent-colored half. A
 * two-syllable wordmark doesn't need a brand hue to read as two distinct
 * type families; that distinction was always the more interesting move.
 */
export function Logo({ variant = "full", className }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="relative size-7 shrink-0">
        <Image
          src={brandAssets.iconLight}
          alt={variant === "icon" ? "HubZero" : ""}
          width={28}
          height={28}
          priority
          className="size-7 dark:hidden"
        />
        <Image
          src={brandAssets.iconDark}
          alt={variant === "icon" ? "HubZero" : ""}
          width={28}
          height={28}
          priority
          className="absolute inset-0 hidden size-7 dark:block"
        />
      </span>
      {variant === "full" && (
        <span className="text-h3 text-text tracking-tight">
          <span className="font-semibold">Hub</span>
          <span className="font-serif">Zero</span>
        </span>
      )}
    </span>
  );
}
