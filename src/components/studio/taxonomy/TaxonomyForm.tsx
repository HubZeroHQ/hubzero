'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import type { EntryActionState } from '@/lib/studio/entry-actions';
import type { TaxonomyKind } from '@/types/studio';

const KINDS: TaxonomyKind[] = ['technology', 'category', 'topic'];
const emptyActionState: EntryActionState = {};

export function TaxonomyForm({
  action,
  submitLabel,
  initialValues,
}: {
  action: (prevState: EntryActionState, formData: FormData) => Promise<EntryActionState>;
  submitLabel: string;
  initialValues?: { kind: TaxonomyKind; label: string; slug: string };
}) {
  const [state, formAction, pending] = useActionState(action, emptyActionState);

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-6">
      {state.error ? (
        <p role="alert" className="text-danger text-sm">
          {state.error}
        </p>
      ) : null}

      <Field label="Kind" name="kind" error={state.fieldErrors?.kind}>
        <select
          id="kind"
          name="kind"
          defaultValue={initialValues?.kind ?? 'technology'}
          className="bg-surface-default text-text-primary focus-visible:border-accent duration-fast ease-standard rounded-[4px] border border-[#2a2a2a] px-3 py-2 text-sm transition-colors focus-visible:outline-none"
        >
          {KINDS.map((kind) => (
            <option key={kind} value={kind}>
              {kind}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Label" name="label" error={state.fieldErrors?.label}>
        <Input id="label" name="label" defaultValue={initialValues?.label} required />
      </Field>

      <Field
        label="Slug"
        name="slug"
        error={state.fieldErrors?.slug}
        hint="Lowercase, hyphen-separated — must be unique."
      >
        <Input id="slug" name="slug" defaultValue={initialValues?.slug} required />
      </Field>

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? 'Saving…' : submitLabel}
      </Button>
    </form>
  );
}
