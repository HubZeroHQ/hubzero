'use client';

import { EditorForm } from '@/components/studio/editor/EditorForm';
import { MediaPickerField } from '@/components/media/MediaPickerField';
import { SocialLinksField } from '@/components/studio/team/SocialLinksField';
import { Field } from '@/components/ui/Field';
import { fieldClassName, Input } from '@/components/ui/Input';
import type { EntryActionState } from '@/lib/studio/entry-actions';
import type { MediaAssetDTO } from '@/lib/media/dto';

export interface TeamFormValues {
  name: string;
  role: string;
  bio: string;
  group: string;
  order: number;
  founder: boolean;
  publicCategory: 'leadership' | 'team';
  engineeringProfileEligible: boolean;
  joinedAt?: string;
  publicProfile: boolean;
  socialLinks: { platform: string; url: string }[];
}

export function TeamForm({
  action,
  submitLabel,
  initialValues,
  initialPortrait,
}: {
  action: (prevState: EntryActionState, formData: FormData) => Promise<EntryActionState>;
  submitLabel: string;
  initialValues?: TeamFormValues;
  initialPortrait?: MediaAssetDTO;
}) {
  return (
    <EditorForm
      action={action}
      submitLabel={submitLabel}
      label="Team member metadata"
      className="max-w-2xl"
    >
      {(state) => (
        <>
          <Field label="Name" name="name" error={state.fieldErrors?.name}>
            <Input id="name" name="name" defaultValue={initialValues?.name} required />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Role"
              name="role"
              error={state.fieldErrors?.role}
              hint="e.g. Founder, Engineer."
            >
              <Input id="role" name="role" defaultValue={initialValues?.role} required />
            </Field>
            <Field
              label="Group"
              name="group"
              error={state.fieldErrors?.group}
              hint='e.g. "Founders", "Engineering Team" — adjustable, not a fixed list.'
            >
              <Input
                id="group"
                name="group"
                defaultValue={initialValues?.group ?? 'Founders'}
                required
              />
            </Field>
          </div>

          <Field label="Bio" name="bio" error={state.fieldErrors?.bio}>
            <textarea
              id="bio"
              name="bio"
              defaultValue={initialValues?.bio}
              rows={4}
              required
              className={fieldClassName}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Order"
              name="order"
              error={state.fieldErrors?.order}
              hint="Lower numbers sort first within a group."
            >
              <Input
                id="order"
                name="order"
                type="number"
                defaultValue={initialValues?.order ?? 0}
                className="max-w-[120px]"
              />
            </Field>
            <Field
              label="Joined date"
              name="joinedAt"
              error={state.fieldErrors?.joinedAt}
              hint="Optional — shown only on the compact Engineering Team card."
            >
              <Input
                id="joinedAt"
                name="joinedAt"
                type="date"
                defaultValue={initialValues?.joinedAt}
              />
            </Field>
          </div>

          <Field
            label="Public category"
            name="publicCategory"
            error={state.fieldErrors?.publicCategory}
            hint="Which About-page section this person appears in — independent of the Founder flag below."
          >
            <select
              id="publicCategory"
              name="publicCategory"
              defaultValue={initialValues?.publicCategory ?? 'team'}
              className={fieldClassName}
            >
              <option value="leadership">Leadership</option>
              <option value="team">Engineering Team</option>
            </select>
          </Field>

          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="founder"
                defaultChecked={initialValues?.founder}
                className="accent-accent"
              />
              <span className="text-text-secondary">
                Founder — a permanent historical fact, independent of Public category.
              </span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="engineeringProfileEligible"
                defaultChecked={initialValues?.engineeringProfileEligible}
                className="accent-accent"
              />
              <span className="text-text-secondary">Eligible for an Engineering Profile</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="publicProfile"
                defaultChecked={initialValues?.publicProfile}
                className="accent-accent"
              />
              <span className="text-text-secondary">Visible on the public site</span>
            </label>
          </div>

          <Field
            label="Portrait"
            name="portraitId"
            error={state.fieldErrors?.portraitId}
            asFieldset
          >
            <MediaPickerField name="portraitId" initialAsset={initialPortrait} folder="team" />
          </Field>

          <Field
            label="Social links"
            name="socialLinks"
            error={state.fieldErrors?.socialLinks}
            asFieldset
          >
            <SocialLinksField name="socialLinks" initialValues={initialValues?.socialLinks} />
          </Field>
        </>
      )}
    </EditorForm>
  );
}
