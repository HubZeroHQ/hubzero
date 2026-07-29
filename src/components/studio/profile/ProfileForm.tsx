'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { updateOwnProfileAction } from '@/lib/studio/actions/user';
import type { EntryActionState } from '@/lib/studio/entry-actions';

const emptyActionState: EntryActionState = {};

/** Deliberately name-only — role and account status are Users-management-only, so a session can never grant itself more access from its own profile page. */
export function ProfileForm({ name }: { name: string }) {
  const [state, formAction, pending] = useActionState(updateOwnProfileAction, emptyActionState);

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      {state.error ? (
        <p role="alert" className="text-danger text-sm">
          {state.error}
        </p>
      ) : null}
      <Field label="Name" name="name" error={state.fieldErrors?.name}>
        <Input id="name" name="name" defaultValue={name} required />
      </Field>
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? 'Saving…' : 'Save changes'}
      </Button>
    </form>
  );
}
