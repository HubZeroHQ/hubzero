import type { LucideIcon } from "lucide-react";
import {
  Beaker,
  Blocks,
  Briefcase,
  HelpCircle,
  Image as ImageIcon,
  LayoutDashboard,
  ListChecks,
  NotebookPen,
  Package,
  Quote,
  UserPlus,
  Users,
} from "lucide-react";

import type { UserRole } from "@/types/cms";

/**
 * Single shared source for the Studio sidebar — the same "one data
 * structure, multiple renderers" discipline `src/config/nav.ts` already
 * applies to the public site's desktop/mobile nav (`PROJECT_CONTEXT.md` §12),
 * applied here to the admin shell's desktop sidebar and (future) mobile
 * drawer. `ARCHITECTURE/19_CMS_FOUNDATION.md` §4 explicitly rules out
 * hardcoding future collections into individual pages — new collections
 * (Case Studies, Team, Notes, …) are added here as a data change once their
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
  // Admin-only: Teammates hold no `caseStudy` grant at all (09_CMS_ARCHITECTURE
  // §4 scopes them to their own profile/portfolio/note drafts, not company
  // portfolio content) — showing this link to a Teammate would point at a
  // screen `can()` immediately denies.
  { label: "Case Studies", href: "/studio/case-studies", icon: Briefcase, minimumRole: "admin" },
  { label: "Builds", href: "/studio/builds", icon: Package, minimumRole: "admin" },
  { label: "Labs Projects", href: "/studio/labs", icon: Beaker, minimumRole: "admin" },
  { label: "Blueprints", href: "/studio/blueprints", icon: Blocks, minimumRole: "admin" },
  // No `minimumRole`: Admin and Teammate alike hold at least an `editOwn`
  // grant on `teamMember` (`permissions.ts`), so both should see this link —
  // a Teammate visiting it edits only their own profile, an Admin/Head Admin
  // manages everyone's.
  { label: "Team", href: "/studio/team", icon: Users },
  // No `minimumRole`: Teammates hold `["view", "create", "editOwn"]` on
  // `note` (`permissions.ts`) — they create/edit their own drafts here,
  // same reasoning as the Team link above.
  { label: "Notes", href: "/studio/notes", icon: NotebookPen },
  // Admin-only: Teammates hold no `testimonial` grant at all (`permissions.ts`).
  { label: "Testimonials", href: "/studio/testimonials", icon: Quote, minimumRole: "admin" },
  { label: "FAQs", href: "/studio/faqs", icon: HelpCircle, minimumRole: "admin" },
  { label: "Careers", href: "/studio/careers", icon: UserPlus, minimumRole: "admin" },
  // No `minimumRole`: Admin and Teammate alike hold a `create`/`view` grant
  // on `media` (`permissions.ts`) — both upload/browse files for whatever
  // content they're authoring.
  { label: "Media", href: "/studio/media", icon: ImageIcon },
  // No `minimumRole`: the review queue itself filters to collections the
  // signed-in user holds a `view` grant on (`app/studio/(protected)/review/page.tsx`),
  // so a Teammate sees an honest empty state today, not a denied screen —
  // and once a Teammate-reviewable collection (e.g. Note) registers,
  // this link starts showing real content with no nav change needed.
  { label: "Review Queue", href: "/studio/review", icon: ListChecks },
];
