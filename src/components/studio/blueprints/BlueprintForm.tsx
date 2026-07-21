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

export interface BlueprintFormValues {
  name: string;
  slug: string;
  architecture: string;
  designLanguage: string;
  shortDescription: string;
  liveDeploymentUrl: string;
  repoUrl?: string;
  docsUrl?: string;
  version: string;
  featured: boolean;
  features: string[];
  technologyIds: string[];
  previewAssetIds: string[];
  contributors: string[];
}

interface RelationOption {
  id: string;
  label: string;
  referenceId?: string;
}

const emptyActionState: EntryActionState = {};

/**
 * The one metadata form shape for Blueprints, used by both the create and
 * edit routes — mirrors `BuildForm`'s structure exactly (CMS_PRODUCT_DESIGN.md
 * §30: "an editor who has created a Work entry already knows how to create
 * a Note"). The only real differences from Build are field-level: the
 * mandatory `Blueprint-X-Y` name plus its X/Y classification fields, a short
 * description, a version string, and a required live preview URL instead of
 * an optional one.
 */
export function BlueprintForm({
  action,
  submitLabel,
  initialValues,
  initialHeroAsset,
  initialGalleryAssets,
  technologyOptions,
  contributorOptions,
}: {
  action: (prevState: EntryActionState, formData: FormData) => Promise<EntryActionState>;
  submitLabel: string;
  initialValues?: BlueprintFormValues;
  initialHeroAsset?: MediaAssetDTO;
  initialGalleryAssets?: MediaAssetDTO[];
  technologyOptions: RelationOption[];
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

      <Field
        label="Name"
        name="name"
        error={state.fieldErrors?.name}
        hint="Must follow the Blueprint-X-Y naming convention — e.g. Blueprint-SaaS-Editorial (AGENTS.md)."
      >
        <Input
          id="name"
          name="name"
          defaultValue={initialValues?.name}
          placeholder="Blueprint-SaaS-Editorial"
          required
        />
      </Field>

      <Field
        label="Slug"
        name="slug"
        error={state.fieldErrors?.slug}
        hint="Lowercase, hyphen-separated — e.g. saas-editorial."
      >
        <Input id="slug" name="slug" defaultValue={initialValues?.slug} required />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Architecture (X)"
          name="architecture"
          error={state.fieldErrors?.architecture}
          hint="Information architecture — e.g. SaaS, Portfolio, Ecommerce."
        >
          <Input
            id="architecture"
            name="architecture"
            defaultValue={initialValues?.architecture}
            required
          />
        </Field>
        <Field
          label="Design language (Y)"
          name="designLanguage"
          error={state.fieldErrors?.designLanguage}
          hint="e.g. Editorial, Minimal, Brutalist, Luxury."
        >
          <Input
            id="designLanguage"
            name="designLanguage"
            defaultValue={initialValues?.designLanguage}
            required
          />
        </Field>
      </div>

      <Field
        label="Short description"
        name="shortDescription"
        error={state.fieldErrors?.shortDescription}
        hint="Card/list-view summary. The full case study is written below as the Document body."
      >
        <textarea
          id="shortDescription"
          name="shortDescription"
          defaultValue={initialValues?.shortDescription}
          rows={3}
          required
          className={fieldClassName}
        />
      </Field>

      <Field
        label="Features"
        name="features"
        error={state.fieldErrors?.features}
        hint="One feature per line."
      >
        <textarea
          id="features"
          name="features"
          defaultValue={initialValues?.features.join('\n')}
          rows={4}
          className={fieldClassName}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Live preview URL"
          name="liveDeploymentUrl"
          error={state.fieldErrors?.liveDeploymentUrl}
          hint="Required — where a visitor can experience this foundation directly (PLANNING.md §11)."
        >
          <Input
            id="liveDeploymentUrl"
            name="liveDeploymentUrl"
            type="url"
            defaultValue={initialValues?.liveDeploymentUrl}
            placeholder="https://…"
            required
          />
        </Field>
        <Field label="Version" name="version" error={state.fieldErrors?.version}>
          <Input
            id="version"
            name="version"
            defaultValue={initialValues?.version ?? '1.0.0'}
            placeholder="1.0.0"
            required
          />
        </Field>
      </div>

      <Field
        label="Documentation URL"
        name="docsUrl"
        error={state.fieldErrors?.docsUrl}
        hint="Optional — a standalone docs site, separate from the case study below."
      >
        <Input
          id="docsUrl"
          name="docsUrl"
          type="url"
          defaultValue={initialValues?.docsUrl}
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
        label="Hero media"
        name="heroImageId"
        error={state.fieldErrors?.heroImageId}
        asFieldset
      >
        <MediaPickerField name="heroImageId" initialAsset={initialHeroAsset} folder="blueprints" />
      </Field>

      <Field
        label="Gallery"
        name="previewAssetIds"
        error={state.fieldErrors?.previewAssetIds}
        asFieldset
      >
        <MediaGalleryField
          name="previewAssetIds"
          initialAssets={initialGalleryAssets}
          folder="blueprints"
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
        label="Contributors"
        name="contributors"
        error={state.fieldErrors?.contributors}
        hint="Explicit public credit. Select the Team members who contributed to this Blueprint."
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
