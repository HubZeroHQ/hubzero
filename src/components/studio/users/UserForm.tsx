'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import type { EntryActionState } from '@/lib/studio/entry-actions';
import { ROLE_LABEL } from '@/lib/studio/role-label';
import type { UserRole } from '@/types/studio';

const ROLES: UserRole[] = ['headAdmin', 'admin', 'member'];
const emptyActionState: EntryActionState = {};

export interface UserFormValues {
  name: string;
  email: string;
  role: UserRole;
}

/**
 * One form for both create and edit — the password field only appears on
 * create (edit's password lives in the separate `ResetPasswordDialog`, so
 * changing metadata never accidentally touches a credential).
 */
export function UserForm({
  mode,
  action,
  submitLabel,
  initialValues,
}: {
  mode: 'create' | 'edit';
  action: (prevState: EntryActionState, formData: FormData) => Promise<EntryActionState>;
  submitLabel: string;
  initialValues?: UserFormValues;
}) {
  const [state, formAction, pending] = useActionState(action, emptyActionState);

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-6">
      {state.error ? (
        <p role="alert" className="text-danger text-sm">
          {state.error}
        </p>
      ) : null}

      <Field label="Name" name="name" error={state.fieldErrors?.name}>
        <Input id="name" name="name" defaultValue={initialValues?.name} required />
      </Field>

      <Field label="Email" name="email" error={state.fieldErrors?.email}>
        <Input id="email" name="email" type="email" defaultValue={initialValues?.email} required />
      </Field>

      <Field
        label="Role"
        name="role"
        error={state.fieldErrors?.role}
        hint="Admin and Head Admin can publish content directly; a Member can only submit for review."
      >
        <select
          id="role"
          name="role"
          defaultValue={initialValues?.role ?? 'member'}
          className="bg-surface-default text-text-primary focus-visible:border-accent duration-fast ease-standard rounded-[4px] border border-[#2a2a2a] px-3 py-2 text-sm transition-colors focus-visible:outline-none"
        >
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {ROLE_LABEL[role]}
            </option>
          ))}
        </select>
      </Field>

      {mode === 'create' ? (
        <Field
          label="Initial password"
          name="password"
          error={state.fieldErrors?.password}
          hint="At least 12 characters. The new user will be prompted to change it on first sign-in."
        >
          <Input id="password" name="password" type="password" minLength={12} required />
        </Field>
      ) : null}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? 'Saving…' : submitLabel}
      </Button>
    </form>
  );
}
