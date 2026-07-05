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
 * page behind it. Notes, Builds, Labs, and Blueprints are all real
 * destinations in the target IA but none has shipped a page yet, so none
 * of them belong in this list.
 *
 * `footerNav` below is content-gated on the same rule, not exempt from it —
 * a footer link is still a link a visitor can click today. Team, Careers,
 * Notes, Privacy, and Terms are added here the same day their page ships,
 * not before.
 */
export const primaryNav: NavItem[] = [
  { label: "Services", href: "/services" },
  { label: "Work", href: "/work" },
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
    { label: "Contact", href: "/contact" },
  ],
  services: [
    { label: "Software Engineering", href: "/services/software" },
    { label: "Hardware & Embedded", href: "/services/hardware" },
    { label: "Work / Case Studies", href: "/work" },
  ],
  legal: [],
};
