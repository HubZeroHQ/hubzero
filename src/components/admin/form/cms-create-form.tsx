"use client";

import { useRouter } from "next/navigation";

import { CmsForm } from "@/components/admin/form/cms-form";
import type { CrudActionState, FieldConfig } from "@/types/cms";

export interface CmsCreateFormProps<TInput extends Record<string, unknown>> {
  fields: FieldConfig<TInput>[];
  action: (
    prevState: CrudActionState<TInput>,
    formData: FormData,
  ) => Promise<CrudActionState<TInput>>;
  /** Where to send the editor once the draft exists — almost always the new document's own edit page. */
  redirectTo: (id: string) => string;
  submitLabel?: string;
}

/**
 * The "create" half of `CmsForm`'s two consumers — redirect to the new
 * document's edit page once the draft is created. Identical across every
 * collection (previously duplicated as `new-case-study-form.tsx`'s entire
 * body); extracted once a second collection needed the same three lines of
 * redirect logic.
 */
export function CmsCreateForm<TInput extends Record<string, unknown>>({
  fields,
  action,
  redirectTo,
  submitLabel = "Create draft",
}: CmsCreateFormProps<TInput>) {
  const router = useRouter();

  return (
    <CmsForm<TInput>
      fields={fields}
      action={action}
      submitLabel={submitLabel}
      onSuccess={(state) => {
        if (state.id) router.push(redirectTo(state.id));
      }}
    />
  );
}
