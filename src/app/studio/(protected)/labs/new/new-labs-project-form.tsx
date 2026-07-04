"use client";

import { create } from "@/actions/studio/labs-projects";
import { CmsCreateForm } from "@/components/admin/form/cms-create-form";
import {
  labsProjectFormFields,
  type LabsProjectInput,
} from "@/lib/cms/collections/labs-project-fields";

export function NewLabsProjectForm() {
  return (
    <CmsCreateForm<LabsProjectInput>
      fields={labsProjectFormFields}
      action={create}
      redirectTo={(id) => `/studio/labs/${id}`}
    />
  );
}
