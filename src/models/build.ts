import { Schema, type InferSchemaType, type Types } from "mongoose";

import { practiceAreaValues } from "@/lib/cms/collections/shared-options";
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
 * `ARCHITECTURE/11_DATABASE_ARCHITECTURE.md` §1's `Build` collection.
 * `tagline` already served as the card blurb pre-blocks, so it's kept as-is
 * rather than duplicated by a second `summary` field
 * (`ARCHITECTURE/20_CONTENT_BLOCKS.md` §3). `description` — a single
 * mandatory markdown field — is replaced by ordered `content: Block[]`.
 *
 * `graduatedFromLabsId` is the inverse of `LabsProject.graduatedToBuildId` —
 * deliberately excluded from `build-fields.tsx`'s regular form fields for
 * the identical reason that file documents: it's only ever set by the
 * bespoke "mark as graduated" action (`actions/studio/labs-projects.ts`),
 * which writes both sides of the pair together, never by a direct edit that
 * could set one side without the other.
 */
const buildSchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 80,
    },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    tagline: { type: String, required: true, trim: true, maxlength: 240 },
    practiceArea: { type: String, required: true, enum: practiceAreaValues },
    ...contentField(),
    techTags: { type: [String], default: [] },
    coverImage: { type: Schema.Types.ObjectId, ref: "Media" },
    ...contributorsField(),
    ...featuredField(),
    ...readingTimeField(),
    launchDate: { type: Date, required: true },
    liveUrl: { type: String, trim: true },
    repoUrl: { type: String, trim: true },
    graduatedFromLabsId: { type: Schema.Types.ObjectId, ref: "LabsProject" },
    ...workflowFields(draftReviewPublishStatusValues),
  },
  { timestamps: true },
);

buildSchema.index({ status: 1, publishedAt: -1 });

export type BuildDocument = Omit<InferSchemaType<typeof buildSchema>, "content"> & {
  _id: Types.ObjectId;
  content: Block[];
};

export const Build = defineModel<BuildDocument>("Build", buildSchema);
