import { z } from "zod";

/**
 * The Zod half of the `"json"` field-type escape hatch (`types/cms.ts`'s
 * `FieldConfig` doc comment) — parses a `json` field's raw textarea string
 * into a typed array. Shared across every collection that needs a
 * structured, variable-length field (`TeamMember.skills`/`experience`/
 * `education` today; any future collection with the same shape reuses this
 * instead of writing its own parse-and-validate glue).
 *
 * Treats the literal string `"null"` — what an untouched field submits,
 * since `CmsField`'s `json` case stringifies `value ?? null` for display —
 * the same as an empty array, not a validation error: a brand-new draft
 * with no skills/experience entered yet is valid, not broken.
 *
 * `maxItems` is applied to the array schema itself before the pipe, not
 * chained after `jsonArray(...)` returns — the returned `ZodPipe` has no
 * `.max()` of its own (only a plain `ZodArray` does), so a caller needing a
 * cap (e.g. `SiteSettings.homepageItems`) passes it here instead.
 */
export function jsonArray<Item extends z.ZodTypeAny>(itemSchema: Item, maxItems?: number) {
  const arraySchema = maxItems ? z.array(itemSchema).max(maxItems) : z.array(itemSchema);
  return z
    .string()
    .transform((raw, ctx) => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        ctx.addIssue({ code: "custom", message: "Must be valid JSON." });
        return z.NEVER;
      }
      return parsed ?? [];
    })
    .pipe(arraySchema);
}
