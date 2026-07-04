import {
  testimonialEmptyStateMessage,
  testimonialFilters,
  testimonialFormFields,
  testimonialListColumns,
  testimonialSchema,
  type TestimonialInput,
} from "@/lib/cms/collections/testimonial-fields";
import { defineCollection, registerCollection } from "@/lib/cms/collection-config";
import { Testimonial, type TestimonialDocument } from "@/models/testimonial";

export const testimonialConfig = registerCollection(
  defineCollection<TestimonialDocument, TestimonialInput>({
    resource: "testimonial",
    label: "Testimonials",
    model: Testimonial,
    zodSchema: testimonialSchema,
    workflow: "draft-publish",
    listColumns: testimonialListColumns,
    filters: testimonialFilters,
    formFields: testimonialFormFields,
    searchableFields: ["name", "title", "company"],
    emptyStateMessage: testimonialEmptyStateMessage,
    studioBasePath: "testimonials",
    recordLabel: (doc) => doc.name,
    // No public page reads Testimonials yet — nothing to revalidate until
    // one does (same reasoning as `team-member.config.ts`).
    revalidatesPaths: () => [],
  }),
);
