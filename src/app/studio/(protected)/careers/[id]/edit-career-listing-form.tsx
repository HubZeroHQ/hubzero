"use client";

import { autosaveDraft, update } from "@/actions/studio/career-listings";
import { CmsEditForm } from "@/components/admin/form/cms-edit-form";
import {
  careerListingFormFields,
  type CareerListingInput,
} from "@/lib/cms/collections/career-listing-fields";

export interface EditCareerListingFormProps {
  id: string;
  initialValues: Partial<CareerListingInput>;
  isDraft: boolean;
}

export function EditCareerListingForm({ id, initialValues, isDraft }: EditCareerListingFormProps) {
  return (
    <CmsEditForm<CareerListingInput>
      fields={careerListingFormFields}
      initialValues={initialValues}
      updateAction={update.bind(null, id)}
      autosaveAction={(values) => autosaveDraft(id, values)}
      isDraft={isDraft}
    />
  );
}
