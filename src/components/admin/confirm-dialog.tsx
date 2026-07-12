"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState, useTransition } from "react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ConfirmDialogProps {
  trigger: ReactNode;
  title: string;
  description: string;
  confirmLabel?: string;
  /** Destructive actions (delete) render the confirm button in the danger tone. */
  destructive?: boolean;
  /** Extra content rendered between the description and the action buttons — e.g. Reset Password's new/confirm password fields. */
  children?: ReactNode;
  /** Disables the confirm button — e.g. while `children`'s inline form content isn't valid yet. */
  confirmDisabled?: boolean;
  onConfirm: () => Promise<void> | void;
}

/**
 * The one shared confirmation dialog `ARCHITECTURE/19_CMS_FOUNDATION.md` §5
 * calls for — delete, publish, and (Phase C) restore-version all parameterize
 * this same component rather than each hand-rolling their own modal, because
 * the interaction pattern ("a destructive or state-changing action needs an
 * explicit second click") doesn't vary by what's being confirmed.
 */
export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Confirm",
  destructive = false,
  children,
  confirmDisabled = false,
  onConfirm,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      await onConfirm();
      setOpen(false);
    });
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="z-overlay bg-bg-dark/60 fixed inset-0 backdrop-blur-sm" />
        <Dialog.Content
          className={cn(
            "z-modal bg-bg-light border-border-muted fixed top-1/2 left-1/2 w-[min(28rem,90vw)] -translate-x-1/2 -translate-y-1/2 rounded-lg border p-6 shadow-xl focus:outline-none",
          )}
        >
          <Dialog.Title className="text-h3 text-text font-medium">{title}</Dialog.Title>
          <Dialog.Description className="text-body text-text-muted mt-2">
            {description}
          </Dialog.Description>

          {children}

          <div className="mt-6 flex justify-end gap-3">
            <Dialog.Close asChild>
              <Button variant="secondary" type="button">
                Cancel
              </Button>
            </Dialog.Close>
            <Button
              type="button"
              variant="primary"
              className={destructive ? "bg-danger text-bg hover:opacity-90" : undefined}
              isLoading={isPending}
              disabled={confirmDisabled}
              onClick={handleConfirm}
            >
              {confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
