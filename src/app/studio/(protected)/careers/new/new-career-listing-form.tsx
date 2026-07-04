"use client";

import { create } from "@/actions/studio/career-listings";
import { CmsCreateForm } from "@/components/admin/form/cms-create-form";
import {
  careerListingFormFields,
  type CareerListingInput,
} from "@/lib/cms/collections/career-listing-fields";

export function NewCareerListingForm() {
  return (
    <CmsCreateForm<CareerListingInput>
      fields={careerListingFormFields}
      action={create}
      redirectTo={(id) => `/studio/careers/${id}`}
    />
  );
}
