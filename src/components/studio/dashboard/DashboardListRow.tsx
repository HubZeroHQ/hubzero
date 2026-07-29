import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * The shared row shell for every dashboard widget that's "a clickable list
 * of entries" (`ContentEntryList`, `NewLeadsWidget`) — one implementation
 * of the hover/padding/transition treatment instead of two copies that
 * could drift, and consistent with every other hover-highlighted row in
 * the shell (`SidebarNavList`, `CommandPalette`) having inset padding
 * around its hover fill rather than the fill running flush to the row's
 * own text edges.
 */
export function DashboardListRow({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="duration-fast ease-standard hover:bg-surface-elevated rounded-control -mx-2 flex items-center gap-3 px-2 py-2.5 text-sm transition-colors"
    >
      {children}
    </Link>
  );
}
