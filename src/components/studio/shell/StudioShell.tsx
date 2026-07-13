'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { CommandPalette } from '@/components/studio/command-palette/CommandPalette';
import { getBreadcrumbItems, getVisibleNav } from '@/lib/studio/navigation';
import { useKeyboardShortcuts } from '@/lib/studio/use-keyboard-shortcuts';
import type { UserRole } from '@/types/studio';
import { MobileNavDrawer } from './MobileNavDrawer';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

const SIDEBAR_COLLAPSED_STORAGE_KEY = 'hubzero-studio-sidebar-collapsed';

interface StudioShellProps {
  role: UserRole;
  hasAssignedLeads: boolean;
  user: { name: string; email: string; role: UserRole };
  children: ReactNode;
}

/**
 * The application shell every future Studio screen renders inside
 * (CMS_PRODUCT_DESIGN.md §1–§2): persistent sidebar (desktop) / drawer
 * (mobile), top bar, and the command palette, composed once here rather
 * than per-page.
 *
 * The nav tree is built here (client-side) from plain primitives
 * (`role`, `hasAssignedLeads`) rather than in the server layout and passed
 * down as a prop — `StudioNavEntry` carries `lucide-react` icon component
 * references, and React Server Components can't serialize a function
 * across the server→client boundary. `getVisibleNav` has no server-only
 * dependency, so constructing it here costs nothing.
 */
export function StudioShell({ role, hasAssignedLeads, user, children }: StudioShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const nav = useMemo(() => getVisibleNav(role, { hasAssignedLeads }), [role, hasAssignedLeads]);

  useEffect(() => {
    const stored = window.localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY);
    if (stored === 'true') {
      setCollapsed(true);
    }
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, String(next));
      return next;
    });
  }

  useKeyboardShortcuts({ nav, onOpenPalette: () => setPaletteOpen(true) });

  const breadcrumbs = getBreadcrumbItems(pathname);

  return (
    <div className="bg-bg-base flex h-dvh overflow-hidden">
      <a
        href="#main-content"
        className="focus-visible:rounded-control sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-3 focus-visible:left-3 focus-visible:z-[60] focus-visible:bg-white focus-visible:px-3 focus-visible:py-2 focus-visible:text-sm focus-visible:text-black"
      >
        Skip to content
      </a>

      <Sidebar nav={nav} collapsed={collapsed} onToggleCollapsed={toggleCollapsed} />
      <MobileNavDrawer nav={nav} open={mobileNavOpen} onOpenChange={setMobileNavOpen} />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          breadcrumbs={breadcrumbs}
          user={user}
          onOpenPalette={() => setPaletteOpen(true)}
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />
        <main id="main-content" className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>

      <CommandPalette nav={nav} open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}
