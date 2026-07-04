"use client";

import { useActionState, useEffect, useState } from "react";

import { CmsField } from "@/components/admin/form/cms-field";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { CrudActionState, FieldConfig } from "@/types/cms";

export interface CmsFormProps<TInput extends Record<string, unknown>> {
  fields: FieldConfig<TInput>[];
  /** `{}` for create, the existing document's editable fields for edit — a prop, not an architectural fork (§6). */
  initialValues?: Partial<TInput>;
  action: (
    prevState: CrudActionState<TInput>,
    formData: FormData,
  ) => Promise<CrudActionState<TInput>>;
  submitLabel?: string;
  /** Called once the action returns `status: "success"` — e.g. redirect to the new document's edit page. */
  onSuccess?: (state: CrudActionState<TInput>) => void;
}

/**
 * One form component for both creating and editing every collection
 * (`ARCHITECTURE/19_CMS_FOUNDATION.md` §6) — driven entirely by
 * `config.formFields`. Values are held in a single controlled object rather
 * than per-field `useState` (the existing `contact-form.tsx` pattern) because
 * the field set here is config-driven, not statically known ahead of time;
 * the reason for controlling them at all is the same as that file documents
 * — `useActionState` resets a form's fields after every action call,
 * including a failed one, and a validation error shouldn't cost someone
 * everything else they'd already filled in.
 */
export function CmsForm<TInput extends Record<string, unknown>>({
  fields,
  initialValues,
  action,
  submitLabel = "Save",
  onSuccess,
}: CmsFormProps<TInput>) {
  const [values, setValues] = useState<Record<string, unknown>>(() => ({ ...initialValues }));
  const [state, formAction, isPending] = useActionState(action, {
    status: "idle",
  } as CrudActionState<TInput>);

  useEffect(() => {
    if (state.status === "success") onSuccess?.(state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="space-y-6">
      {fields.map((field) => (
        <CmsField
          key={field.name}
          field={field}
          value={values[field.name]}
          onChange={(value) => setValues((prev) => ({ ...prev, [field.name]: value }))}
          error={state.fieldErrors?.[field.name]}
        />
      ))}

      {state.formError && <Alert variant="danger">{state.formError}</Alert>}

      <Button type="submit" isLoading={isPending}>
        {submitLabel}
      </Button>
    </form>
  );
}
