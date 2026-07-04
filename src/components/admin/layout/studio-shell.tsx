import type { ReactNode } from "react";

import { Sidebar } from "@/components/admin/layout/sidebar";
import { Topbar } from "@/components/admin/layout/topbar";
import type { SessionUser } from "@/types/cms";

export interface StudioShellProps {
  user: SessionUser;
  children: ReactNode;
}

/**
 * The reusable CMS shell (`ARCHITECTURE/19_CMS_FOUNDATION.md` §4) — every
 * future `/studio/**` page mounts inside this, once, via
 * `studio/(protected)/layout.tsx`. Composes `Sidebar` (desktop, permanent)
 * and `Topbar` (constant across pages); page-specific content — including
 * its own `PageHeader`/breadcrumb — is `children`, never hardcoded here.
 *
 * Responsive behaviour: the sidebar is desktop/tablet-landscape-only
 * (`lg:flex`); below that, `Topbar`'s `StudioMobileNav` becomes the only way
 * to navigate, per `16_RESPONSIVE_DESIGN_STANDARDS.md`'s "each tier is its
 * own composition" applied to this utility surface.
 */
export function StudioShell({ user, children }: StudioShellProps) {
  return (
    <div className="flex min-h-dvh">
      <Sidebar role={user.role} className="hidden lg:flex" />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar user={user} />
        <main className="flex-1 px-6 py-8 md:px-8">{children}</main>
      </div>
    </div>
  );
}
