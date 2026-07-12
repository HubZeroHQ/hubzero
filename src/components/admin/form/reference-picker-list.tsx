"use client";

import { useEffect, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Label } from "@/components/ui/label";
import { FieldMessage } from "@/components/ui/_field-shell";
import { ReferencePickerModal } from "@/components/admin/form/reference-picker-modal";
import { resolveReferenceOptionsAction } from "@/actions/studio/references";
import { useFieldA11y } from "@/lib/use-field-a11y";
import type { FieldOption, Resource } from "@/types/cms";

export interface ReferencePickerListProps {
  name: string;
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  resource: Resource;
  labelField: string;
  /** An ordered list of the referenced collection's `_id`s. */
  value: string[];
  onChange: (value: string[]) => void;
}

/** The `referenceArray` field type's control — the multi-reference counterpart to `<ReferencePicker>`, sharing the same picker modal, the same relationship `<MediaPickerList>` has to `<MediaPicker>`. */
export function ReferencePickerList({
  name,
  label,
  hint,
  error,
  required,
  resource,
  labelField,
  value,
  onChange,
}: ReferencePickerListProps) {
  const [optionsById, setOptionsById] = useState<Record<string, FieldOption>>({});
  const [isPending, startTransition] = useTransition();
  const { fieldId, hintId, errorId } = useFieldA11y({ hint, error });

  useEffect(() => {
    const missing = value.filter((id) => !optionsById[id]);
    if (missing.length === 0) return;
    startTransition(async () => {
      const found = await resolveReferenceOptionsAction(resource, labelField, missing);
      setOptionsById((prev) => {
        const next = { ...prev };
        for (const item of found) next[item.value] = item;
        return next;
      });
    });
    // Only re-resolve when the id list itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, resource, labelField]);

  function add(option: FieldOption) {
    if (value.includes(option.value)) return;
    setOptionsById((prev) => ({ ...prev, [option.value]: option }));
    onChange([...value, option.value]);
  }

  function removeOne(id: string) {
    onChange(value.filter((existing) => existing !== id));
  }

  // Same reasoning as `<ReferencePicker>`: `fieldId` names a plain,
  // non-focusable `<div>` here, so the label associates with the "Add"
  // button via `aria-labelledby` instead of `htmlFor`.
  const labelId = `${fieldId}-label`;

  return (
    <div>
      {label && (
        <Label id={labelId} required={required}>
          {label}
        </Label>
      )}
      <div id={fieldId} className="flex flex-wrap items-center gap-2">
        {value.map((id) => (
          <Chip key={id} onRemove={() => removeOne(id)}>
            {optionsById[id]?.label ?? (isPending ? "Loading…" : id)}
          </Chip>
        ))}
        <ReferencePickerModal
          resource={resource}
          labelField={labelField}
          excludeIds={value}
          trigger={
            <Button
              type="button"
              variant="secondary"
              size="sm"
              aria-labelledby={label ? labelId : undefined}
            >
              Add
            </Button>
          }
          onSelect={add}
        />
      </div>
      {value.map((id) => (
        <input key={id} type="hidden" name={name} value={id} />
      ))}
      <FieldMessage hint={hint} hintId={hintId} error={error} errorId={errorId} />
    </div>
  );
}
