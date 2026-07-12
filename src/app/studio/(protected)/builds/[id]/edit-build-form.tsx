"use client";

import { autosaveDraft, update } from "@/actions/studio/builds";
import { CmsEditForm } from "@/components/admin/form/cms-edit-form";
import { buildFormFields, type BuildInput } from "@/lib/cms/collections/build-fields";

export interface EditBuildFormProps {
  id: string;
  initialValues: Partial<BuildInput>;
  isDraft: boolean;
}

export function EditBuildForm({ id, initialValues, isDraft }: EditBuildFormProps) {
  return (
    <CmsEditForm<BuildInput>
      fields={buildFormFields}
      initialValues={initialValues}
      updateAction={update.bind(null, id)}
      autosaveAction={(values) => autosaveDraft(id, values)}
      isDraft={isDraft}
    />
  );
}
