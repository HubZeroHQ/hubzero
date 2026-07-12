"use client";

import { create } from "@/actions/studio/builds";
import { CmsCreateForm } from "@/components/admin/form/cms-create-form";
import { buildFormFields, type BuildInput } from "@/lib/cms/collections/build-fields";

export function NewBuildForm() {
  return (
    <CmsCreateForm<BuildInput>
      fields={buildFormFields}
      action={create}
      redirectTo={(id) => `/studio/builds/${id}`}
    />
  );
}
