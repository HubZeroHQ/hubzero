'use client';

import { EditorForm } from '@/components/studio/editor/EditorForm';
import { RelationMultiSelect } from '@/components/studio/collection/RelationMultiSelect';
import { Field } from '@/components/ui/Field';
import { fieldClassName, Input } from '@/components/ui/Input';
import type { EmploymentType, ExperienceLevel } from '@/types/studio';
import type { EntryActionState } from '@/lib/studio/entry-actions';

export interface CareerFormValues {
  title: string;
  slug: string;
  location: string;
  employmentType: EmploymentType;
  experienceLevel: ExperienceLevel;
  summary: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  compensation?: string;
  applicationProcess: string;
  technologyIds: string[];
  hiringManagerTeamId?: string;
  relatedWorkIds: string[];
  relatedBuildIds: string[];
  relatedLabIds: string[];
  relatedNoteIds: string[];
}

interface RelationOption {
  id: string;
  label: string;
  referenceId?: string;
}

const EMPLOYMENT_TYPE_LABEL: Record<EmploymentType, string> = {
  fullTime: 'Full-time',
  partTime: 'Part-time',
  contract: 'Contract',
  internship: 'Internship',
};

const EXPERIENCE_LEVEL_LABEL: Record<ExperienceLevel, string> = {
  entry: 'Entry',
  mid: 'Mid',
  senior: 'Senior',
  lead: 'Lead',
};

/**
 * The one metadata form shape for Careers, used by both the create and edit
 * routes — mirrors `NoteForm`/`BlueprintForm`'s single-Document structure
 * (CMS_PRODUCT_DESIGN.md §30). No hero/gallery fields (`types/studio.ts`'s
 * `Career` doc comment: a role isn't a visual artifact). `responsibilities`/
 * `requirements`/`benefits` are one-item-per-line textareas, the same
 * plain-text-list pattern as Blueprint's `features`.
 */
export function CareerForm({
  action,
  submitLabel,
  initialValues,
  technologyOptions,
  hiringManagerOptions,
  workOptions,
  buildOptions,
  labOptions,
  noteOptions,
}: {
  action: (prevState: EntryActionState, formData: FormData) => Promise<EntryActionState>;
  submitLabel: string;
  initialValues?: CareerFormValues;
  technologyOptions: RelationOption[];
  hiringManagerOptions: RelationOption[];
  workOptions: RelationOption[];
  buildOptions: RelationOption[];
  labOptions: RelationOption[];
  noteOptions: RelationOption[];
}) {
  return (
    <EditorForm
      action={action}
      submitLabel={submitLabel}
      label="Career metadata"
      className="max-w-2xl"
    >
      {(state) => (
        <>
          <Field label="Title" name="title" error={state.fieldErrors?.title}>
            <Input id="title" name="title" defaultValue={initialValues?.title} required />
          </Field>

          <Field
            label="Slug"
            name="slug"
            error={state.fieldErrors?.slug}
            hint="Lowercase, hyphen-separated — e.g. senior-full-stack-engineer."
          >
            <Input id="slug" name="slug" defaultValue={initialValues?.slug} required />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Location" name="location" error={state.fieldErrors?.location}>
              <Input
                id="location"
                name="location"
                defaultValue={initialValues?.location}
                required
              />
            </Field>
            <Field
              label="Employment type"
              name="employmentType"
              error={state.fieldErrors?.employmentType}
            >
              <select
                id="employmentType"
                name="employmentType"
                defaultValue={initialValues?.employmentType ?? ''}
                className={fieldClassName}
                required
              >
                <option value="" disabled>
                  Select…
                </option>
                {(Object.keys(EMPLOYMENT_TYPE_LABEL) as EmploymentType[]).map((value) => (
                  <option key={value} value={value}>
                    {EMPLOYMENT_TYPE_LABEL[value]}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label="Experience level"
              name="experienceLevel"
              error={state.fieldErrors?.experienceLevel}
            >
              <select
                id="experienceLevel"
                name="experienceLevel"
                defaultValue={initialValues?.experienceLevel ?? ''}
                className={fieldClassName}
                required
              >
                <option value="" disabled>
                  Select…
                </option>
                {(Object.keys(EXPERIENCE_LEVEL_LABEL) as ExperienceLevel[]).map((value) => (
                  <option key={value} value={value}>
                    {EXPERIENCE_LEVEL_LABEL[value]}
                  </option>
                ))}
              </select>
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

          <Field
            label="Responsibilities"
            name="responsibilities"
            error={state.fieldErrors?.responsibilities}
            hint="One responsibility per line."
          >
            <textarea
              id="responsibilities"
              name="responsibilities"
              defaultValue={initialValues?.responsibilities.join('\n')}
              rows={4}
              className={fieldClassName}
            />
          </Field>

          <Field
            label="Requirements"
            name="requirements"
            error={state.fieldErrors?.requirements}
            hint="One requirement per line."
          >
            <textarea
              id="requirements"
              name="requirements"
              defaultValue={initialValues?.requirements.join('\n')}
              rows={4}
              className={fieldClassName}
            />
          </Field>

          <Field
            label="Benefits"
            name="benefits"
            error={state.fieldErrors?.benefits}
            hint="One benefit per line."
          >
            <textarea
              id="benefits"
              name="benefits"
              defaultValue={initialValues?.benefits.join('\n')}
              rows={4}
              className={fieldClassName}
            />
          </Field>

          <Field
            label="Compensation"
            name="compensation"
            error={state.fieldErrors?.compensation}
            hint="Optional — not every role has settled compensation yet."
          >
            <Input
              id="compensation"
              name="compensation"
              defaultValue={initialValues?.compensation}
            />
          </Field>

          <Field
            label="Application process"
            name="applicationProcess"
            error={state.fieldErrors?.applicationProcess}
            hint="Stated plainly — a visitor should always find how to apply without reading the full narrative first."
          >
            <textarea
              id="applicationProcess"
              name="applicationProcess"
              defaultValue={initialValues?.applicationProcess}
              rows={3}
              required
              className={fieldClassName}
            />
          </Field>

          <Field
            label="Hiring manager"
            name="hiringManagerTeamId"
            error={state.fieldErrors?.hiringManagerTeamId}
            hint="Optional — a role may be drafted before a hiring manager is assigned."
          >
            <select
              id="hiringManagerTeamId"
              name="hiringManagerTeamId"
              defaultValue={initialValues?.hiringManagerTeamId ?? ''}
              className={fieldClassName}
            >
              <option value="">None yet</option>
              {hiringManagerOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
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
            label="Related Notes"
            name="relatedNoteIds"
            error={state.fieldErrors?.relatedNoteIds}
            asFieldset
          >
            <RelationMultiSelect
              name="relatedNoteIds"
              options={noteOptions}
              selectedIds={initialValues?.relatedNoteIds ?? []}
              emptyMessage="No Notes exist yet."
            />
          </Field>
        </>
      )}
    </EditorForm>
  );
}
