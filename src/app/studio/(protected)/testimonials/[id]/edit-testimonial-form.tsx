"use client";

import { autosaveDraft, update } from "@/actions/studio/testimonials";
import { CmsEditForm } from "@/components/admin/form/cms-edit-form";
import {
  testimonialFormFields,
  type TestimonialInput,
} from "@/lib/cms/collections/testimonial-fields";

export interface EditTestimonialFormProps {
  id: string;
  initialValues: Partial<TestimonialInput>;
  isDraft: boolean;
}

export function EditTestimonialForm({ id, initialValues, isDraft }: EditTestimonialFormProps) {
  return (
    <CmsEditForm<TestimonialInput>
      fields={testimonialFormFields}
      initialValues={initialValues}
      updateAction={update.bind(null, id)}
      autosaveAction={(values) => autosaveDraft(id, values)}
      isDraft={isDraft}
    />
  );
}
