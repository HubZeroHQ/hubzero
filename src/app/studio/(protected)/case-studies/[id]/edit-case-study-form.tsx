"use client";

import { update } from "@/actions/studio/case-studies";
import { CmsForm } from "@/components/admin/form/cms-form";
import { caseStudyFormFields, type CaseStudyInput } from "@/lib/cms/collections/case-study-fields";

export interface EditCaseStudyFormProps {
  id: string;
  initialValues: Partial<CaseStudyInput>;
}

export function EditCaseStudyForm({ id, initialValues }: EditCaseStudyFormProps) {
  return (
    <CmsForm<CaseStudyInput>
      fields={caseStudyFormFields}
      initialValues={initialValues}
      action={update.bind(null, id)}
      submitLabel="Save changes"
    />
  );
}
