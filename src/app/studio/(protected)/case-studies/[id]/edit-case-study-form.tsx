"use client";

import { autosaveDraft, update } from "@/actions/studio/case-studies";
import { CmsEditForm } from "@/components/admin/form/cms-edit-form";
import { caseStudyFormFields, type CaseStudyInput } from "@/lib/cms/collections/case-study-fields";

export interface EditCaseStudyFormProps {
  id: string;
  initialValues: Partial<CaseStudyInput>;
  /** Autosave is a draft-only safety net (`ARCHITECTURE/19_CMS_FOUNDATION.md` §6) — `autosaveDraft` itself also rejects a non-draft server-side, but there's no reason to poll at all once every call could only ever fail. */
  isDraft: boolean;
}

export function EditCaseStudyForm({ id, initialValues, isDraft }: EditCaseStudyFormProps) {
  return (
    <CmsEditForm<CaseStudyInput>
      fields={caseStudyFormFields}
      initialValues={initialValues}
      updateAction={update.bind(null, id)}
      autosaveAction={(values) => autosaveDraft(id, values)}
      isDraft={isDraft}
    />
  );
}
