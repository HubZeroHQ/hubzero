'use client';

import { useId } from 'react';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { createBlockId } from '@/lib/documents/block-ops';
import type { Block } from '@/lib/documents/blocks';
import { RepeatableFieldList } from './RepeatableFieldList';

/**
 * "Images using the existing document model" (Phase 4 brief) — the schema's
 * `mediaId` still exists (`blocks.ts`), but there's no Media Library to pick
 * one from yet (PLANNING.md §33 is a later phase). Rather than asking the
 * author to invent an id, one is generated transparently the first time a
 * URL is entered. Swapping this for a real Media Library picker later is a
 * change to *this* component only — the block's stored shape doesn't move.
 */
export function ImageFields({
  block,
  onChange,
}: {
  block: Extract<Block, { type: 'image' }>;
  onChange: (next: Block) => void;
}) {
  const id = useId();
  const { url, altText, caption, mediaId } = block.data;

  function handleUrlChange(nextUrl: string) {
    onChange({
      ...block,
      data: { ...block.data, url: nextUrl, mediaId: mediaId || createBlockId() },
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <Field label="Image URL" name={`${id}-url`}>
        <Input
          id={`${id}-url`}
          value={url}
          onChange={(event) => handleUrlChange(event.target.value)}
          placeholder="https://…"
        />
      </Field>
      <Field
        label="Alt text"
        name={`${id}-alt`}
        hint="Required — describes the image for screen readers."
      >
        <Input
          id={`${id}-alt`}
          value={altText}
          onChange={(event) =>
            onChange({ ...block, data: { ...block.data, altText: event.target.value } })
          }
          placeholder="Describe the image"
        />
      </Field>
      <Field label="Caption" name={`${id}-caption`}>
        <Input
          id={`${id}-caption`}
          value={caption ?? ''}
          onChange={(event) =>
            onChange({ ...block, data: { ...block.data, caption: event.target.value } })
          }
          placeholder="Optional caption"
        />
      </Field>
    </div>
  );
}

export function ImageGalleryFields({
  block,
  onChange,
}: {
  block: Extract<Block, { type: 'imageGallery' }>;
  onChange: (next: Block) => void;
}) {
  return (
    <RepeatableFieldList<{ mediaId: string; url: string; altText: string }>
      items={block.data.images}
      onChange={(images) => onChange({ ...block, data: { images } })}
      createItem={() => ({ mediaId: '', url: '', altText: '' })}
      addLabel="Add image"
      itemLabel="image"
      minItems={1}
      renderItem={(item, index, update) => (
        <div className="flex flex-col gap-1.5">
          <Input
            value={item.url}
            onChange={(event) =>
              update({
                ...item,
                url: event.target.value,
                mediaId: item.mediaId || createBlockId(),
              })
            }
            placeholder="Image URL"
            aria-label={`Image ${index + 1} URL`}
          />
          <Input
            value={item.altText}
            onChange={(event) => update({ ...item, altText: event.target.value })}
            placeholder="Alt text (required)"
            aria-label={`Image ${index + 1} alt text`}
          />
        </div>
      )}
    />
  );
}
