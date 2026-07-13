'use client';

import { Menu, Search } from 'lucide-react';
import type { BreadcrumbItem } from '@/lib/cms/navigation';
import type { UserRole } from '@/types/cms';
import { Breadcrumbs } from './Breadcrumbs';
import { UserMenu } from './UserMenu';

interface TopBarProps {
  breadcrumbs: BreadcrumbItem[];
  user: { name: string; email: string; role: UserRole };
  onOpenPalette: () => void;
  onOpenMobileNav: () => void;
}

/**
 * CMS_PRODUCT_DESIGN.md §2 — minimal, three jobs only: where am I
 * (breadcrumb), get me anywhere (search trigger), user menu. Deliberately
 * has no "New" quick-action button and no notification bell — see the PR
 * description for why (collection creation and a top-bar inbox are both
 * out of Phase 2's scope/design).
 */
export function TopBar({ breadcrumbs, user, onOpenPalette, onOpenMobileNav }: TopBarProps) {
  return (
    <header className="border-border-default flex h-14 shrink-0 items-center gap-3 border-b px-4">
      <button
        type="button"
        onClick={onOpenMobileNav}
        aria-label="Open navigation"
        className="rounded-control text-text-muted duration-fast ease-standard hover:bg-surface-elevated hover:text-text-primary flex min-h-11 min-w-11 items-center justify-center transition-colors md:hidden"
      >
        <Menu className="h-4 w-4" aria-hidden />
      </button>

      <div className="min-w-0 flex-1">
        <Breadcrumbs items={breadcrumbs} />
      </div>

      <button
        type="button"
        onClick={onOpenPalette}
        className="rounded-control border-border-default text-text-muted duration-fast ease-standard hover:bg-surface-elevated hover:text-text-primary flex min-h-11 items-center gap-2 border px-3 text-sm transition-colors"
      >
        <Search className="h-3.5 w-3.5" aria-hidden />
        <span className="hidden sm:inline">Search</span>
        <kbd className="border-border-default bg-surface-elevated text-text-muted hidden rounded-[4px] border px-1.5 py-0.5 font-mono text-[10px] sm:inline">
          ⌘K
        </kbd>
      </button>

      <UserMenu name={user.name} email={user.email} role={user.role} />
    </header>
  );
}
