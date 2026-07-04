"use client";

import { useRouter } from "next/navigation";

import { create } from "@/actions/studio/case-studies";
import { CmsForm } from "@/components/admin/form/cms-form";
import { caseStudyFormFields, type CaseStudyInput } from "@/lib/cms/collections/case-study-fields";

export function NewCaseStudyForm() {
  const router = useRouter();

  return (
    <CmsForm<CaseStudyInput>
      fields={caseStudyFormFields}
      action={create}
      submitLabel="Create draft"
      onSuccess={(state) => {
        if (state.id) router.push(`/studio/case-studies/${state.id}`);
      }}
    />
  );
}
