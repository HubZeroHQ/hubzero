"use client";

import { useActionState, useEffect, useMemo, useState } from "react";

import { CmsField } from "@/components/admin/form/cms-field";
import { FormPanel } from "@/components/admin/form/form-panel";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { CrudActionState, FieldConfig } from "@/types/cms";

/**
 * Splits a collection's fields into an ungrouped leading run (rendered flat,
 * exactly as before `group` existed) and named panels, in the order each
 * group name first appears — never alphabetical or a fixed enum, so a
 * collection's own field order fully controls panel order too. A collection
 * that never sets `group` on any field (`Testimonial`, `TeamMember`, `Media`,
 * …) produces one ungrouped run and zero panels, i.e. today's flat form,
 * unchanged.
 */
function groupFields<TInput extends Record<string, unknown>>(
  fields: FieldConfig<TInput>[],
): {
  ungrouped: FieldConfig<TInput>[];
  panels: { title: string; fields: FieldConfig<TInput>[] }[];
} {
  const ungrouped: FieldConfig<TInput>[] = [];
  const panelOrder: string[] = [];
  const panelFields = new Map<string, FieldConfig<TInput>[]>();

  for (const field of fields) {
    if (!field.group) {
      ungrouped.push(field);
      continue;
    }
    if (!panelFields.has(field.group)) {
      panelOrder.push(field.group);
      panelFields.set(field.group, []);
    }
    panelFields.get(field.group)?.push(field);
  }

  return {
    ungrouped,
    panels: panelOrder.map((title) => ({ title, fields: panelFields.get(title) ?? [] })),
  };
}

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
  /** Fired whenever a field changes — the hook a caller wanting to observe live form state (autosave, an unsaved-changes indicator) uses, without `CmsForm` needing to know what autosave is. */
  onValuesChange?: (values: Partial<TInput>) => void;
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
  onValuesChange,
}: CmsFormProps<TInput>) {
  const [values, setValues] = useState<Record<string, unknown>>(() => ({ ...initialValues }));
  const [state, formAction, isPending] = useActionState(action, {
    status: "idle",
  } as CrudActionState<TInput>);

  useEffect(() => {
    if (state.status === "success") onSuccess?.(state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  useEffect(() => {
    onValuesChange?.(values as Partial<TInput>);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values]);

  const { ungrouped, panels } = useMemo(() => groupFields(fields), [fields]);

  function renderField(field: FieldConfig<TInput>) {
    return (
      <CmsField
        key={field.name}
        field={field}
        value={values[field.name]}
        onChange={(value) => setValues((prev) => ({ ...prev, [field.name]: value }))}
        error={state.fieldErrors?.[field.name]}
      />
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      {ungrouped.map(renderField)}

      {panels.map((panel) => (
        <FormPanel key={panel.title} title={panel.title}>
          {panel.fields.map(renderField)}
        </FormPanel>
      ))}

      {state.formError && <Alert variant="danger">{state.formError}</Alert>}

      <Button type="submit" isLoading={isPending}>
        {submitLabel}
      </Button>
    </form>
  );
}
