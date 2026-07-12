import { SkipNav } from "@/components/layout/skip-nav";
import type { WithChildren } from "@/types";

/**
 * The generic full-page frame: skip link + a full-height flex column so a
 * short page's footer still sits at the bottom of the viewport. Deliberately
 * has no opinion on Navbar/Footer — `/studio` (admin) uses its own
 * `StudioShell` (`src/components/admin/layout/studio-shell.tsx`) with
 * entirely different chrome, not this one. See `MarketingShell` for the
 * public-site composition on top of this.
 */
export function PageShell({ children }: WithChildren) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SkipNav />
      {children}
    </div>
  );
}
