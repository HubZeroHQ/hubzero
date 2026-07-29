'use client';

import { ImageOff, X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import type { MediaAssetDTO } from '@/lib/media/dto';
import type { MediaFolder } from '@/types/studio';
import { Button } from '@/components/ui/Button';
import { MediaPicker } from './MediaPicker';

/**
 * A single Cloudinary reference field (a Build/Work "hero image," a Team
 * "portrait") backed by the shared Media Picker — CMS_PRODUCT_DESIGN.md §6:
 * "the Media Library is a first-class searchable picker, reachable from...
 * any field that stores a Cloudinary reference directly." Extracted from
 * Builds' hero image field so the next collection that needs one direct
 * image reference (Work's own `heroImageId`, a Team portrait) reuses this
 * component rather than re-implementing the picker/preview/clear wiring.
 *
 * Submits as a native hidden input under `name` — absent entirely when
 * nothing is selected, matching the rest of the Studio's "an explicitly
 * omitted key clears the field" convention (`lib/db/repository.ts`'s
 * `update()`).
 */
export function MediaPickerField({
  name,
  initialAsset,
  folder = 'general',
}: {
  name: string;
  initialAsset?: MediaAssetDTO;
  folder?: MediaFolder;
}) {
  const [asset, setAsset] = useState<MediaAssetDTO | undefined>(initialAsset);
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      {asset ? (
        <input type="hidden" name={name} value={asset.id} />
      ) : null}

      {asset ? (
        <div className="border-border-default rounded-card flex items-center gap-3 border p-2">
          <div className="bg-surface-default rounded-[4px] relative h-16 w-16 shrink-0 overflow-hidden">
            {asset.width && asset.height ? (
              <Image
                src={asset.url}
                alt={asset.altText}
                fill
                sizes="64px"
                className="object-cover"
              />
            ) : (
              <div className="text-text-muted flex h-full w-full items-center justify-center">
                <ImageOff className="h-5 w-5" aria-hidden />
              </div>
            )}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <p className="text-text-primary truncate text-xs font-medium">
              {asset.originalFilename ?? asset.altText}
            </p>
            <p className="text-text-muted text-xs">{asset.altText}</p>
          </div>
          <Button type="button" variant="ghost" onClick={() => setPickerOpen(true)}>
            Change
          </Button>
          <Button
            type="button"
            variant="ghost"
            aria-label="Remove image"
            onClick={() => setAsset(undefined)}
          >
            <X className="h-3.5 w-3.5" aria-hidden />
          </Button>
        </div>
      ) : (
        <Button type="button" variant="secondary" onClick={() => setPickerOpen(true)} className="self-start">
          Choose image
        </Button>
      )}

      <MediaPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={setAsset}
        defaultFolder={folder}
      />
    </div>
  );
}
