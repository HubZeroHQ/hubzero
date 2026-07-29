'use client';

import { useActionState } from 'react';
import { MediaGalleryField } from '@/components/media/MediaGalleryField';
import { MediaPickerField } from '@/components/media/MediaPickerField';
import { RelationMultiSelect } from '@/components/studio/collection/RelationMultiSelect';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { fieldClassName, Input } from '@/components/ui/Input';
import type { MediaAssetDTO } from '@/lib/media/dto';
import type { EntryActionState } from '@/lib/studio/entry-actions';

type Option = { id: string; label: string; referenceId?: string };
export type EngineeringProfileFormValues = Record<string, string | string[]> & {
  teamMemberId: string;
  slug: string;
};
const empty: EntryActionState = {};

export function EngineeringProfileForm({
  action,
  submitLabel,
  initialValues,
  initialPortrait,
  initialHero,
  initialGalleryAssets,
  teamOptions,
  technologyOptions,
  workOptions,
  buildOptions,
  blueprintOptions,
  labOptions,
  noteOptions,
}: {
  action: (state: EntryActionState, data: FormData) => Promise<EntryActionState>;
  submitLabel: string;
  initialValues?: EngineeringProfileFormValues;
  initialPortrait?: MediaAssetDTO;
  initialHero?: MediaAssetDTO;
  initialGalleryAssets?: MediaAssetDTO[];
  teamOptions: Option[];
  technologyOptions: Option[];
  workOptions: Option[];
  buildOptions: Option[];
  blueprintOptions: Option[];
  labOptions: Option[];
  noteOptions: Option[];
}) {
  const [state, formAction, pending] = useActionState(action, empty);
  const text = (key: string) => (initialValues?.[key] as string | undefined) ?? '';
  const ids = (key: string) => (initialValues?.[key] as string[] | undefined) ?? [];
  return (
    <form action={formAction} className="flex max-w-3xl flex-col gap-6">
      {state.error ? (
        <p role="alert" className="text-danger text-sm">
          {state.error}
        </p>
      ) : null}
      <Field label="Team member" name="teamMemberId" error={state.fieldErrors?.teamMemberId}>
        <select
          id="teamMemberId"
          name="teamMemberId"
          defaultValue={initialValues?.teamMemberId ?? ''}
          className={fieldClassName}
          required
        >
          <option value="" disabled>
            Select the engineer…
          </option>
          {teamOptions.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label} · {o.referenceId}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Slug" name="slug" error={state.fieldErrors?.slug}>
        <Input id="slug" name="slug" defaultValue={initialValues?.slug} required />
      </Field>
      {(
        [
          ['overview', 'Overview'],
          ['engineeringPhilosophy', 'Engineering philosophy'],
          ['currentExploration', 'Current exploration'],
        ] as const
      ).map(([name, label]) => (
        <Field key={name} label={label} name={name} error={state.fieldErrors?.[name]}>
          <textarea
            id={name}
            name={name}
            defaultValue={text(name)}
            rows={4}
            required
            className={fieldClassName}
          />
        </Field>
      ))}
      {(
        [
          ['areasOfExpertise', 'Areas of expertise'],
          ['currentInterests', 'Current interests'],
          ['engineeringIdentity', 'Engineering identity'],
        ] as const
      ).map(([name, label]) => (
        <Field key={name} label={label} name={name} hint="One item per line">
          <textarea
            id={name}
            name={name}
            defaultValue={ids(name).join('\n')}
            rows={4}
            className={fieldClassName}
          />
        </Field>
      ))}
      <Field label="Portrait" name="portraitId" asFieldset>
        <MediaPickerField
          name="portraitId"
          initialAsset={initialPortrait}
          folder="engineeringProfiles"
        />
      </Field>
      <Field label="Hero media (optional)" name="heroMediaId" asFieldset>
        <MediaPickerField
          name="heroMediaId"
          initialAsset={initialHero}
          folder="engineeringProfiles"
        />
      </Field>
      <Field label="Gallery (optional)" name="galleryImageIds" asFieldset>
        <MediaGalleryField
          name="galleryImageIds"
          initialAssets={initialGalleryAssets}
          folder="engineeringProfiles"
        />
      </Field>
      <RelationField
        label="Technologies"
        name="technologyIds"
        options={technologyOptions}
        selected={ids('technologyIds')}
      />
      <RelationField
        label="Featured Work"
        name="featuredWorkIds"
        options={workOptions}
        selected={ids('featuredWorkIds')}
      />
      <RelationField
        label="Featured Builds"
        name="featuredBuildIds"
        options={buildOptions}
        selected={ids('featuredBuildIds')}
      />
      <RelationField
        label="Featured Blueprints"
        name="featuredBlueprintIds"
        options={blueprintOptions}
        selected={ids('featuredBlueprintIds')}
      />
      <RelationField
        label="Featured Labs"
        name="featuredLabIds"
        options={labOptions}
        selected={ids('featuredLabIds')}
      />
      <RelationField
        label="Featured Notes"
        name="featuredNoteIds"
        options={noteOptions}
        selected={ids('featuredNoteIds')}
      />
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? 'Saving…' : submitLabel}
      </Button>
    </form>
  );
}
function RelationField({
  label,
  name,
  options,
  selected,
}: {
  label: string;
  name: string;
  options: Option[];
  selected: string[];
}) {
  return (
    <Field label={label} name={name} asFieldset>
      <RelationMultiSelect
        name={name}
        options={options}
        selectedIds={selected}
        emptyMessage={`No ${label.toLowerCase()} available.`}
      />
    </Field>
  );
}
