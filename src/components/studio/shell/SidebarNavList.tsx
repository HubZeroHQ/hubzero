'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import type { StudioNavEntry, StudioNavLeaf } from '@/lib/studio/navigation';

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
  item,
  active,
  collapsed,
  onNavigate,
}: {
  item: StudioNavLeaf;
  active: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      title={collapsed ? item.label : undefined}
      onClick={onNavigate}
      className={cn(
        'rounded-control duration-fast ease-standard flex items-center gap-2.5 px-3 py-2 text-sm transition-colors',
        collapsed && 'justify-center px-0',
        active
          ? 'bg-surface-elevated text-text-primary'
          : 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary',
      )}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      {collapsed ? (
        <span className="sr-only">{item.label}</span>
      ) : (
        // `min-w-0` is required alongside `flex-1` for a flex child to
        // actually shrink below its content's natural width — without it,
        // `truncate` has no narrower width to clip against and a label
        // longer than today's ("Dashboard", "Work", …) would silently
        // overflow the rail instead of ellipsizing.
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
      )}
    </Link>
  );
}

/**
 * The nav tree renderer shared by the desktop persistent Sidebar and the
 * mobile drawer (`MobileNavDrawer`) — one implementation of "walk the nav
 * config and render leaves/groups" rather than two copies that could drift.
 */
export function SidebarNavList({
  nav,
  pathname,
  collapsed,
  onNavigate,
}: {
  nav: StudioNavEntry[];
  pathname: string;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  return (
    <>
      {nav.map((entry, index) => {
        if (entry.kind === 'leaf') {
          return (
            <div key={entry.href}>
              <NavLink
                item={entry}
                active={isActive(pathname, entry.href)}
                collapsed={collapsed}
                onNavigate={onNavigate}
              />
            </div>
          );
        }

        return (
          <div key={`${entry.label}-${index}`}>
            {!collapsed ? (
              <p
                id={`nav-group-${entry.label}`}
                className="text-text-muted px-3 pb-1.5 font-mono text-[11px] tracking-[0.08em] uppercase"
              >
                {entry.label}
              </p>
            ) : null}
            <div
              role="group"
              aria-labelledby={collapsed ? undefined : `nav-group-${entry.label}`}
              aria-label={collapsed ? entry.label : undefined}
              className="space-y-0.5"
            >
              {entry.items.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  active={isActive(pathname, item.href)}
                  collapsed={collapsed}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}
