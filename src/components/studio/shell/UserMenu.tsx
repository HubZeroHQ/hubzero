'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown, LogOut, UserRound } from 'lucide-react';
import Link from 'next/link';
import { signOutAction } from '@/lib/auth/actions';
import { ROLE_LABEL } from '@/lib/studio/role-label';
import type { UserRole } from '@/types/studio';

interface UserMenuProps {
  name: string;
  email: string;
  role: UserRole;
}

/** Radix's DropdownMenu supplies correct menu ARIA semantics, roving focus, and Escape-to-close for free. */
export function UserMenu({ name, email, role }: UserMenuProps) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="rounded-control duration-fast ease-standard hover:bg-surface-elevated flex min-h-11 items-center gap-2 px-2 text-left transition-colors"
        >
          <span
            className="bg-surface-elevated text-text-secondary flex h-7 w-7 shrink-0 items-center justify-center rounded-[10px] font-mono text-xs"
            aria-hidden
          >
            {initial}
          </span>
          <span className="hidden flex-col sm:flex">
            <span className="text-text-primary text-sm leading-tight">{name}</span>
            <span className="text-text-muted font-mono text-[11px] leading-tight tracking-[0.08em] uppercase">
              {ROLE_LABEL[role]}
            </span>
          </span>
          <ChevronDown className="text-text-muted h-3.5 w-3.5" aria-hidden />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="overlay-panel rounded-card border-border-default bg-surface-overlay z-50 w-56 border p-1.5 shadow-[0_24px_48px_-24px_rgba(0,0,0,0.7)] outline-none"
        >
          <div className="px-2.5 py-2">
            <p className="text-text-primary truncate text-sm">{name}</p>
            <p className="text-text-muted truncate text-xs">{email}</p>
          </div>
          <DropdownMenu.Separator className="bg-border-muted my-1 h-px" />
          <DropdownMenu.Item asChild>
            <Link
              href="/studio/profile"
              className="text-text-secondary duration-fast ease-standard hover:bg-surface-elevated hover:text-text-primary data-[highlighted]:bg-surface-elevated data-[highlighted]:text-text-primary rounded-control flex w-full items-center gap-2 px-2.5 py-2 text-left text-sm transition-colors outline-none"
            >
              <UserRound className="h-3.5 w-3.5" aria-hidden />
              My profile
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="bg-border-muted my-1 h-px" />
          <DropdownMenu.Item asChild>
            <form action={signOutAction}>
              <button
                type="submit"
                className="text-text-secondary duration-fast ease-standard hover:bg-surface-elevated hover:text-text-primary data-[highlighted]:bg-surface-elevated data-[highlighted]:text-text-primary rounded-control flex w-full items-center gap-2 px-2.5 py-2 text-left text-sm transition-colors outline-none"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden />
                Sign out
              </button>
            </form>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
