"use client";

import { create } from "@/actions/studio/case-studies";
import { CmsCreateForm } from "@/components/admin/form/cms-create-form";
import { caseStudyFormFields, type CaseStudyInput } from "@/lib/cms/collections/case-study-fields";

export function NewCaseStudyForm() {
  return (
    <CmsCreateForm<CaseStudyInput>
      fields={caseStudyFormFields}
      action={create}
      redirectTo={(id) => `/studio/case-studies/${id}`}
    />
  );
}
