'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/Button';
import { fieldClassName } from '@/components/ui/Input';
import type { EntryActionState } from '@/lib/studio/entry-actions';

const emptyActionState: EntryActionState = {};

export function LeadNotesForm({
  internalNotes,
  action,
}: {
  internalNotes?: string;
  action: (prevState: EntryActionState, formData: FormData) => Promise<EntryActionState>;
}) {
  const [state, formAction, pending] = useActionState(action, emptyActionState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      {state.error ? (
        <p role="alert" className="text-danger text-sm">
          {state.error}
        </p>
      ) : null}
      <textarea
        id="internalNotes"
        name="internalNotes"
        defaultValue={internalNotes}
        rows={5}
        placeholder="Internal notes — never shown to the sender."
        className={fieldClassName}
      />
      <Button type="submit" disabled={pending} className="self-start" variant="secondary">
        {pending ? 'Saving…' : 'Save notes'}
      </Button>
    </form>
  );
}
