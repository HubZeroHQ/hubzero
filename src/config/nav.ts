/**
 * Single shared nav data structure, consumed by both the desktop Navbar and
 * the mobile nav drawer. Per `ARCHITECTURE/03_INFORMATION_ARCHITECTURE.md`
 * §2, this is a deliberate structural fix for a legacy bug class: the old
 * site's desktop/mobile menus were two separately hand-written link lists
 * that drifted apart (wrong hrefs, anchors that didn't exist off the
 * homepage). One list, two renderers, makes that class of bug impossible.
 */
export interface NavItem {
  label: string;
  href: string;
}

/**
 * Per `ARCHITECTURE/03_INFORMATION_ARCHITECTURE.md` §2, primary nav is
 * content-gated: an item only belongs here once it has a real, published
 * page behind it. Builds and Blueprints are real destinations in the target
 * IA but neither has shipped a page yet (content-readiness for both is
 * still an open question — `17_COMPANY_STRUCTURE.md` §9), so neither
 * belongs in this list yet. Labs shipped in CMS Foundation Phase H with a
 * real migrated project (`scripts/migrate-content.ts`), so it's added here.
 *
 * `footerNav` below is content-gated on the same "has the page shipped"
 * rule — Team, Careers, and Notes now have real pages (Phase H), so they're
 * added here even though some (Notes, Careers) currently render an honest
 * empty state pending real authored content; that's a content-population
 * gap, not a missing page.
 */
export const primaryNav: NavItem[] = [
  { label: "Services", href: "/services" },
  { label: "Work", href: "/work" },
  { label: "Labs", href: "/labs" },
  { label: "About", href: "/about" },
];

export const primaryCta: NavItem = { label: "Start a project", href: "/contact" };

export const footerNav: {
  company: NavItem[];
  services: NavItem[];
  legal: NavItem[];
} = {
  company: [
    { label: "About", href: "/about" },
    { label: "Team", href: "/team" },
    { label: "Careers", href: "/careers" },
    { label: "Notes", href: "/notes" },
    { label: "Contact", href: "/contact" },
  ],
  services: [
    { label: "Software Engineering", href: "/services/software" },
    { label: "Hardware & Embedded", href: "/services/hardware" },
    { label: "Work / Case Studies", href: "/work" },
    { label: "Labs", href: "/labs" },
  ],
  legal: [],
};
