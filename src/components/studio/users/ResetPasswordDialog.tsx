'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import type { EntryActionState } from '@/lib/studio/entry-actions';

const emptyActionState: EntryActionState = {};

/** Admin-assisted reset (Users completion sprint, Part 1) — sets a new password directly since there's no email infrastructure for a reset-link flow. */
export function ResetPasswordDialog({
  action,
}: {
  action: (prevState: EntryActionState, formData: FormData) => Promise<EntryActionState>;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(action, emptyActionState);
  const submittedRef = useRef(false);

  useEffect(() => {
    if (pending) {
      submittedRef.current = true;
    } else if (submittedRef.current && !state.error) {
      submittedRef.current = false;
      setOpen(false);
    }
  }, [pending, state]);

  return (
    <>
      <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
        Reset password
      </Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Reset password"
        description="Sets a new password immediately. The user will be prompted to change it the next time they sign in."
      >
        <form action={formAction} className="flex flex-col gap-4">
          {state.error ? (
            <p role="alert" className="text-danger text-sm">
              {state.error}
            </p>
          ) : null}
          <Field
            label="New password"
            name="newPassword"
            error={state.fieldErrors?.newPassword}
            hint="At least 12 characters."
          >
            <Input id="newPassword" name="newPassword" type="password" minLength={12} required />
          </Field>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Saving…' : 'Set new password'}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
