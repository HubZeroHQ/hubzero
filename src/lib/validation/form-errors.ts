import type { z } from 'zod';

/**
 * Turns a `ZodError` into a flat `{ field: message }` map a form can render
 * next to each input. The only existing form (`LoginForm`) has just one
 * flat error string because it has one field; every collection create/edit
 * form has many, so this is the one place that translation happens instead
 * of each form re-deriving it from `error.issues` by hand.
 */
export function zodErrorToFieldErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_root';
    if (!fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }

    // A form only ever renders one error slot per top-level field (e.g.
    // `technologyIds`), not one per array index — so an issue nested inside
    // an array/object (`technologyIds.0`) also registers under its
    // top-level key, or the field's error would silently never render even
    // though `error` is non-empty.
    const topLevelKey = issue.path[0];
    if (typeof topLevelKey === 'string' && !fieldErrors[topLevelKey]) {
      fieldErrors[topLevelKey] = issue.message;
    }
  }
  return fieldErrors;
}
