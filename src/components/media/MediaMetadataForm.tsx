'use client';

import { selectClass } from '@/components/documents/editor/fields/shared';
import { EditorForm } from '@/components/studio/editor/EditorForm';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import type { MediaAssetDTO } from '@/lib/media/dto';
import { updateMediaMetadataFormAction } from '@/lib/studio/actions/media';
import { MEDIA_FOLDERS } from '@/lib/validation/media';

/** Media metadata participates in the same dirty/save/failure lifecycle as every other editor. */
export function MediaMetadataForm({ asset }: { asset: MediaAssetDTO }) {
  return (
    <EditorForm
      action={updateMediaMetadataFormAction.bind(null, asset.id)}
      submitLabel="Save changes"
      label="Media metadata"
      id="media-metadata"
      className="gap-3"
    >
      {(state) => (
        <>
          <Field
            label="Alt text"
            name="altText"
            hint="Required — describes the image for screen readers."
            error={state.fieldErrors?.altText}
          >
            <Input id="altText" name="altText" defaultValue={asset.altText} required />
          </Field>
          <Field label="Caption" name="caption">
            <Input id="caption" name="caption" defaultValue={asset.caption ?? ''} />
          </Field>
          <Field label="Credit" name="credit" hint="Photographer, source, or license attribution.">
            <Input id="credit" name="credit" defaultValue={asset.credit ?? ''} />
          </Field>
          <Field label="Folder" name="folder">
            <select id="folder" name="folder" defaultValue={asset.folder} className={selectClass}>
              {MEDIA_FOLDERS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Tags" name="reuseTags" hint="Comma-separated reuse tags.">
            <Input
              id="reuseTags"
              name="reuseTags"
              defaultValue={asset.reuseTags.join(', ')}
              placeholder="hero, dark-mode, product"
            />
          </Field>
        </>
      )}
    </EditorForm>
  );
}
