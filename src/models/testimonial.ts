import { Schema, type InferSchemaType, type Types } from "mongoose";

import { defineModel } from "@/models/shared/define-model";
import { draftPublishStatusValues, workflowFields } from "@/models/shared/workflow-fields";

/**
 * `ARCHITECTURE/11_DATABASE_ARCHITECTURE.md` §1's `Testimonial` collection.
 * `name` and `title` are `required` at the schema layer — the structural
 * "reject unattributed entries" constraint that document calls out
 * explicitly, fixing the legacy placeholder-testimonial problem
 * (`ARCHITECTURE/05_CONTENT_STRATEGY.md` §3) at the data layer, not just in
 * a form validator that a direct database write could bypass.
 */
const testimonialSchema = new Schema(
  {
    quote: { type: String, required: true, trim: true, maxlength: 2000 },
    name: { type: String, required: true, trim: true, maxlength: 160 },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    company: { type: String, trim: true, maxlength: 160 },
    linkedCaseStudy: { type: Schema.Types.ObjectId, ref: "CaseStudy" },
    ...workflowFields(draftPublishStatusValues),
  },
  { timestamps: true },
);

testimonialSchema.index({ status: 1, publishedAt: -1 });

export type TestimonialDocument = InferSchemaType<typeof testimonialSchema> & {
  _id: Types.ObjectId;
};

export const Testimonial = defineModel<TestimonialDocument>("Testimonial", testimonialSchema);
