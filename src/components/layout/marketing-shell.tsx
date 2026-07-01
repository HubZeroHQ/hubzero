import type { ReactNode } from "react";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { PageShell } from "@/components/layout/page-shell";
import type { WithChildren } from "@/types";

export interface MarketingShellProps extends WithChildren {
  /** Optional `<AnnouncementBanner>` slot, rendered above the Navbar. */
  announcement?: ReactNode;
}

/** The public marketing site's chrome: PageShell + Navbar + main landmark + Footer. */
export function MarketingShell({ children, announcement }: MarketingShellProps) {
  return (
    <PageShell>
      {announcement}
      <Navbar />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </PageShell>
  );
}
