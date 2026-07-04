"use client";

import { autosaveDraft, update } from "@/actions/studio/blueprints";
import { CmsEditForm } from "@/components/admin/form/cms-edit-form";
import { blueprintFormFields, type BlueprintInput } from "@/lib/cms/collections/blueprint-fields";

export interface EditBlueprintFormProps {
  id: string;
  initialValues: Partial<BlueprintInput>;
  isDraft: boolean;
}

export function EditBlueprintForm({ id, initialValues, isDraft }: EditBlueprintFormProps) {
  return (
    <CmsEditForm<BlueprintInput>
      fields={blueprintFormFields}
      initialValues={initialValues}
      updateAction={update.bind(null, id)}
      autosaveAction={(values) => autosaveDraft(id, values)}
      isDraft={isDraft}
    />
  );
}
