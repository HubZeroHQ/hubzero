"use client";

import { create } from "@/actions/studio/blueprints";
import { CmsCreateForm } from "@/components/admin/form/cms-create-form";
import { blueprintFormFields, type BlueprintInput } from "@/lib/cms/collections/blueprint-fields";

export function NewBlueprintForm() {
  return (
    <CmsCreateForm<BlueprintInput>
      fields={blueprintFormFields}
      action={create}
      redirectTo={(id) => `/studio/blueprints/${id}`}
    />
  );
}
