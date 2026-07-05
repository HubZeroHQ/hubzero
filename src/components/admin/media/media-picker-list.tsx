"use client";

import { X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FieldMessage } from "@/components/ui/_field-shell";
import { MediaPickerModal } from "@/components/admin/media/media-picker-modal";
import { MediaThumbnail } from "@/components/admin/media/media-thumbnail";
import { getMediaByIdsAction } from "@/actions/studio/media";
import { useFieldA11y } from "@/lib/use-field-a11y";
import type { ClientMedia } from "@/lib/cms/media";

export interface MediaPickerListProps {
  name: string;
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  /** An ordered list of `Media` `_id`s. */
  value: string[];
  onChange: (value: string[]) => void;
}

/** The `imageArray` field type's control — the multi-image counterpart to `<MediaPicker>`, sharing the same picker modal. */
export function MediaPickerList({
  name,
  label,
  hint,
  error,
  required,
  value,
  onChange,
}: MediaPickerListProps) {
  const [mediaById, setMediaById] = useState<Record<string, ClientMedia>>({});
  const [isPending, startTransition] = useTransition();
  const { fieldId, hintId, errorId } = useFieldA11y({ hint, error });

  useEffect(() => {
    const missing = value.filter((id) => !mediaById[id]);
    if (missing.length === 0) return;
    startTransition(async () => {
      const found = await getMediaByIdsAction(missing);
      setMediaById((prev) => {
        const next = { ...prev };
        for (const item of found) next[item.id] = item;
        return next;
      });
    });
    // Only re-resolve when the id list itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function addMedia(media: ClientMedia) {
    if (value.includes(media.id)) return;
    setMediaById((prev) => ({ ...prev, [media.id]: media }));
    onChange([...value, media.id]);
  }

  function removeMedia(id: string) {
    onChange(value.filter((existing) => existing !== id));
  }

  return (
    <div>
      {label && (
        <Label htmlFor={fieldId} required={required}>
          {label}
        </Label>
      )}
      <div id={fieldId} className="flex flex-wrap gap-3">
        {value.map((id) => (
          <div key={id} className="relative">
            <MediaThumbnail
              media={isPending && !mediaById[id] ? undefined : mediaById[id]}
              className="h-20 w-20"
            />
            <button
              type="button"
              onClick={() => removeMedia(id)}
              aria-label="Remove image"
              className="bg-bg-dark/70 text-bg absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        <MediaPickerModal
          trigger={
            <Button type="button" variant="secondary" size="sm" className="h-20 w-20 rounded-md px-0">
              Add
            </Button>
          }
          onSelect={addMedia}
        />
      </div>
      {value.map((id) => (
        <input key={id} type="hidden" name={name} value={id} />
      ))}
      <FieldMessage hint={hint} hintId={hintId} error={error} errorId={errorId} />
    </div>
  );
}
