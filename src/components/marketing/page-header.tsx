import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const headlineSizes = {
  /** clamp(2rem, 1rem+4vw, 3.5rem) — index pages (Work, Labs, Team, Blueprints, Notes, Search, Careers). */
  compact: "mt-4 text-[clamp(2rem,1rem+4vw,3.5rem)] leading-[1.1]",
  /** clamp(2.25rem, 1rem+4.5vw, 4.5rem) — the site's other long-form editorial reads (About, Services, Contact). */
  large: "mt-6 text-[clamp(2.25rem,1rem+4.5vw,4.5rem)] leading-[1.08]",
} as const;

const maxWidths = {
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
} as const;

export interface PageHeaderProps {
  /** The technical-label register line above the headline (02_VISUAL_LANGUAGE.md §11's title-block convention). */
  eyebrow: ReactNode;
  headline: ReactNode;
  description?: ReactNode;
  /** @default "compact" */
  size?: keyof typeof headlineSizes;
  /** @default "2xl" */
  maxWidth?: keyof typeof maxWidths;
  className?: string;
  /** Rendered after the description — a badge row, a search box, an inline form. */
  children?: ReactNode;
}

/**
 * The site's implicit title block, instantiated for interior marketing
 * pages (DESIGN/V3/02_VISUAL_LANGUAGE.md §1/§11): eyebrow (what pillar this
 * belongs to) → headline → optional subhead. Every interior page opened
 * with this exact same three-line shape independently before this
 * component existed — this just gives it one definition instead of
 * fourteen near-identical copies.
 *
 * Deliberately not wrapped in `Reveal` — a page header is the first thing a
 * visitor sees, already in the viewport at load, and `Reveal`'s own
 * contract is for below-the-fold content entering scroll (`lib/use-in-view.ts`).
 * Wrap the returned markup in `Reveal` at the call site for the pages that
 * want an entrance transition here anyway.
 */
export function PageHeader({
  eyebrow,
  headline,
  description,
  size = "compact",
  maxWidth = "2xl",
  className,
  children,
}: PageHeaderProps) {
  return (
    <div className={className}>
      <p className="text-caption text-text-muted font-mono tracking-wide uppercase">{eyebrow}</p>
      <h1
        className={cn(
          "text-text font-normal tracking-tight",
          maxWidths[maxWidth],
          headlineSizes[size],
        )}
      >
        {headline}
      </h1>
      {description && <p className="text-body text-text-muted mt-6 max-w-xl">{description}</p>}
      {children}
    </div>
  );
}
