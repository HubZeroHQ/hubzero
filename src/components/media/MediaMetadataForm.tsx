'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { selectClass } from '@/components/documents/editor/fields/shared';
import type { MediaAssetDTO } from '@/lib/media/dto';
import { updateMediaMetadataAction } from '@/lib/studio/actions/media';
import { MEDIA_FOLDERS } from '@/lib/validation/media';
import type { MediaFolder } from '@/types/studio';

/** Alt text, caption, credit, tags, folder — the editable metadata (Phase 5 brief). File info below is read-only, sourced from Cloudinary. */
export function MediaMetadataForm({ asset }: { asset: MediaAssetDTO }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [altText, setAltText] = useState(asset.altText);
  const [caption, setCaption] = useState(asset.caption ?? '');
  const [credit, setCredit] = useState(asset.credit ?? '');
  const [folder, setFolder] = useState<MediaFolder>(asset.folder);
  const [tagsInput, setTagsInput] = useState(asset.reuseTags.join(', '));
  const [status, setStatus] = useState<{ error?: string; saved?: boolean }>({});

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus({});
    startTransition(async () => {
      const reuseTags = tagsInput
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);

      const result = await updateMediaMetadataAction(asset.id, {
        altText,
        caption: caption.trim() || undefined,
        credit: credit.trim() || undefined,
        folder,
        reuseTags,
      });

      if (result.error) {
        setStatus({ error: result.error });
      } else {
        setStatus({ saved: true });
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Field
        label="Alt text"
        name="altText"
        hint="Required — describes the image for screen readers."
      >
        <Input
          id="altText"
          value={altText}
          onChange={(event) => setAltText(event.target.value)}
          required
        />
      </Field>
      <Field label="Caption" name="caption">
        <Input id="caption" value={caption} onChange={(event) => setCaption(event.target.value)} />
      </Field>
      <Field label="Credit" name="credit" hint="Photographer, source, or license attribution.">
        <Input id="credit" value={credit} onChange={(event) => setCredit(event.target.value)} />
      </Field>
      <Field label="Folder" name="folder">
        <select
          id="folder"
          value={folder}
          onChange={(event) => setFolder(event.target.value as MediaFolder)}
          className={selectClass}
        >
          {MEDIA_FOLDERS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Tags" name="tags" hint="Comma-separated reuse tags.">
        <Input
          id="tags"
          value={tagsInput}
          onChange={(event) => setTagsInput(event.target.value)}
          placeholder="hero, dark-mode, product"
        />
      </Field>

      {status.error ? (
        <p role="alert" className="text-danger text-xs">
          {status.error}
        </p>
      ) : status.saved ? (
        <p className="text-success text-xs">Saved.</p>
      ) : null}

      <Button type="submit" disabled={isPending || !altText.trim()} className="self-start">
        {isPending ? 'Saving…' : 'Save changes'}
      </Button>
    </form>
  );
}
