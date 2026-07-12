import { Schema, type InferSchemaType, type Types } from "mongoose";

import type { Block } from "@/lib/cms/blocks/types";
import {
  contentField,
  contributorsField,
  featuredField,
  readingTimeField,
} from "@/models/shared/card-fields";
import { defineModel } from "@/models/shared/define-model";
import { draftReviewPublishStatusValues, workflowFields } from "@/models/shared/workflow-fields";

/**
 * `ARCHITECTURE/11_DATABASE_ARCHITECTURE.md` §1's `Note` collection. `body` —
 * a single mandatory markdown field — is replaced by ordered
 * `content: Block[]` (`ARCHITECTURE/20_CONTENT_BLOCKS.md`); `summary`
 * already existed as the dedicated card blurb, unchanged. `readingTimeMinutes`
 * remains "computed on save, not author-entered" — `note.config.ts`'s
 * `computedFields` now derives it from `content`'s word count
 * (`lib/cms/blocks/text.ts`) instead of `body`'s.
 *
 * `authorId` (a single required `TeamMember` reference) remains the
 * collection's primary-author field; `contributors` is the new, optional,
 * additional-people relationship every narrative collection gains.
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
    ...contentField(),
    authorId: { type: Schema.Types.ObjectId, ref: "TeamMember", required: true },
    ...contributorsField(),
    category: { type: String, required: true, trim: true, maxlength: 80 },
    tags: { type: [String], default: [] },
    coverImage: { type: Schema.Types.ObjectId, ref: "Media" },
    ...featuredField(),
    ...readingTimeField(),
    ...workflowFields(draftReviewPublishStatusValues),
  },
  { timestamps: true },
);

noteSchema.index({ status: 1, publishedAt: -1 });

export type NoteDocument = Omit<InferSchemaType<typeof noteSchema>, "content"> & {
  _id: Types.ObjectId;
  content: Block[];
};

export const Note = defineModel<NoteDocument>("Note", noteSchema);
