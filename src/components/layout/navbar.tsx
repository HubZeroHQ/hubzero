import { Logo } from "@/components/brand/logo";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import { primaryCta, primaryNav } from "@/config/nav";

/**
 * Server component — the desktop link list needs no client JS. Only the
 * mobile drawer (`MobileNav`) crosses the client boundary, kept as a small,
 * separately-hydrated island rather than making the whole header client-side.
 */
export function Navbar() {
  return (
    <header className="border-border-muted bg-bg/80 z-sticky sticky top-0 border-b backdrop-blur-md">
      <Container className="flex h-20 items-center justify-between">
        <Link href="/" aria-label="HubZero home" className="no-underline hover:no-underline">
          <Logo />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              tone="muted"
              className="hover:text-text font-medium no-underline hover:no-underline"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button href={primaryCta.href} size="sm" className="hidden md:inline-flex">
            {primaryCta.label}
          </Button>
          <MobileNav items={primaryNav} cta={primaryCta} />
        </div>
      </Container>
    </header>
  );
}
