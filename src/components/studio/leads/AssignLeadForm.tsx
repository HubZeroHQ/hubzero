'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/Button';
import type { EntryActionState } from '@/lib/studio/entry-actions';

const emptyActionState: EntryActionState = {};

export function AssignLeadForm({
  assignedToUserId,
  userOptions,
  action,
}: {
  assignedToUserId?: string;
  userOptions: { id: string; label: string }[];
  action: (prevState: EntryActionState, formData: FormData) => Promise<EntryActionState>;
}) {
  const [state, formAction, pending] = useActionState(action, emptyActionState);

  return (
    <form action={formAction} className="flex items-center gap-2">
      {state.error ? (
        <p role="alert" className="text-danger text-sm">
          {state.error}
        </p>
      ) : null}
      <select
        name="assignedToUserId"
        defaultValue={assignedToUserId ?? ''}
        className="bg-surface-default text-text-primary focus-visible:border-accent duration-fast ease-standard rounded-[4px] border border-[#2a2a2a] px-3 py-2 text-sm transition-colors focus-visible:outline-none"
      >
        <option value="">Unassigned</option>
        {userOptions.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? 'Saving…' : 'Assign'}
      </Button>
    </form>
  );
}
