"use client";

import { useState } from "react";

import { autosaveDraft, update } from "@/actions/studio/case-studies";
import { CmsForm } from "@/components/admin/form/cms-form";
import { Text } from "@/components/ui";
import { useAutosave } from "@/hooks/use-autosave";
import { caseStudyFormFields, type CaseStudyInput } from "@/lib/cms/collections/case-study-fields";

export interface EditCaseStudyFormProps {
  id: string;
  initialValues: Partial<CaseStudyInput>;
  /** Autosave is a draft-only safety net (`ARCHITECTURE/19_CMS_FOUNDATION.md` §6) — `autosaveDraft` itself also rejects a non-draft server-side, but there's no reason to poll at all once every call could only ever fail. */
  isDraft: boolean;
}

const autosaveStatusLabel: Record<string, string> = {
  saving: "Saving…",
  saved: "Saved",
  error: "Autosave failed — your last manual save is still safe.",
};

export function EditCaseStudyForm({ id, initialValues, isDraft }: EditCaseStudyFormProps) {
  const [values, setValues] = useState<Partial<CaseStudyInput>>(initialValues);
  const autosaveStatus = useAutosave(values, (value) => autosaveDraft(id, value), {
    enabled: isDraft,
  });

  return (
    <div className="flex flex-col gap-3">
      <CmsForm<CaseStudyInput>
        fields={caseStudyFormFields}
        initialValues={initialValues}
        action={update.bind(null, id)}
        submitLabel="Save changes"
        onValuesChange={setValues}
      />
      {isDraft && autosaveStatusLabel[autosaveStatus] && (
        <Text
          size="caption"
          className={autosaveStatus === "error" ? "text-danger" : "text-text-muted"}
        >
          {autosaveStatusLabel[autosaveStatus]}
        </Text>
      )}
    </div>
  );
}
