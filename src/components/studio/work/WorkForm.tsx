'use client';

import { useActionState } from 'react';
import { RelationMultiSelect } from '@/components/studio/collection/RelationMultiSelect';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { fieldClassName } from '@/components/ui/Input';
import type { EntryActionState } from '@/lib/studio/entry-actions';

export interface WorkFormValues {
  title: string;
  summary: string;
  slug: string;
  clientType: string;
  timeline: string;
  role: string;
  repoUrl?: string;
  categoryTagIds: string[];
  technologyIds: string[];
  relatedBuildIds: string[];
  relatedBlueprintIds: string[];
  relatedLabIds: string[];
  contributorProfileIds: string[];
}

interface RelationOption {
  id: string;
  label: string;
  referenceId?: string;
}

const emptyActionState: EntryActionState = {};

/**
 * The one metadata form shape for Work, used by both the create and edit
 * routes (`content/work/new`, `content/work/[id]/edit`) — the difference
 * between the two is only which server action + initial values are passed
 * in, per CMS_PRODUCT_DESIGN.md §30 ("an editor who has created a Work
 * entry already knows how to create a Note").
 */
export function WorkForm({
  action,
  submitLabel,
  initialValues,
  categoryOptions,
  technologyOptions,
  buildOptions,
  blueprintOptions,
  labOptions,
  contributorOptions,
}: {
  action: (prevState: EntryActionState, formData: FormData) => Promise<EntryActionState>;
  submitLabel: string;
  initialValues?: WorkFormValues;
  categoryOptions: RelationOption[];
  technologyOptions: RelationOption[];
  buildOptions: RelationOption[];
  blueprintOptions: RelationOption[];
  labOptions: RelationOption[];
  contributorOptions: RelationOption[];
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

      <Field
        label="Public summary"
        name="summary"
        error={state.fieldErrors?.summary}
        hint="A concise account of the problem and engineering consequence. Used in public indexes, metadata, and search."
      >
        <textarea
          id="summary"
          name="summary"
          rows={4}
          maxLength={320}
          defaultValue={initialValues?.summary}
          className={fieldClassName}
          required
        />
      </Field>

      <Field
        label="Slug"
        name="slug"
        error={state.fieldErrors?.slug}
        hint="Lowercase, hyphen-separated — e.g. northwind-platform-migration."
      >
        <Input id="slug" name="slug" defaultValue={initialValues?.slug} required />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Client type" name="clientType" error={state.fieldErrors?.clientType}>
          <Input
            id="clientType"
            name="clientType"
            defaultValue={initialValues?.clientType}
            required
          />
        </Field>
        <Field label="Timeline" name="timeline" error={state.fieldErrors?.timeline}>
          <Input id="timeline" name="timeline" defaultValue={initialValues?.timeline} required />
        </Field>
        <Field label="Role" name="role" error={state.fieldErrors?.role}>
          <Input id="role" name="role" defaultValue={initialValues?.role} required />
        </Field>
      </div>

      <Field
        label="Repository URL"
        name="repoUrl"
        error={state.fieldErrors?.repoUrl}
        hint="Optional — link to the client or internal repository."
      >
        <Input
          id="repoUrl"
          name="repoUrl"
          type="url"
          defaultValue={initialValues?.repoUrl}
          placeholder="https://github.com/…"
        />
      </Field>

      <Field
        label="Technologies"
        name="technologyIds"
        error={state.fieldErrors?.technologyIds}
        asFieldset
      >
        <RelationMultiSelect
          name="technologyIds"
          options={technologyOptions}
          selectedIds={initialValues?.technologyIds ?? []}
          emptyMessage="No technologies in Taxonomy yet."
        />
      </Field>

      <Field
        label="Category tags"
        name="categoryTagIds"
        error={state.fieldErrors?.categoryTagIds}
        asFieldset
      >
        <RelationMultiSelect
          name="categoryTagIds"
          options={categoryOptions}
          selectedIds={initialValues?.categoryTagIds ?? []}
          emptyMessage="No categories in Taxonomy yet."
        />
      </Field>

      <Field
        label="Related Builds"
        name="relatedBuildIds"
        error={state.fieldErrors?.relatedBuildIds}
        asFieldset
      >
        <RelationMultiSelect
          name="relatedBuildIds"
          options={buildOptions}
          selectedIds={initialValues?.relatedBuildIds ?? []}
          emptyMessage="No Builds exist yet."
        />
      </Field>

      <Field
        label="Related Blueprints"
        name="relatedBlueprintIds"
        error={state.fieldErrors?.relatedBlueprintIds}
        asFieldset
      >
        <RelationMultiSelect
          name="relatedBlueprintIds"
          options={blueprintOptions}
          selectedIds={initialValues?.relatedBlueprintIds ?? []}
          emptyMessage="No Blueprints exist yet."
        />
      </Field>

      <Field
        label="Related Labs"
        name="relatedLabIds"
        error={state.fieldErrors?.relatedLabIds}
        asFieldset
      >
        <RelationMultiSelect
          name="relatedLabIds"
          options={labOptions}
          selectedIds={initialValues?.relatedLabIds ?? []}
          emptyMessage="No Labs exist yet."
        />
      </Field>

      <Field
        label="Engineering contributors"
        name="contributorProfileIds"
        error={state.fieldErrors?.contributorProfileIds}
        hint="Explicit public credit. Select only Engineering Profiles for people who contributed to this Work."
        asFieldset
      >
        <RelationMultiSelect
          name="contributorProfileIds"
          options={contributorOptions}
          selectedIds={initialValues?.contributorProfileIds ?? []}
          emptyMessage="No Engineering Profiles exist yet."
        />
      </Field>

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? 'Saving…' : submitLabel}
      </Button>
    </form>
  );
}
