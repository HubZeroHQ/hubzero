"use client";

import { useEffect, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FieldMessage } from "@/components/ui/_field-shell";
import { ReferencePickerModal } from "@/components/admin/form/reference-picker-modal";
import { resolveReferenceOptionsAction } from "@/actions/studio/references";
import { useFieldA11y } from "@/lib/use-field-a11y";
import type { FieldOption, Resource } from "@/types/cms";

export interface ReferencePickerProps {
  name: string;
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  resource: Resource;
  labelField: string;
  /** The referenced document's `_id`, or `undefined` when unset. */
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}

/**
 * The `reference` field type's control (`ARCHITECTURE/19_CMS_FOUNDATION.md`
 * §6) — replaces the raw ID `<Input>` placeholder with a real searchable
 * picker. Renders a hidden `<input>` so the value survives `CmsForm`'s native
 * `<form action={formAction}>` submission, the same contract `<MediaPicker>`
 * already establishes for `image`.
 */
export function ReferencePicker({
  name,
  label,
  hint,
  error,
  required,
  resource,
  labelField,
  value,
  onChange,
}: ReferencePickerProps) {
  const [option, setOption] = useState<FieldOption | null>(null);
  const [isPending, startTransition] = useTransition();
  const { fieldId, hintId, errorId, describedBy } = useFieldA11y({ hint, error });

  useEffect(() => {
    if (!value || option?.value === value) return;
    startTransition(async () => {
      const [resolved] = await resolveReferenceOptionsAction(resource, labelField, [value]);
      setOption(resolved ?? null);
    });
    // Only re-resolve when the stored id itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, resource, labelField]);

  // `value` (not `option`) is the source of truth for whether anything is
  // selected — clearing `value` hides the selected label immediately instead
  // of waiting on the resolve effect, the same reasoning `<MediaPicker>`
  // documents for its own `selected`.
  const selected = value ? option : null;

  // The hidden `<input>` isn't focusable, so `<Label htmlFor>` would be
  // invisible to assistive tech — the real interactive control is the
  // "Choose…" button, associated via `aria-labelledby` instead.
  const labelId = `${fieldId}-label`;

  return (
    <div>
      {label && (
        <Label id={labelId} required={required}>
          {label}
        </Label>
      )}
      <input type="hidden" name={name} value={value ?? ""} />
      <div className="flex flex-wrap items-center gap-3">
        {value && (
          <span className="text-body text-text bg-bg border-border-muted rounded-md border px-3 py-2">
            {isPending && !selected ? "Loading…" : (selected?.label ?? value)}
          </span>
        )}
        <ReferencePickerModal
          resource={resource}
          labelField={labelField}
          trigger={
            <Button
              type="button"
              variant="secondary"
              size="sm"
              aria-labelledby={label ? labelId : undefined}
              aria-describedby={describedBy}
            >
              {value ? "Change" : "Choose…"}
            </Button>
          }
          onSelect={(picked) => {
            setOption(picked);
            onChange(picked.value);
          }}
        />
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setOption(null);
              onChange(undefined);
            }}
          >
            Remove
          </Button>
        )}
      </div>
      <FieldMessage hint={hint} hintId={hintId} error={error} errorId={errorId} />
    </div>
  );
}
