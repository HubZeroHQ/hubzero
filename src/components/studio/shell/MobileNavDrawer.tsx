'use client';

import * as Dialog from '@radix-ui/react-dialog';
import Image from 'next/image';
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
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 md:hidden" />
        <Dialog.Content
          aria-label="Primary navigation"
          className="bg-bg-base fixed inset-y-0 left-0 z-50 flex w-72 flex-col shadow-[0_24px_48px_-24px_rgba(0,0,0,0.7)] md:hidden"
        >
          <div className="flex items-center justify-between px-4 py-4">
            <Dialog.Title className="text-text-primary flex items-center gap-2 text-sm font-semibold">
              <Image
                src="/brand/hubzero-app-icon.png"
                alt="HubZero"
                width={24}
                height={24}
                className="shrink-0 rounded-[5px]"
              />
              HubZero Studio
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close navigation"
                className="rounded-control text-text-muted duration-fast ease-standard hover:bg-surface-elevated hover:text-text-primary flex min-h-11 min-w-11 items-center justify-center transition-colors"
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
