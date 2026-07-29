'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { PUBLIC_NAVIGATION, PUBLIC_SITE } from '@/config/public-site';
import { publicRoute } from '@/lib/public/routes';
import { PublicSearchDialog } from './search/PublicSearchDialog';

// Primary nav orients a first-time visitor to what HubZero *is* — it is not
// a full sitemap. Notes, Engineering, and Ledger are real, enabled routes
// reached contextually instead (relationship rails, bylines, Search, the
// footer) — see PUBLIC_NAVIGATION's own doc comment and Design
// Specification §5.
const activeItems = PUBLIC_NAVIGATION.filter((item) => item.enabled && item.primary);

export function PublicNavigation() {
  const pathname = usePathname();
  const currentLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    currentLinkRef.current?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [pathname]);

  return (
    <header className="public-nav-wrap">
      <nav className="public-nav" aria-label="Primary navigation">
        <Link href={publicRoute.home()} className="public-nav-brand" aria-label="HubZero home">
          <Image
            src="/brand/hubzero-logo-white.png"
            alt=""
            width={18}
            height={18}
            priority
            className="h-[18px] w-[18px]"
          />
        </Link>
        {activeItems.length ? (
          // Scrolls horizontally at every width, including below the mobile
          // breakpoint — there is no separate collapsed/hamburger nav. See
          // `.public-nav-track` in globals.css for the trailing mask fade
          // that signals overflow instead of hiding destinations behind a
          // menu control.
          <div className="public-nav-track">
            {activeItems.map((item) => {
              const current = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  ref={current ? currentLinkRef : undefined}
                  aria-current={current ? 'page' : undefined}
                  className="public-nav-link"
                  title={item.description}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        ) : null}
        {PUBLIC_SITE.release.search ? <PublicSearchDialog /> : null}
        {PUBLIC_SITE.release.contact ? (
          <Link href={publicRoute.contact({ from: 'navigation' })} className="public-nav-contact">
            Contact
          </Link>
        ) : null}
      </nav>
    </header>
  );
}
