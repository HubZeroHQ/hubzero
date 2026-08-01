'use client';

import { EditorForm } from '@/components/studio/editor/EditorForm';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { updateOwnProfileAction } from '@/lib/studio/actions/user';

/** Deliberately name-only — role and account status are Users-management-only, so a session can never grant itself more access from its own profile page. */
export function ProfileForm({ name }: { name: string }) {
  return (
    <EditorForm
      action={updateOwnProfileAction}
      submitLabel="Save changes"
      label="Your profile"
      className="max-w-md gap-4"
    >
      {(state) => (
        <Field label="Name" name="name" error={state.fieldErrors?.name}>
          <Input id="name" name="name" defaultValue={name} required />
        </Field>
      )}
    </EditorForm>
  );
}
