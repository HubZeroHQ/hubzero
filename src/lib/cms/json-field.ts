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
 */
export function jsonArray<Item extends z.ZodTypeAny>(itemSchema: Item) {
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
    .pipe(z.array(itemSchema));
}
