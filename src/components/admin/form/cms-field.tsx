"use client";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { TagsInput } from "@/components/admin/form/tags-input";
import { MediaPicker } from "@/components/admin/media/media-picker";
import { MediaPickerList } from "@/components/admin/media/media-picker-list";
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
 * `image`/`imageArray` render the real `<MediaPicker>`/`<MediaPickerList>`
 * (Phase E, `ARCHITECTURE/19_CMS_FOUNDATION.md` §8) — the value they hold is
 * a `Media` `_id` (or array of them), never a raw URL string. `reference`
 * still renders as a plain ID input — a searchable picker needs a target
 * collection to search and hasn't landed yet; per §14's own note, that's an
 * additive upgrade later, not a schema or form-config change now.
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
      return (
        <Input
          name={field.name}
          type={field.type === "date" ? "date" : field.type === "url" ? "url" : "text"}
          label={field.label}
          hint={field.description}
          required={field.required}
          placeholder={field.placeholder}
          // A numeric field with no dedicated field type (`types/cms.ts`'s
          // fixed vocabulary has no "number") renders through `text` and is
          // coerced back by the collection's own Zod schema (e.g. FAQ's
          // `order`, `z.coerce.number()`) — `initialValues` for one of these
          // arrives as a real `number`, which still needs to display as text.
          value={typeof value === "string" ? value : typeof value === "number" ? String(value) : ""}
          onChange={(event) => onChange(event.target.value)}
          error={error}
        />
      );

    case "image":
      return (
        <MediaPicker
          name={field.name}
          label={field.label}
          hint={field.description}
          required={field.required}
          value={typeof value === "string" && value.length > 0 ? value : undefined}
          onChange={onChange}
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

    case "json":
      // The escape hatch for a nested array/object shape outside this fixed
      // vocabulary (`types/cms.ts`'s `FieldConfig` doc comment) — a raw-JSON
      // textarea, not a structured repeater UI. `value` arrives as a real
      // array/object on initial load (`ClientDocument` doesn't touch
      // non-Date/ObjectId fields) and as the raw edited string thereafter,
      // since `onChange` only ever emits what the textarea holds.
      return (
        <Textarea
          name={field.name}
          label={`${field.label} (JSON)`}
          hint={field.description ?? "Raw JSON — validated on save."}
          required={field.required}
          placeholder={field.placeholder}
          rows={6}
          value={typeof value === "string" ? value : JSON.stringify(value ?? null, null, 2)}
          onChange={(event) => onChange(event.target.value)}
          error={error}
          className="font-mono"
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
      return (
        <TagsInput
          name={field.name}
          label={field.label}
          hint={field.description}
          required={field.required}
          options={field.options}
          value={Array.isArray(value) ? (value as string[]) : []}
          onChange={onChange}
        />
      );

    case "imageArray":
      return (
        <MediaPickerList
          name={field.name}
          label={field.label}
          hint={field.description}
          required={field.required}
          error={error}
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
