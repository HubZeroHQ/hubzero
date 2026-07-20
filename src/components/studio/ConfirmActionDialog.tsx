'use client';

import { useState, useTransition } from 'react';
import { Button, type ButtonVariant } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';

/**
 * The one confirmation-dialog implementation for every destructive/
 * significant zero-argument action across Studio's management screens
 * (Users disable/delete, Team archive/delete, Leads archive/delete,
 * Taxonomy delete, Services delete) — DESIGN_SYSTEM.md principle 18: a
 * pattern repeating 4+ times becomes a documented component rather than
 * five hand-rolled copies. Wraps a server action that takes no arguments
 * beyond what the caller already bound (`action.bind(null, id)`), since
 * every one of these confirmations acts on a single already-known entry.
 */
export function ConfirmActionDialog({
  triggerLabel,
  triggerVariant = 'secondary',
  title,
  description,
  confirmLabel,
  confirmVariant = 'primary',
  action,
}: {
  triggerLabel: string;
  triggerVariant?: ButtonVariant;
  title: string;
  description?: string;
  confirmLabel: string;
  confirmVariant?: ButtonVariant;
  action: () => Promise<{ error?: string } | void>;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const result = await action();
      if (result?.error) {
        setError(result.error);
        return;
      }
      setError(undefined);
      setOpen(false);
    });
  }

  return (
    <>
      <Button
        type="button"
        variant={triggerVariant}
        onClick={() => {
          setError(undefined);
          setOpen(true);
        }}
      >
        {triggerLabel}
      </Button>
      <Dialog open={open} onOpenChange={setOpen} title={title} description={description}>
        <div className="flex flex-col gap-4">
          {error ? (
            <p role="alert" className="text-danger text-sm">
              {error}
            </p>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant={confirmVariant}
              onClick={handleConfirm}
              disabled={pending}
            >
              {pending ? 'Working…' : confirmLabel}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
