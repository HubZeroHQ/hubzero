'use client';

import { useActionState } from 'react';
import { RelationMultiSelect } from '@/components/studio/collection/RelationMultiSelect';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { fieldClassName, Input } from '@/components/ui/Input';
import type { EntryActionState } from '@/lib/studio/entry-actions';

interface RelationOption {
  id: string;
  label: string;
  referenceId?: string;
}

export interface ServiceFormValues {
  title: string;
  description: string;
  order: number;
  featured: boolean;
  evidenceWorkIds: string[];
  evidenceBuildIds: string[];
  evidenceBlueprintIds: string[];
  evidenceLabIds: string[];
  evidenceNoteIds: string[];
}

interface ServiceRelationOptions {
  workOptions: RelationOption[];
  buildOptions: RelationOption[];
  blueprintOptions: RelationOption[];
  labOptions: RelationOption[];
  noteOptions: RelationOption[];
}

const emptyActionState: EntryActionState = {};

export function ServiceForm({
  action,
  submitLabel,
  initialValues,
  relationOptions,
}: {
  action: (prevState: EntryActionState, formData: FormData) => Promise<EntryActionState>;
  submitLabel: string;
  initialValues?: ServiceFormValues;
  relationOptions: ServiceRelationOptions;
}) {
  const [state, formAction, pending] = useActionState(action, emptyActionState);

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-6">
      {state.error ? (
        <p role="alert" className="text-danger text-sm">
          {state.error}
        </p>
      ) : null}

      <Field label="Title" name="title" error={state.fieldErrors?.title}>
        <Input id="title" name="title" defaultValue={initialValues?.title} required />
      </Field>

      <Field label="Description" name="description" error={state.fieldErrors?.description}>
        <textarea
          id="description"
          name="description"
          defaultValue={initialValues?.description}
          rows={5}
          required
          className={fieldClassName}
        />
      </Field>

      <Field
        label="Order"
        name="order"
        error={state.fieldErrors?.order}
        hint="Lower numbers sort first."
      >
        <Input
          id="order"
          name="order"
          type="number"
          defaultValue={initialValues?.order ?? 0}
          className="max-w-[120px]"
        />
      </Field>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="featured"
          defaultChecked={initialValues?.featured}
          className="accent-accent"
        />
        <span className="text-text-secondary">Featured on the homepage</span>
      </label>

      <Field label="Evidence — Work" name="evidenceWorkIds" asFieldset>
        <RelationMultiSelect
          name="evidenceWorkIds"
          options={relationOptions.workOptions}
          selectedIds={initialValues?.evidenceWorkIds ?? []}
          emptyMessage="No Work entries yet."
        />
      </Field>
      <Field label="Evidence — Builds" name="evidenceBuildIds" asFieldset>
        <RelationMultiSelect
          name="evidenceBuildIds"
          options={relationOptions.buildOptions}
          selectedIds={initialValues?.evidenceBuildIds ?? []}
          emptyMessage="No Builds yet."
        />
      </Field>
      <Field label="Evidence — Blueprints" name="evidenceBlueprintIds" asFieldset>
        <RelationMultiSelect
          name="evidenceBlueprintIds"
          options={relationOptions.blueprintOptions}
          selectedIds={initialValues?.evidenceBlueprintIds ?? []}
          emptyMessage="No Blueprints yet."
        />
      </Field>
      <Field label="Evidence — Labs" name="evidenceLabIds" asFieldset>
        <RelationMultiSelect
          name="evidenceLabIds"
          options={relationOptions.labOptions}
          selectedIds={initialValues?.evidenceLabIds ?? []}
          emptyMessage="No Labs yet."
        />
      </Field>
      <Field label="Evidence — Notes" name="evidenceNoteIds" asFieldset>
        <RelationMultiSelect
          name="evidenceNoteIds"
          options={relationOptions.noteOptions}
          selectedIds={initialValues?.evidenceNoteIds ?? []}
          emptyMessage="No Notes yet."
        />
      </Field>

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? 'Saving…' : submitLabel}
      </Button>
    </form>
  );
}
