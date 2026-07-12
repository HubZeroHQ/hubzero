import { Schema, type InferSchemaType, type Types } from "mongoose";

import { defineModel } from "@/models/shared/define-model";
import { draftPublishStatusValues, workflowFields } from "@/models/shared/workflow-fields";

/** `ARCHITECTURE/11_DATABASE_ARCHITECTURE.md` §1's `FAQ` collection. `order` is a plain number, sorted ascending on the public FAQ page once it ships — not part of the fixed `FieldConfig` vocabulary (`types/cms.ts` has no numeric field type), so the form renders it as `text` and `faqSchema` coerces it (`z.coerce.number()`), the same "no new field type for one field" discipline that kept `json` to only the shapes that genuinely needed it. */
const faqSchema = new Schema(
  {
    question: { type: String, required: true, trim: true, maxlength: 300 },
    answer: { type: String, required: true, trim: true, maxlength: 8000 },
    category: { type: String, required: true, trim: true, maxlength: 80 },
    order: { type: Number, required: true, default: 0 },
    ...workflowFields(draftPublishStatusValues),
  },
  { timestamps: true },
);

faqSchema.index({ status: 1, publishedAt: -1 });
faqSchema.index({ category: 1, order: 1 });

export type FaqDocument = InferSchemaType<typeof faqSchema> & { _id: Types.ObjectId };

export const Faq = defineModel<FaqDocument>("Faq", faqSchema);
