"use client";

import { autosaveDraft, update } from "@/actions/studio/faqs";
import { CmsEditForm } from "@/components/admin/form/cms-edit-form";
import { faqFormFields, type FaqInput } from "@/lib/cms/collections/faq-fields";

export interface EditFaqFormProps {
  id: string;
  initialValues: Partial<FaqInput>;
  isDraft: boolean;
}

export function EditFaqForm({ id, initialValues, isDraft }: EditFaqFormProps) {
  return (
    <CmsEditForm<FaqInput>
      fields={faqFormFields}
      initialValues={initialValues}
      updateAction={update.bind(null, id)}
      autosaveAction={(values) => autosaveDraft(id, values)}
      isDraft={isDraft}
    />
  );
}
