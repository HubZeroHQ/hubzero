'use client';

import { ImageOff } from 'lucide-react';
import { useId, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { MediaPicker } from '@/components/media/MediaPicker';
import type { MediaAssetDTO } from '@/lib/media/dto';
import type { Block } from '@/lib/documents/blocks';
import { RepeatableFieldList } from './RepeatableFieldList';

/**
 * Image blocks now select assets from the Media Library (Phase 5) rather
 * than a raw URL text field — the temporary flow this replaced
 * (`createBlockId()` standing in for a real `mediaId`) is gone; every image
 * block's `mediaId` is now a real `MediaAsset._id`. The block's own
 * `altText`/`caption` stay independent, editable fields — a single asset
 * can read differently in different placements, so choosing an asset seeds
 * (never locks) the block's alt text from the asset's stored alt text.
 */
function assetToBlockImage(asset: MediaAssetDTO) {
  return {
    mediaId: asset.id,
    url: asset.url,
    width: asset.width,
    height: asset.height,
  };
}

export function ImageFields({
  block,
  onChange,
}: {
  block: Extract<Block, { type: 'image' }>;
  onChange: (next: Block) => void;
}) {
  const id = useId();
  const [pickerOpen, setPickerOpen] = useState(false);
  const { url, altText, caption, mediaId } = block.data;

  function handleSelect(asset: MediaAssetDTO) {
    onChange({
      ...block,
      data: {
        ...block.data,
        ...assetToBlockImage(asset),
        altText: altText || asset.altText,
      },
    });
  }

  function handleRemove() {
    onChange({
      ...block,
      data: { ...block.data, mediaId: '', url: '', width: undefined, height: undefined },
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="bg-surface-default border-border-muted relative h-20 w-20 shrink-0 overflow-hidden rounded-[4px] border">
          {url ? (
            // Editor-only preview thumbnail — plain `<img>` deliberately, so it
            // never depends on the source being a next/image-configured host.
            // The public BlockRenderer output is the one that matters for
            // optimization and only ever uses next/image once dimensions are known.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="text-text-muted flex h-full w-full items-center justify-center">
              <ImageOff className="h-4 w-4" aria-hidden />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Button type="button" variant="secondary" onClick={() => setPickerOpen(true)}>
            {mediaId ? 'Replace image' : 'Choose from Media Library'}
          </Button>
          {mediaId ? (
            <Button type="button" variant="ghost" onClick={handleRemove}>
              Remove
            </Button>
          ) : null}
        </div>
      </div>

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

      <MediaPicker open={pickerOpen} onOpenChange={setPickerOpen} onSelect={handleSelect} />
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
  const [pickerTargetIndex, setPickerTargetIndex] = useState<number | null>(null);

  function handleSelect(asset: MediaAssetDTO) {
    if (pickerTargetIndex === null) {
      return;
    }
    const images = block.data.images.map((image, index) =>
      index === pickerTargetIndex
        ? { ...image, ...assetToBlockImage(asset), altText: image.altText || asset.altText }
        : image,
    );
    onChange({ ...block, data: { images } });
    setPickerTargetIndex(null);
  }

  return (
    <>
      <RepeatableFieldList<{
        mediaId: string;
        url: string;
        altText: string;
        width?: number;
        height?: number;
      }>
        items={block.data.images}
        onChange={(images) => onChange({ ...block, data: { images } })}
        createItem={() => ({ mediaId: '', url: '', altText: '' })}
        addLabel="Add image"
        itemLabel="image"
        minItems={1}
        renderItem={(item, index, update) => (
          <div className="flex items-start gap-3">
            <div className="bg-surface-default border-border-muted relative h-16 w-16 shrink-0 overflow-hidden rounded-[4px] border">
              {item.url ? (
                // eslint-disable-next-line @next/next/no-img-element -- see the single-image editor preview above
                <img src={item.url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="text-text-muted flex h-full w-full items-center justify-center">
                  <ImageOff className="h-4 w-4" aria-hidden />
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <Button type="button" variant="secondary" onClick={() => setPickerTargetIndex(index)}>
                {item.mediaId ? 'Replace' : 'Choose image'}
              </Button>
              <Input
                value={item.altText}
                onChange={(event) => update({ ...item, altText: event.target.value })}
                placeholder="Alt text (required)"
                aria-label={`Image ${index + 1} alt text`}
              />
            </div>
          </div>
        )}
      />

      <MediaPicker
        open={pickerTargetIndex !== null}
        onOpenChange={(open) => !open && setPickerTargetIndex(null)}
        onSelect={handleSelect}
      />
    </>
  );
}
