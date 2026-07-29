'use client';

import { ImageOff, X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import type { MediaAssetDTO } from '@/lib/media/dto';
import type { MediaFolder } from '@/types/studio';
import { Button } from '@/components/ui/Button';
import { MediaPicker } from './MediaPicker';

/**
 * A multi-image Cloudinary reference field (a Build's gallery/screenshots,
 * §10) — the ordered-array sibling of `MediaPickerField`. Selected assets
 * submit as repeated hidden inputs sharing one `name`, the same native
 * multi-value pattern `RelationMultiSelect`'s checkboxes already use
 * (`formData.getAll(name)`), so this needs no client-side form-state
 * library to participate in the Studio's plain `<form action>` convention.
 */
export function MediaGalleryField({
  name,
  initialAssets = [],
  folder = 'general',
}: {
  name: string;
  initialAssets?: MediaAssetDTO[];
  folder?: MediaFolder;
}) {
  const [assets, setAssets] = useState<MediaAssetDTO[]>(initialAssets);
  const [pickerOpen, setPickerOpen] = useState(false);

  function handleSelect(asset: MediaAssetDTO) {
    setAssets((prev) => (prev.some((entry) => entry.id === asset.id) ? prev : [...prev, asset]));
  }

  function handleRemove(id: string) {
    setAssets((prev) => prev.filter((entry) => entry.id !== id));
  }

  return (
    <div className="flex flex-col gap-3">
      {assets.map((asset) => (
        <input key={asset.id} type="hidden" name={name} value={asset.id} />
      ))}

      {assets.length === 0 ? (
        <p className="text-text-muted text-sm">No gallery images yet.</p>
      ) : (
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))' }}
        >
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="border-border-default rounded-card group relative aspect-square overflow-hidden border"
            >
              {asset.width && asset.height ? (
                <Image
                  src={asset.url}
                  alt={asset.altText}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              ) : (
                <div className="text-text-muted flex h-full w-full items-center justify-center">
                  <ImageOff className="h-5 w-5" aria-hidden />
                </div>
              )}
              <button
                type="button"
                aria-label={`Remove ${asset.altText}`}
                onClick={() => handleRemove(asset.id)}
                className="bg-surface-overlay text-text-primary hover:bg-danger/80 duration-fast ease-standard absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
              >
                <X className="h-3 w-3" aria-hidden />
              </button>
            </div>
          ))}
        </div>
      )}

      <Button type="button" variant="secondary" onClick={() => setPickerOpen(true)} className="self-start">
        Add image
      </Button>

      <MediaPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={handleSelect}
        defaultFolder={folder}
      />
    </div>
  );
}
