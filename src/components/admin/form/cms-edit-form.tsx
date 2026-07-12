"use client";

import { useState } from "react";

import { CmsForm } from "@/components/admin/form/cms-form";
import { Text } from "@/components/ui";
import { useAutosave } from "@/hooks/use-autosave";
import type { CrudActionState, FieldConfig } from "@/types/cms";

export interface CmsEditFormProps<TInput extends Record<string, unknown>> {
  fields: FieldConfig<TInput>[];
  initialValues: Partial<TInput>;
  updateAction: (
    prevState: CrudActionState<TInput>,
    formData: FormData,
  ) => Promise<CrudActionState<TInput>>;
  /**
   * Bound to the document's `id` by the caller (`autosaveDraft.bind(null, id)`).
   * Omitted entirely for a collection with no draft to autosave (e.g. a
   * `workflow: "none"` collection reusing this component for its plain edit
   * form) — autosave is then simply not wired up, not a degraded version of it.
   */
  autosaveAction?: (values: Partial<TInput>) => Promise<{ status: "saved" | "error" }>;
  /** Autosave only ever runs against a draft (`ARCHITECTURE/19_CMS_FOUNDATION.md` §6). */
  isDraft: boolean;
  submitLabel?: string;
}

const autosaveStatusLabel: Record<string, string> = {
  saving: "Saving…",
  saved: "Saved",
  error: "Autosave failed — your last manual save is still safe.",
};

/**
 * The "edit" half of `CmsForm`'s two consumers — controlled values state plus
 * the autosave wiring every draft-participating collection needs identically
 * (previously duplicated as `edit-case-study-form.tsx`'s entire body).
 */
export function CmsEditForm<TInput extends Record<string, unknown>>({
  fields,
  initialValues,
  updateAction,
  autosaveAction,
  isDraft,
  submitLabel = "Save changes",
}: CmsEditFormProps<TInput>) {
  const [values, setValues] = useState<Partial<TInput>>(initialValues);
  const autosaveStatus = useAutosave(
    values,
    autosaveAction ?? (async () => ({ status: "saved" as const })),
    { enabled: isDraft && Boolean(autosaveAction) },
  );

  return (
    <div className="flex flex-col gap-3">
      <CmsForm<TInput>
        fields={fields}
        initialValues={initialValues}
        action={updateAction}
        submitLabel={submitLabel}
        onValuesChange={setValues}
      />
      {isDraft && autosaveAction && autosaveStatusLabel[autosaveStatus] && (
        <Text
          size="caption"
          className={autosaveStatus === "error" ? "text-danger" : "text-text-muted"}
        >
          {autosaveStatusLabel[autosaveStatus]}
        </Text>
      )}
    </div>
  );
}
