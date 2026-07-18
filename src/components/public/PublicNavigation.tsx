'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { PUBLIC_NAVIGATION, PUBLIC_SITE } from '@/config/public-site';
import { PublicSearchDialog } from './search/PublicSearchDialog';

const activeItems = PUBLIC_NAVIGATION.filter((item) => item.enabled);

export function PublicNavigation() {
  const pathname = usePathname();
  const isHomepage = pathname === '/';
  const currentLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    currentLinkRef.current?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [pathname]);

  return (
    <header className={isHomepage ? 'public-nav-wrap public-nav-wrap-home' : 'public-nav-wrap'}>
      <nav className="public-nav" aria-label="Primary navigation">
        <Link href="/" className="public-nav-brand" aria-label="HubZero home">
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
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        ) : null}
        {PUBLIC_SITE.release.search ? <PublicSearchDialog /> : null}
        {PUBLIC_SITE.release.contact ? (
          <Link href="/contact?from=navigation" className="public-nav-contact">
            Contact
          </Link>
        ) : null}
      </nav>
    </header>
  );
}
