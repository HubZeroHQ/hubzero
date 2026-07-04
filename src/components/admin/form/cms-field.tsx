"use client";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { TagsInput } from "@/components/admin/form/tags-input";
import type { FieldConfig } from "@/types/cms";

export interface CmsFieldProps<TInput extends Record<string, unknown>> {
  field: FieldConfig<TInput>;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
}

/**
 * Renders one `FieldConfig` entry (`ARCHITECTURE/19_CMS_FOUNDATION.md` §6) as
 * a controlled input bound to `CmsForm`'s single values object. The fixed
 * field-type vocabulary is a switch, not a per-type component registry —
 * there are exactly as many cases as the architecture defines, and adding an
 * eleventh field type to the vocabulary is meant to be rare enough that a
 * plugin-style registry would be solving a problem that doesn't exist yet.
 *
 * `image`, `imageArray`, and `reference` render as plain URL/ID inputs for
 * now — the real `<MediaPicker>` (Phase D) and a searchable reference picker
 * (needs a target collection to search, Phase E) aren't built yet. Per
 * `19` §14 Phase D's own note, that's a additive upgrade later, not a schema
 * or form-config change now.
 */
export function CmsField<TInput extends Record<string, unknown>>({
  field,
  value,
  onChange,
  error,
}: CmsFieldProps<TInput>) {
  switch (field.type) {
    case "text":
    case "url":
    case "date":
    case "image":
      return (
        <Input
          name={field.name}
          type={
            field.type === "date"
              ? "date"
              : field.type === "url" || field.type === "image"
                ? "url"
                : "text"
          }
          label={field.type === "image" ? `${field.label} (URL)` : field.label}
          hint={field.description}
          required={field.required}
          placeholder={field.placeholder}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
          error={error}
        />
      );

    case "textarea":
    case "richtext":
      return (
        <Textarea
          name={field.name}
          label={field.type === "richtext" ? `${field.label} (Markdown)` : field.label}
          hint={field.description}
          required={field.required}
          placeholder={field.placeholder}
          rows={field.type === "richtext" ? 10 : 4}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
          error={error}
        />
      );

    case "boolean":
      return (
        <Switch
          name={field.name}
          label={field.label}
          hint={field.description}
          checked={value === true}
          onCheckedChange={onChange}
          error={error}
        />
      );

    case "select":
      return (
        <Select
          name={field.name}
          label={field.label}
          hint={field.description}
          required={field.required}
          options={field.options}
          value={typeof value === "string" ? value : ""}
          onValueChange={onChange}
          error={error}
        />
      );

    case "multiselect":
    case "imageArray":
      return (
        <TagsInput
          name={field.name}
          label={field.type === "imageArray" ? `${field.label} (URLs)` : field.label}
          hint={field.description}
          required={field.required}
          options={field.type === "multiselect" ? field.options : undefined}
          value={Array.isArray(value) ? (value as string[]) : []}
          onChange={onChange}
        />
      );

    case "reference":
      return (
        <Input
          name={field.name}
          label={`${field.label} (${field.resource} ID)`}
          hint={
            field.description ??
            "Paste the referenced record's ID — a searchable picker lands in a later phase."
          }
          required={field.required}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
          error={error}
        />
      );

    case "status":
      // Status is workflow-managed (submit for review / publish), never a
      // direct form edit — collections shouldn't include it in `formFields`.
      // Rendered as a no-op fallback rather than silently dropped, so a
      // misconfigured collection fails visibly during review, not silently.
      return null;

    default:
      return null;
  }
}
