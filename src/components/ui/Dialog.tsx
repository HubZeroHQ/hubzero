'use client';

import * as RadixDialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * The Studio's first extracted `Dialog` primitive. Every prior overlay
 * (`CommandPalette`, `BlockInsertMenu`, `MobileNavDrawer`) hand-rolled the
 * same Radix Dialog + `overlay-scrim`/`overlay-panel` class pair inline
 * because each was a `cmdk`-flavored "search and pick one" surface with its
 * own internal layout. The Media Library needed a third, non-`cmdk` variant
 * (a plain titled panel — upload dialog, delete confirmation, the Media
 * Picker's shell) which is the repeat that earns a shared component per
 * DESIGN_SYSTEM.md principle 18 ("if a pattern will repeat 4+ times, it
 * becomes a documented component"). `CommandPalette`/`BlockInsertMenu` are
 * intentionally left as-is — their `cmdk`-specific `Command.Dialog` API
 * doesn't compose with this wrapper's `children`-based content.
 *
 * Always closable three ways (explicit ✕, Escape, scrim click), always
 * traps and restores focus — Radix `Dialog` provides all three for free
 * (DESIGN_SYSTEM.md §7 Dialogs/Modals/Inspector Panels).
 */
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  widthClassName = 'max-w-[560px]',
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  /** Overrides the default modal width (the Media Picker needs a much wider panel than a confirmation dialog). */
  widthClassName?: string;
}) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="overlay-scrim fixed inset-0 z-50 bg-black/60" />
        <RadixDialog.Content
          className={cn(
            'overlay-panel border-border-default bg-surface-overlay rounded-overlay fixed inset-x-0 top-[10%] z-50 mx-auto flex max-h-[80vh] w-[calc(100%-32px)] flex-col overflow-hidden border shadow-[0_24px_60px_-28px_rgba(0,0,0,0.7)]',
            widthClassName,
            className,
          )}
        >
          <div className="border-border-muted flex items-start justify-between gap-4 border-b px-5 py-4">
            <div className="flex flex-col gap-0.5">
              <RadixDialog.Title className="text-text-primary text-sm font-semibold">
                {title}
              </RadixDialog.Title>
              {description ? (
                <RadixDialog.Description className="text-text-muted text-xs">
                  {description}
                </RadixDialog.Description>
              ) : null}
            </div>
            <RadixDialog.Close asChild>
              <button
                type="button"
                aria-label="Close"
                className="text-text-muted hover:bg-surface-elevated hover:text-text-primary duration-fast ease-standard rounded-control -mt-1 -mr-1 flex h-8 w-8 shrink-0 items-center justify-center transition-colors"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </RadixDialog.Close>
          </div>
          <div className="overflow-y-auto p-5">{children}</div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
