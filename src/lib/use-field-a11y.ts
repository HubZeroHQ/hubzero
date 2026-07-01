import { useId } from "react";

interface FieldA11yOptions {
  id?: string;
  hint?: string;
  error?: string;
}

/**
 * Shared by every form primitive (Input, Textarea, Select, Checkbox, Radio,
 * Switch) so label/hint/error association is wired up identically
 * everywhere instead of once per component: a stable id, an
 * aria-describedby that only references ids that actually exist, and
 * aria-invalid derived from `error`.
 */
export function useFieldA11y({ id, hint, error }: FieldA11yOptions) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return { fieldId, hintId, errorId, describedBy, invalid: Boolean(error) };
}
