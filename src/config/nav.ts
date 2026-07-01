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

export const primaryNav: NavItem[] = [
  { label: "Services", href: "/services" },
  { label: "Work", href: "/work" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
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
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ],
  services: [
    { label: "Software Engineering", href: "/services/software" },
    { label: "Hardware & Embedded", href: "/services/hardware" },
    { label: "Work / Case Studies", href: "/work" },
  ],
  legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ],
};
