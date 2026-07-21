'use client';

import { useActionState } from 'react';
import { RelationMultiSelect } from '@/components/studio/collection/RelationMultiSelect';
import { MediaGalleryField } from '@/components/media/MediaGalleryField';
import { MediaPickerField } from '@/components/media/MediaPickerField';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { fieldClassName, Input } from '@/components/ui/Input';
import type { EntryActionState } from '@/lib/studio/entry-actions';
import type { MediaAssetDTO } from '@/lib/media/dto';
import type { BuildDeploymentState } from '@/types/studio';

export interface BuildFormValues {
  title: string;
  slug: string;
  deploymentState: BuildDeploymentState;
  liveUrl?: string;
  repoUrl?: string;
  featured: boolean;
  technologyIds: string[];
  originatingLabId?: string;
  relatedWorkIds: string[];
  contributors: string[];
}

interface RelationOption {
  id: string;
  label: string;
  referenceId?: string;
}

const emptyActionState: EntryActionState = {};

/**
 * The one metadata form shape for Builds, used by both the create and edit
 * routes — mirrors `WorkForm`'s structure exactly (CMS_PRODUCT_DESIGN.md
 * §30: "an editor who has created a Work entry already knows how to create
 * a Note"). The only real differences from Work are field-level: deployment
 * state instead of client type/timeline/role, a live URL, and the hero/
 * gallery media fields Work doesn't have wired up yet.
 */
export function BuildForm({
  action,
  submitLabel,
  initialValues,
  initialHeroAsset,
  initialGalleryAssets,
  technologyOptions,
  labOptions,
  workOptions,
  contributorOptions,
}: {
  action: (prevState: EntryActionState, formData: FormData) => Promise<EntryActionState>;
  submitLabel: string;
  initialValues?: BuildFormValues;
  initialHeroAsset?: MediaAssetDTO;
  initialGalleryAssets?: MediaAssetDTO[];
  technologyOptions: RelationOption[];
  labOptions: RelationOption[];
  workOptions: RelationOption[];
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
        label="Slug"
        name="slug"
        error={state.fieldErrors?.slug}
        hint="Lowercase, hyphen-separated — e.g. querycraft."
      >
        <Input id="slug" name="slug" defaultValue={initialValues?.slug} required />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Deployment state"
          name="deploymentState"
          error={state.fieldErrors?.deploymentState}
        >
          <select
            id="deploymentState"
            name="deploymentState"
            defaultValue={initialValues?.deploymentState ?? 'live'}
            className={fieldClassName}
          >
            <option value="live">Live</option>
            <option value="retired">Retired</option>
          </select>
        </Field>

        <Field
          label="Originating Lab"
          name="originatingLabId"
          error={state.fieldErrors?.originatingLabId}
          hint="Optional — set when this Build graduated from a Lab."
        >
          <select
            id="originatingLabId"
            name="originatingLabId"
            defaultValue={initialValues?.originatingLabId ?? ''}
            className={fieldClassName}
          >
            <option value="">None</option>
            {labOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
                {option.referenceId ? ` (${option.referenceId})` : ''}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field
        label="Live deployment URL"
        name="liveUrl"
        error={state.fieldErrors?.liveUrl}
        hint="Optional — where the Build is actually running."
      >
        <Input
          id="liveUrl"
          name="liveUrl"
          type="url"
          defaultValue={initialValues?.liveUrl}
          placeholder="https://…"
        />
      </Field>

      <Field
        label="Repository URL"
        name="repoUrl"
        error={state.fieldErrors?.repoUrl}
        hint="Optional — link to the public or internal repository."
      >
        <Input
          id="repoUrl"
          name="repoUrl"
          type="url"
          defaultValue={initialValues?.repoUrl}
          placeholder="https://github.com/…"
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

      <Field
        label="Hero image"
        name="heroImageId"
        error={state.fieldErrors?.heroImageId}
        asFieldset
      >
        <MediaPickerField name="heroImageId" initialAsset={initialHeroAsset} folder="builds" />
      </Field>

      <Field
        label="Gallery"
        name="galleryImageIds"
        error={state.fieldErrors?.galleryImageIds}
        asFieldset
      >
        <MediaGalleryField
          name="galleryImageIds"
          initialAssets={initialGalleryAssets}
          folder="builds"
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
        label="Related Work"
        name="relatedWorkIds"
        error={state.fieldErrors?.relatedWorkIds}
        asFieldset
      >
        <RelationMultiSelect
          name="relatedWorkIds"
          options={workOptions}
          selectedIds={initialValues?.relatedWorkIds ?? []}
          emptyMessage="No Work entries exist yet."
        />
      </Field>

      <Field
        label="Contributors"
        name="contributors"
        error={state.fieldErrors?.contributors}
        hint="Explicit public credit. Select the Team members who contributed to this Build."
        asFieldset
      >
        <RelationMultiSelect
          name="contributors"
          options={contributorOptions}
          selectedIds={initialValues?.contributors ?? []}
          emptyMessage="No Team members exist yet."
        />
      </Field>

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? 'Saving…' : submitLabel}
      </Button>
    </form>
  );
}
