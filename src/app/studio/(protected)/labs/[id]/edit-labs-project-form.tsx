"use client";

import { autosaveDraft, update } from "@/actions/studio/labs-projects";
import { CmsEditForm } from "@/components/admin/form/cms-edit-form";
import {
  labsProjectFormFields,
  type LabsProjectInput,
} from "@/lib/cms/collections/labs-project-fields";

export interface EditLabsProjectFormProps {
  id: string;
  initialValues: Partial<LabsProjectInput>;
  isDraft: boolean;
}

export function EditLabsProjectForm({ id, initialValues, isDraft }: EditLabsProjectFormProps) {
  return (
    <CmsEditForm<LabsProjectInput>
      fields={labsProjectFormFields}
      initialValues={initialValues}
      updateAction={update.bind(null, id)}
      autosaveAction={(values) => autosaveDraft(id, values)}
      isDraft={isDraft}
    />
  );
}
