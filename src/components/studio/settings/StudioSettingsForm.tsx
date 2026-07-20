'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { fieldClassName, Input } from '@/components/ui/Input';
import type { EntryActionState } from '@/lib/studio/entry-actions';

const emptyActionState: EntryActionState = {};

export function StudioSettingsForm({
  action,
  initialValues,
}: {
  action: (prevState: EntryActionState, formData: FormData) => Promise<EntryActionState>;
  initialValues: {
    studioName: string;
    tagline: string;
    contactEmail: string;
    accentColor?: string;
  };
}) {
  const [state, formAction, pending] = useActionState(action, emptyActionState);

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-6">
      {state.error ? (
        <p role="alert" className="text-danger text-sm">
          {state.error}
        </p>
      ) : null}
      {!state.error && !pending && state !== emptyActionState ? (
        <p className="text-text-secondary text-sm">Saved.</p>
      ) : null}

      <Field label="Studio name" name="studioName" error={state.fieldErrors?.studioName}>
        <Input id="studioName" name="studioName" defaultValue={initialValues.studioName} required />
      </Field>

      <Field label="Tagline" name="tagline" error={state.fieldErrors?.tagline}>
        <textarea
          id="tagline"
          name="tagline"
          defaultValue={initialValues.tagline}
          rows={2}
          className={fieldClassName}
        />
      </Field>

      <Field label="Contact email" name="contactEmail" error={state.fieldErrors?.contactEmail}>
        <Input
          id="contactEmail"
          name="contactEmail"
          type="email"
          defaultValue={initialValues.contactEmail}
          required
        />
      </Field>

      <Field
        label="Accent color"
        name="accentColor"
        error={state.fieldErrors?.accentColor}
        hint="Optional. 6-digit hex, e.g. #ffb020."
      >
        <Input
          id="accentColor"
          name="accentColor"
          defaultValue={initialValues.accentColor}
          placeholder="#ffb020"
          className="max-w-[160px]"
        />
      </Field>

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? 'Saving…' : 'Save changes'}
      </Button>
    </form>
  );
}
