import { ArrowUpRight } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SearchTrigger } from "@/components/layout/search-trigger";
import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import { primaryCta, primaryNav } from "@/config/nav";

/**
 * Server component — the desktop link list needs no client JS. Only the
 * mobile drawer (`MobileNav`) crosses the client boundary, kept as a small,
 * separately-hydrated island rather than making the whole header client-side.
 *
 * Deliberately not a "sticky bar with a border and backdrop blur" — that
 * exact convention (fixed/sticky, translucent, hairline bottom border) is
 * what the legacy site used, and what almost every SaaS/agency template
 * defaults to. Redesigned as a masthead that sits directly on the page
 * canvas and scrolls with it: no seam, no floating chrome, nothing marking
 * it as a separate layer from the hero beneath it — consistent with the
 * "no hard boundaries between beats" rule the rest of the homepage follows.
 * Nav links and the primary action are set in Geist Mono at a small size,
 * clustered tight on the right and joined by a thin "/" — reads as a
 * masthead's running head, not a row of app-nav buttons.
 */
export function Navbar() {
  return (
    <header className="relative">
      <Container className="flex items-center justify-between gap-6 pt-10 pb-8 sm:pt-14">
        <Link href="/" aria-label="HubZero home" className="no-underline hover:no-underline">
          <Logo />
        </Link>

        <div className="text-caption text-text-muted hidden items-center gap-5 font-mono md:flex">
          <nav aria-label="Primary" className="flex items-center gap-5">
            {primaryNav.map((item, i) => (
              <span key={item.href} className="flex items-center gap-5">
                {i > 0 && (
                  <span aria-hidden="true" className="text-border">
                    /
                  </span>
                )}
                <Link
                  href={item.href}
                  tone="muted"
                  className="hover:text-text no-underline hover:no-underline"
                >
                  {item.label.toLowerCase()}
                </Link>
              </span>
            ))}
          </nav>
          <span aria-hidden="true" className="text-border">
            /
          </span>
          <SearchTrigger />
          <span aria-hidden="true" className="text-border">
            /
          </span>
          <Link
            href={primaryCta.href}
            className="text-accent-text inline-flex items-center gap-1 no-underline hover:no-underline hover:opacity-80"
          >
            {primaryCta.label.toLowerCase()}
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>

        <MobileNav items={primaryNav} cta={primaryCta} />
      </Container>
    </header>
  );
}
