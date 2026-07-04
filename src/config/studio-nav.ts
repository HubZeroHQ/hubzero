import type { LucideIcon } from "lucide-react";
import { LayoutDashboard } from "lucide-react";

import type { UserRole } from "@/types/cms";

/**
 * Single shared source for the Studio sidebar — the same "one data
 * structure, multiple renderers" discipline `src/config/nav.ts` already
 * applies to the public site's desktop/mobile nav (`PROJECT_CONTEXT.md` §12),
 * applied here to the admin shell's desktop sidebar and (future) mobile
 * drawer. `ARCHITECTURE/19_CMS_FOUNDATION.md` §4 explicitly rules out
 * hardcoding future collections into individual pages — new collections
 * (Case Studies, Team, Blog, …) are added here as a data change once their
 * `/studio/**` screens actually exist (Phase E), the same content-gating
 * discipline already applied to the public footer's pillar links (see the
 * "Content-gate footer nav links" commit) — never a placeholder link to a
 * route that doesn't exist yet.
 */
export interface StudioNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Omit for "any authenticated role can see this." */
  minimumRole?: UserRole;
}

export const studioNavItems: StudioNavItem[] = [
  { label: "Dashboard", href: "/studio", icon: LayoutDashboard },
];
