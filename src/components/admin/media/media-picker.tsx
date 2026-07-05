"use client";

import { useEffect, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FieldMessage } from "@/components/ui/_field-shell";
import { MediaPickerModal } from "@/components/admin/media/media-picker-modal";
import { MediaThumbnail } from "@/components/admin/media/media-thumbnail";
import { getMediaByIdAction } from "@/actions/studio/media";
import { useFieldA11y } from "@/lib/use-field-a11y";
import type { ClientMedia } from "@/lib/cms/media";

export interface MediaPickerProps {
  name: string;
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  /** A `Media` `_id`, or `undefined` when unset. */
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}

/**
 * The `image` field type's control (`ARCHITECTURE/19_CMS_FOUNDATION.md` §6,
 * §8) — replaces the raw URL `<Input>` placeholder with the real picker.
 * Renders a hidden `<input>` so the value survives `CmsForm`'s native
 * `<form action={formAction}>` submission (`crud-actions.ts`'s
 * `rawFromFormData` reads it by `name`), the same contract `<TagsInput>`
 * already establishes for `multiselect`.
 */
export function MediaPicker({ name, label, hint, error, required, value, onChange }: MediaPickerProps) {
  const [media, setMedia] = useState<ClientMedia | null>(null);
  const [isPending, startTransition] = useTransition();
  const { fieldId, hintId, errorId, describedBy } = useFieldA11y({ hint, error });

  useEffect(() => {
    if (!value || media?.id === value) return;
    startTransition(async () => {
      setMedia(await getMediaByIdAction(value));
    });
    // Only re-resolve when the stored id itself changes — re-running this
    // every time `media` updates would refetch the record it just set.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // `value` (not `media`) is the source of truth for whether anything is
  // selected — `media` only ever fills in the *display details* once the
  // fetch above resolves, so clearing `value` hides the thumbnail
  // immediately instead of waiting on a state update inside the effect.
  const selected = value ? media : null;

  return (
    <div>
      {label && (
        <Label htmlFor={fieldId} required={required}>
          {label}
        </Label>
      )}
      <input type="hidden" id={fieldId} name={name} value={value ?? ""} aria-describedby={describedBy} />
      <div className="flex items-center gap-3">
        <MediaThumbnail media={isPending ? undefined : selected} className="h-20 w-20 shrink-0" />
        <div className="flex flex-col gap-2">
          <MediaPickerModal
            trigger={
              <Button type="button" variant="secondary" size="sm">
                {selected ? "Change image" : "Choose image"}
              </Button>
            }
            onSelect={(picked) => {
              setMedia(picked);
              onChange(picked.id);
            }}
          />
          {selected && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setMedia(null);
                onChange(undefined);
              }}
            >
              Remove
            </Button>
          )}
        </div>
      </div>
      <FieldMessage hint={hint} hintId={hintId} error={error} errorId={errorId} />
    </div>
  );
}
