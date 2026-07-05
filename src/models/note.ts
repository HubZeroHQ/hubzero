import { Schema, type InferSchemaType, type Types } from "mongoose";

import { defineModel } from "@/models/shared/define-model";
import { draftReviewPublishStatusValues, workflowFields } from "@/models/shared/workflow-fields";

/**
 * `ARCHITECTURE/11_DATABASE_ARCHITECTURE.md` §1's `Note` collection.
 * `readingTimeMinutes` is "computed on save, not author-entered" — not a
 * form field at all, derived by `note.config.ts`'s `computedFields`
 * from `body`'s word count (`ARCHITECTURE/19_CMS_FOUNDATION.md` §11), the
 * same escape hatch TeamMember's `socials` recombination and LabsProject's
 * constant `isClientWork` use.
 */
const noteSchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 160,
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    summary: { type: String, required: true, trim: true, maxlength: 400 },
    body: { type: String, required: true, trim: true, maxlength: 50000 },
    authorId: { type: Schema.Types.ObjectId, ref: "TeamMember", required: true },
    category: { type: String, required: true, trim: true, maxlength: 80 },
    tags: { type: [String], default: [] },
    coverImage: { type: Schema.Types.ObjectId, ref: "Media" },
    readingTimeMinutes: { type: Number, required: true, default: 1 },
    ...workflowFields(draftReviewPublishStatusValues),
  },
  { timestamps: true },
);

noteSchema.index({ status: 1, publishedAt: -1 });

export type NoteDocument = InferSchemaType<typeof noteSchema> & { _id: Types.ObjectId };

export const Note = defineModel<NoteDocument>("Note", noteSchema);
