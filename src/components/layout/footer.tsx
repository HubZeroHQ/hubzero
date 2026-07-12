import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import { Text } from "@/components/ui/text";
import { footerNav, type NavItem } from "@/config/nav";
import { siteConfig } from "@/config/site";

function FooterColumn({ title, items }: { title: string; items: NavItem[] }) {
  return (
    <div>
      <Text as="p" eyebrow tone="muted" className="mb-4">
        {title}
      </Text>
      <ul role="list" className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              tone="muted"
              className="hover:text-text no-underline hover:no-underline"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Structure per ARCHITECTURE/03_INFORMATION_ARCHITECTURE.md §3. "Connect"
 * only renders once `siteConfig.links` has a real value — no org-level
 * email/social accounts are confirmed yet, and the legacy site's habit of
 * linking decorative/dead social icons is one of the documented bugs this
 * rebuild is fixing (see project-known-bugs), not a pattern to repeat.
 */
export function Footer() {
  const year = new Date().getFullYear();
  const connectLinks: NavItem[] = [
    siteConfig.links.email && { label: "Email", href: siteConfig.links.email },
    siteConfig.links.linkedin && { label: "LinkedIn", href: siteConfig.links.linkedin },
    siteConfig.links.github && { label: "GitHub", href: siteConfig.links.github },
  ].filter((item): item is NavItem => Boolean(item));

  return (
    <footer className="border-border-muted border-t">
      <Container
        className={
          connectLinks.length > 0
            ? "grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:py-20"
            : "grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr] md:py-20"
        }
      >
        <div className="flex flex-col gap-4">
          <Logo />
          <Text tone="muted" className="max-w-[26rem]">
            {siteConfig.description}
          </Text>
        </div>
        <FooterColumn title="Company" items={footerNav.company} />
        <FooterColumn title="Services" items={footerNav.services} />
        {connectLinks.length > 0 && <FooterColumn title="Connect" items={connectLinks} />}
      </Container>

      <Container className="border-border-muted text-caption text-text-muted flex flex-col-reverse items-center gap-4 border-t py-6 font-mono md:flex-row md:justify-between">
        <p>© {year} HubZero</p>
        <ul role="list" className="flex gap-6">
          {footerNav.legal.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                tone="muted"
                className="hover:text-text no-underline hover:no-underline"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </footer>
  );
}
