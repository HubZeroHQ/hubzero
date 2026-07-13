'use client';

import * as Dialog from '@radix-ui/react-dialog';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import type { StudioNavEntry } from '@/lib/studio/navigation';
import { SidebarNavList } from './SidebarNavList';

interface MobileNavDrawerProps {
  nav: StudioNavEntry[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * The `md:hidden` counterpart to `Sidebar` — an off-canvas drawer for
 * narrow viewports. Built on Radix Dialog for correct focus-trap,
 * Escape-to-close, and scrim-click-to-close behavior (DESIGN_SYSTEM.md §7
 * Dialogs/Modals) rather than hand-rolled overlay logic.
 */
export function MobileNavDrawer({ nav, open, onOpenChange }: MobileNavDrawerProps) {
  const pathname = usePathname();

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="overlay-scrim fixed inset-0 z-50 bg-black/60 md:hidden" />
        <Dialog.Content
          aria-label="Primary navigation"
          className="drawer-panel bg-bg-base fixed inset-y-0 left-0 z-50 flex w-72 flex-col shadow-[0_24px_48px_-24px_rgba(0,0,0,0.7)] md:hidden"
        >
          <div className="border-border-muted flex items-center justify-between gap-2 border-b px-2 py-3">
            <Dialog.Title asChild>
              <Link
                href="/studio/dashboard"
                onClick={() => onOpenChange(false)}
                className="text-text-primary rounded-control duration-fast ease-standard hover:bg-surface-elevated flex min-w-0 items-center gap-2 px-3 py-2 text-sm font-semibold transition-colors"
              >
                <Image
                  src="/brand/hubzero-app-icon.png"
                  alt="HubZero"
                  width={28}
                  height={28}
                  className="rounded-control shrink-0"
                />
                <span className="min-w-0 flex-1 truncate">HubZero Studio</span>
              </Link>
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close navigation"
                className="rounded-control text-text-muted duration-fast ease-standard hover:bg-surface-elevated hover:text-text-primary flex min-h-11 min-w-11 shrink-0 items-center justify-center transition-colors"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </Dialog.Close>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto px-2 pb-4">
            <SidebarNavList
              nav={nav}
              pathname={pathname}
              collapsed={false}
              onNavigate={() => onOpenChange(false)}
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
