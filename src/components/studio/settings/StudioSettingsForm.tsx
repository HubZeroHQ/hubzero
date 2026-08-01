'use client';

import { EditorForm } from '@/components/studio/editor/EditorForm';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import type { EntryActionState } from '@/lib/studio/entry-actions';

/**
 * The bespoke "Saved." line this form used to render is gone on purpose —
 * `EditorForm`'s save-state indicator is the Studio-wide version of exactly
 * that signal, and it distinguishes saved/unsaved/saving/failed instead of
 * only "not currently erroring".
 */
export function StudioSettingsForm({
  action,
  initialValues,
}: {
  action: (prevState: EntryActionState, formData: FormData) => Promise<EntryActionState>;
  initialValues: {
    studioName: string;
    contactEmail: string;
  };
}) {
  return (
    <EditorForm
      action={action}
      submitLabel="Save changes"
      label="Studio settings"
      className="max-w-lg"
    >
      {(state) => (
        <>
          <Field label="Studio name" name="studioName" error={state.fieldErrors?.studioName}>
            <Input
              id="studioName"
              name="studioName"
              defaultValue={initialValues.studioName}
              required
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
        </>
      )}
    </EditorForm>
  );
}
