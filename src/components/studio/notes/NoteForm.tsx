'use client';

import { useActionState } from 'react';
import { MediaGalleryField } from '@/components/media/MediaGalleryField';
import { MediaPickerField } from '@/components/media/MediaPickerField';
import { RelationMultiSelect } from '@/components/studio/collection/RelationMultiSelect';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { fieldClassName, Input } from '@/components/ui/Input';
import type { EntryActionState } from '@/lib/studio/entry-actions';
import type { MediaAssetDTO } from '@/lib/media/dto';

export interface NoteFormValues {
  title: string;
  slug: string;
  authorId: string;
  summary: string;
  publicationDate: string;
  featured: boolean;
  technologyIds: string[];
  relatedWorkIds: string[];
  relatedBuildIds: string[];
  relatedBlueprintIds: string[];
  relatedLabIds: string[];
  galleryImageIds: string[];
}

interface RelationOption {
  id: string;
  label: string;
  referenceId?: string;
}

const emptyActionState: EntryActionState = {};

/**
 * The one metadata form shape for Notes, used by both the create and edit
 * routes — mirrors `BlueprintForm`'s single-Document structure
 * (CMS_PRODUCT_DESIGN.md §30: "an editor who has created a Work entry
 * already knows how to create a Note"). The four `relatedXIds` fields are
 * Note's own view of the generic cross-collection `relatedEntries` shape
 * (PLANNING.md §24) — merged back into one array server-side
 * (`lib/studio/actions/note.ts`'s `readRelatedEntries`), so this reuses
 * `RelationMultiSelect` four times rather than a new mixed-type picker.
 */
export function NoteForm({
  action,
  submitLabel,
  initialValues,
  initialHeroAsset,
  initialGalleryAssets,
  authorOptions,
  technologyOptions,
  workOptions,
  buildOptions,
  blueprintOptions,
  labOptions,
}: {
  action: (prevState: EntryActionState, formData: FormData) => Promise<EntryActionState>;
  submitLabel: string;
  initialValues?: NoteFormValues;
  initialHeroAsset?: MediaAssetDTO;
  initialGalleryAssets?: MediaAssetDTO[];
  authorOptions: RelationOption[];
  technologyOptions: RelationOption[];
  workOptions: RelationOption[];
  buildOptions: RelationOption[];
  blueprintOptions: RelationOption[];
  labOptions: RelationOption[];
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
        hint="Lowercase, hyphen-separated — e.g. edge-cache-invalidation-postmortem."
      >
        <Input id="slug" name="slug" defaultValue={initialValues?.slug} required />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Author" name="authorId" error={state.fieldErrors?.authorId}>
          <select
            id="authorId"
            name="authorId"
            defaultValue={initialValues?.authorId ?? ''}
            className={fieldClassName}
            required
          >
            <option value="" disabled>
              Select an author…
            </option>
            {authorOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label="Publication date"
          name="publicationDate"
          error={state.fieldErrors?.publicationDate}
        >
          <Input
            id="publicationDate"
            name="publicationDate"
            type="date"
            defaultValue={initialValues?.publicationDate}
            required
          />
        </Field>
      </div>

      <Field
        label="Summary"
        name="summary"
        error={state.fieldErrors?.summary}
        hint="Card/list-view summary. The full write-up is authored below as the Document body."
      >
        <textarea
          id="summary"
          name="summary"
          defaultValue={initialValues?.summary}
          rows={3}
          required
          className={fieldClassName}
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
        <MediaPickerField name="heroImageId" initialAsset={initialHeroAsset} folder="notes" />
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
          folder="notes"
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

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? 'Saving…' : submitLabel}
      </Button>
    </form>
  );
}
