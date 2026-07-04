"use client";

import { create } from "@/actions/studio/faqs";
import { CmsCreateForm } from "@/components/admin/form/cms-create-form";
import { faqFormFields, type FaqInput } from "@/lib/cms/collections/faq-fields";

export function NewFaqForm() {
  return (
    <CmsCreateForm<FaqInput>
      fields={faqFormFields}
      action={create}
      redirectTo={(id) => `/studio/faqs/${id}`}
    />
  );
}
