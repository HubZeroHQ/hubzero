"use client";

import { useState } from "react";
import type { KeyboardEvent } from "react";

import { Chip } from "@/components/ui/chip";
import { FieldMessage } from "@/components/ui/_field-shell";
import { Label } from "@/components/ui/label";
import { useFieldA11y } from "@/lib/use-field-a11y";
import { cn } from "@/lib/utils";

export interface TagsInputProps {
  name: string;
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  value: string[];
  onChange: (value: string[]) => void;
  /** Free-form tags (tech tags) when omitted; a fixed pick-list when provided. */
  options?: { value: string; label: string }[];
}

/**
 * A tag/multiselect control that submits as a native multi-value field —
 * one hidden `<input>` per tag, so `formData.getAll(name)` (the generic
 * engine's `rawFromFormData`, `crud-actions.ts`) sees it exactly like any
 * other native multi-value form field, no client/server contract beyond
 * "same `name`, multiple values."
 */
export function TagsInput({
  name,
  label,
  hint,
  error,
  required,
  value,
  onChange,
  options,
}: TagsInputProps) {
  const [draft, setDraft] = useState("");
  const { fieldId, hintId, errorId, describedBy, invalid } = useFieldA11y({ hint, error });

  function commit(raw: string) {
    const tag = raw.trim();
    if (!tag || value.includes(tag)) return;
    if (options && !options.some((option) => option.value === tag)) return;
    onChange([...value, tag]);
    setDraft("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commit(draft);
    } else if (event.key === "Backspace" && draft === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div>
      {label && (
        <Label htmlFor={fieldId} required={required}>
          {label}
        </Label>
      )}
      <div
        className={cn(
          "bg-bg border-border flex flex-wrap items-center gap-2 rounded-md border px-3 py-2",
          invalid && "border-danger",
        )}
      >
        {value.map((tag) => (
          <Chip key={tag} onRemove={() => onChange(value.filter((existing) => existing !== tag))}>
            {tag}
          </Chip>
        ))}
        <input
          id={fieldId}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => commit(draft)}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          placeholder={value.length === 0 ? "Type and press Enter" : undefined}
          className="text-body text-text placeholder:text-text-muted min-w-[8ch] flex-1 bg-transparent outline-none"
          list={options ? `${fieldId}-options` : undefined}
        />
        {options && (
          <datalist id={`${fieldId}-options`}>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </datalist>
        )}
      </div>
      {value.map((tag) => (
        <input key={tag} type="hidden" name={name} value={tag} />
      ))}
      <FieldMessage hint={hint} hintId={hintId} error={error} errorId={errorId} />
    </div>
  );
}
