"use client";

import { create } from "@/actions/studio/testimonials";
import { CmsCreateForm } from "@/components/admin/form/cms-create-form";
import {
  testimonialFormFields,
  type TestimonialInput,
} from "@/lib/cms/collections/testimonial-fields";

export function NewTestimonialForm() {
  return (
    <CmsCreateForm<TestimonialInput>
      fields={testimonialFormFields}
      action={create}
      redirectTo={(id) => `/studio/testimonials/${id}`}
    />
  );
}
