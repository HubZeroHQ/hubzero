'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface PublicMobileNavProps {
  items: readonly { label: string; href: string }[];
}

/**
 * The `.public-nav-track`'s off-canvas counterpart below the nav's mobile
 * breakpoint — the horizontally-scrolling link strip has no visible
 * affordance that it scrolls, so most items go undiscovered on narrow
 * viewports. This trades that for a disclosed menu, built on Radix Dialog
 * for the same reason `MobileNavDrawer` (Studio) is: correct focus-trap,
 * Escape-to-close, and scrim-click-to-close for free. Reuses the
 * `overlay-scrim`/`overlay-panel` keyframes already shared by `ui/Dialog`
 * and the Studio drawer, so it animates on the same duration/easing tokens
 * and inherits the sitewide `prefers-reduced-motion` override — no
 * additional motion logic needed here.
 */
export function PublicMobileNav({ items }: PublicMobileNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (!items.length) return null;

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button type="button" className="public-nav-menu-toggle" aria-label="Open menu">
          <Menu className="h-4 w-4" aria-hidden="true" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="overlay-scrim public-mobile-nav-scrim" />
        <Dialog.Content
          className="overlay-panel public-mobile-nav-panel"
          aria-label="Primary navigation"
        >
          <Dialog.Title className="sr-only">Primary navigation</Dialog.Title>
          <Dialog.Close asChild>
            <button type="button" className="public-mobile-nav-close" aria-label="Close menu">
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </Dialog.Close>
          <nav aria-label="Primary" className="public-mobile-nav-list">
            {items.map((item) => {
              const current = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={current ? 'page' : undefined}
                  className="public-mobile-nav-link"
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
