'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { changeOwnPasswordAction } from '@/lib/studio/actions/user';
import type { EntryActionState } from '@/lib/studio/entry-actions';

const emptyActionState: EntryActionState = {};

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changeOwnPasswordAction, emptyActionState);

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      {state.error ? (
        <p role="alert" className="text-danger text-sm">
          {state.error}
        </p>
      ) : null}
      <Field
        label="Current password"
        name="currentPassword"
        error={state.fieldErrors?.currentPassword}
      >
        <Input id="currentPassword" name="currentPassword" type="password" required />
      </Field>
      <Field
        label="New password"
        name="newPassword"
        error={state.fieldErrors?.newPassword}
        hint="At least 12 characters."
      >
        <Input id="newPassword" name="newPassword" type="password" minLength={12} required />
      </Field>
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? 'Saving…' : 'Change password'}
      </Button>
    </form>
  );
}
