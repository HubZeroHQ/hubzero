'use client';

import { useActionState } from 'react';
import { MediaGalleryField } from '@/components/media/MediaGalleryField';
import { MediaPickerField } from '@/components/media/MediaPickerField';
import { RelationMultiSelect } from '@/components/studio/collection/RelationMultiSelect';
import {
  ProgressTimelineField,
  type ProgressTimelineMilestoneValue,
} from '@/components/studio/collection/ProgressTimelineField';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { fieldClassName, Input } from '@/components/ui/Input';
import type { EntryActionState } from '@/lib/studio/entry-actions';
import type { MediaAssetDTO } from '@/lib/media/dto';
import type { LabStage } from '@/types/studio';

export interface LabFormValues {
  title: string;
  slug: string;
  stage: LabStage;
  objective: string;
  researchDirection: string;
  currentMilestone: string;
  graduationCriteria: string;
  startDate: string;
  lastMajorUpdateAt?: string;
  internalRepoUrl: string;
  publicRepoUrl?: string;
  liveDemoUrl?: string;
  featured: boolean;
  technologyIds: string[];
  relatedBuildIds: string[];
  relatedBlueprintIds: string[];
  galleryImageIds: string[];
  milestones: ProgressTimelineMilestoneValue[];
  contributorProfileIds: string[];
}

interface RelationOption {
  id: string;
  label: string;
  referenceId?: string;
}

const LAB_DOCUMENT_ROLE_OPTIONS = [
  { value: 'overview', label: 'Overview' },
  { value: 'engineeringJournal', label: 'Engineering Journal' },
  { value: 'findings', label: 'Findings' },
  { value: 'researchNotes', label: 'Research Notes' },
];

const emptyActionState: EntryActionState = {};

/**
 * The one metadata form shape for Labs, used by both the create and edit
 * routes — mirrors `BuildForm`/`BlueprintForm`'s structure exactly
 * (CMS_PRODUCT_DESIGN.md §30: "an editor who has created a Work entry
 * already knows how to create a Note"). `graduatedToBuildId` is deliberately
 * absent here — it's a read-only reverse relation set only by the "Graduate
 * to Build" action (§4's collection table), never a field an editor fills in.
 */
export function LabForm({
  action,
  submitLabel,
  initialValues,
  initialHeroAsset,
  initialGalleryAssets,
  technologyOptions,
  buildOptions,
  blueprintOptions,
  contributorOptions,
}: {
  action: (prevState: EntryActionState, formData: FormData) => Promise<EntryActionState>;
  submitLabel: string;
  initialValues?: LabFormValues;
  initialHeroAsset?: MediaAssetDTO;
  initialGalleryAssets?: MediaAssetDTO[];
  technologyOptions: RelationOption[];
  buildOptions: RelationOption[];
  blueprintOptions: RelationOption[];
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
        hint="Lowercase, hyphen-separated — e.g. edge-inference-runtime."
      >
        <Input id="slug" name="slug" defaultValue={initialValues?.slug} required />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Stage"
          name="stage"
          error={state.fieldErrors?.stage}
          hint="Where this research currently sits."
        >
          <select
            id="stage"
            name="stage"
            defaultValue={initialValues?.stage ?? 'exploring'}
            className={fieldClassName}
          >
            <option value="exploring">Exploring</option>
            <option value="building">Building</option>
            <option value="testing">Testing</option>
          </select>
        </Field>

        <Field label="Start date" name="startDate" error={state.fieldErrors?.startDate}>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={initialValues?.startDate}
            required
          />
        </Field>
      </div>

      <Field
        label="Objective"
        name="objective"
        error={state.fieldErrors?.objective}
        hint="What is being explored, and why it exists."
      >
        <textarea
          id="objective"
          name="objective"
          defaultValue={initialValues?.objective}
          rows={3}
          required
          className={fieldClassName}
        />
      </Field>

      <Field
        label="Research direction"
        name="researchDirection"
        error={state.fieldErrors?.researchDirection}
        hint="The current technical approach or direction."
      >
        <textarea
          id="researchDirection"
          name="researchDirection"
          defaultValue={initialValues?.researchDirection}
          rows={3}
          required
          className={fieldClassName}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Current milestone"
          name="currentMilestone"
          error={state.fieldErrors?.currentMilestone}
          hint="The next step actively being worked toward."
        >
          <Input
            id="currentMilestone"
            name="currentMilestone"
            defaultValue={initialValues?.currentMilestone}
            required
          />
        </Field>
        <Field
          label="Last major update"
          name="lastMajorUpdateAt"
          error={state.fieldErrors?.lastMajorUpdateAt}
          hint="Optional — updated deliberately, not on every trivial edit."
        >
          <Input
            id="lastMajorUpdateAt"
            name="lastMajorUpdateAt"
            type="date"
            defaultValue={initialValues?.lastMajorUpdateAt}
          />
        </Field>
      </div>

      <Field
        label="Graduation criteria"
        name="graduationCriteria"
        error={state.fieldErrors?.graduationCriteria}
        hint="What has to be true before this Lab graduates to a Build."
      >
        <textarea
          id="graduationCriteria"
          name="graduationCriteria"
          defaultValue={initialValues?.graduationCriteria}
          rows={3}
          required
          className={fieldClassName}
        />
      </Field>

      <Field
        label="Internal repository URL"
        name="internalRepoUrl"
        error={state.fieldErrors?.internalRepoUrl}
      >
        <Input
          id="internalRepoUrl"
          name="internalRepoUrl"
          type="url"
          defaultValue={initialValues?.internalRepoUrl}
          placeholder="https://…"
          required
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Public repository URL"
          name="publicRepoUrl"
          error={state.fieldErrors?.publicRepoUrl}
          hint="Optional."
        >
          <Input
            id="publicRepoUrl"
            name="publicRepoUrl"
            type="url"
            defaultValue={initialValues?.publicRepoUrl}
            placeholder="https://github.com/…"
          />
        </Field>
        <Field
          label="Live demo URL"
          name="liveDemoUrl"
          error={state.fieldErrors?.liveDemoUrl}
          hint="Optional."
        >
          <Input
            id="liveDemoUrl"
            name="liveDemoUrl"
            type="url"
            defaultValue={initialValues?.liveDemoUrl}
            placeholder="https://…"
          />
        </Field>
      </div>

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
        <MediaPickerField name="heroImageId" initialAsset={initialHeroAsset} folder="labs" />
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
          folder="labs"
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
        label="Progress timeline"
        name="milestones"
        error={state.fieldErrors?.milestones}
        hint="Milestones, in any order — sorted chronologically once saved."
        asFieldset
      >
        <ProgressTimelineField
          name="milestones"
          initialMilestones={initialValues?.milestones}
          documentRoleOptions={LAB_DOCUMENT_ROLE_OPTIONS}
        />
      </Field>

      <Field
        label="Engineering contributors"
        name="contributorProfileIds"
        error={state.fieldErrors?.contributorProfileIds}
        hint="Explicit public credit. Select only Engineering Profiles for people who contributed to this Lab."
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
