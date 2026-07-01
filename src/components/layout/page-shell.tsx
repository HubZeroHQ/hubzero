import { SkipNav } from "@/components/layout/skip-nav";
import type { WithChildren } from "@/types";

/**
 * The generic full-page frame: skip link + a full-height flex column so a
 * short page's footer still sits at the bottom of the viewport. Deliberately
 * has no opinion on Navbar/Footer — `/studio` (admin, `14_IMPLEMENTATION_ROADMAP.md`
 * Phase 6) will need this same frame with entirely different chrome. See
 * `MarketingShell` for the public-site composition on top of this.
 */
export function PageShell({ children }: WithChildren) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SkipNav />
      {children}
    </div>
  );
}
