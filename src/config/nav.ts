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
 * content-gated: a pillar enters primary nav only once it has at least one
 * real, *published* entry behind it — "never as a nav item pointing at an
 * empty index." Labs shipped in CMS Foundation Phase H with a real migrated
 * project (`scripts/migrate-content.ts`), so it's added here. Builds remains
 * unbuilt (its content readiness is still an open founder question —
 * `17_COMPANY_STRUCTURE.md` §9). Blueprints now has a real, working public
 * page (`/blueprints`, `/blueprints/[slug]`) — unblocked by any founder
 * question — but zero published Blueprint documents exist yet (publishing
 * one is gated on a real live demo, `blueprint.config.ts`'s `publishGuard`),
 * so it stays out of primary nav until the first one is actually published,
 * per this section's own rule.
 *
 * `footerNav` below is gated more loosely — on "has the page shipped," not
 * on "has real content" — which is why Team, Careers, and Notes are already
 * here even though some (Notes, Careers) currently render an honest empty
 * state pending real authored content. Blueprints is deliberately *not*
 * added to the footer yet either: `03_INFORMATION_ARCHITECTURE.md` §3
 * specifically ties the footer's Blueprints entry to "as each pillar ships
 * real content," a stricter bar than Team/Careers/Notes's "page exists"
 * because a Blueprint's whole claim is "come try the live demo" — a footer
 * link with nothing behind it yet would undercut that claim on its own
 * page, not just leave a gap.
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
  // Privacy/Terms pages now exist (`/privacy`, `/terms`) — same "page
  // exists" bar as Team/Careers/Notes above, even before an admin has
  // authored real legal copy in Settings → Legal pages (they render an
  // honest "coming soon" state until then, not a broken link).
  legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ],
};
