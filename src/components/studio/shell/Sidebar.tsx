'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { StudioNavEntry } from '@/lib/studio/navigation';
import { SidebarNavList } from './SidebarNavList';

interface SidebarProps {
  nav: StudioNavEntry[];
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

/**
 * CMS_PRODUCT_DESIGN.md §2 — a persistent left sidebar, collapsible to
 * icon-only but never auto-hiding (`.hubzero/design/navigation.md`: an
 * internal dashboard optimizes for the hundredth use, not a first
 * impression). Hidden below `md`, where `MobileNavDrawer` takes over —
 * a fixed 240px rail has nowhere to go on a phone-width viewport, so the
 * persistent-sidebar pattern intentionally becomes an on-demand drawer
 * there instead of shrinking into an unusable icon sliver.
 */
export function Sidebar({ nav, collapsed, onToggleCollapsed }: SidebarProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className={cn(
        'border-border-default bg-bg-base duration-considered ease-standard hidden h-full shrink-0 flex-col border-r transition-[width] md:flex',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      <div className="border-border-muted border-b px-2 py-3">
        <Link
          href="/studio/dashboard"
          className={cn(
            // Same `px-2` (outer) + `px-3` (inner) padding recipe as
            // `SidebarNavList`'s rows and the collapse toggle below, so the
            // brand mark sits on the exact same vertical column as every
            // other icon in the rail instead of its own, slightly-more-left
            // inset — one consistent alignment axis for the whole sidebar.
            'text-text-primary rounded-control duration-fast ease-standard hover:bg-surface-elevated flex items-center gap-2 px-3 py-2 text-sm font-semibold transition-colors',
            collapsed && 'justify-center px-0',
          )}
        >
          <Image
            src="/brand/hubzero-app-icon.png"
            alt="HubZero"
            width={28}
            height={28}
            className="rounded-control shrink-0"
            priority
          />
          {collapsed ? null : <span className="min-w-0 flex-1 truncate">HubZero Studio</span>}
        </Link>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-2 pb-4">
        <SidebarNavList nav={nav} pathname={pathname} collapsed={collapsed} />
      </div>

      <div className="border-border-muted border-t px-2 py-2">
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-pressed={collapsed}
          className={cn(
            'rounded-control text-text-muted duration-fast ease-standard hover:bg-surface-elevated hover:text-text-primary flex min-h-11 w-full items-center gap-3 px-3 text-sm transition-colors',
            collapsed && 'justify-center px-0',
          )}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" aria-hidden />
          ) : (
            <PanelLeftClose className="h-4 w-4" aria-hidden />
          )}
          <span className={collapsed ? 'sr-only' : undefined}>
            {collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          </span>
        </button>
      </div>
    </nav>
  );
}
