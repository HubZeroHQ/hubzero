import { Schema, type InferSchemaType, type Types } from "mongoose";

import { practiceAreaValues } from "@/lib/cms/collections/shared-options";
import { defineModel } from "@/models/shared/define-model";
import { draftReviewPublishStatusValues, workflowFields } from "@/models/shared/workflow-fields";

/**
 * `ARCHITECTURE/11_DATABASE_ARCHITECTURE.md` §1's `Build` collection.
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
    description: { type: String, required: true, trim: true, maxlength: 20000 },
    techTags: { type: [String], default: [] },
    coverImage: { type: Schema.Types.ObjectId, ref: "Media" },
    launchDate: { type: Date, required: true },
    liveUrl: { type: String, trim: true },
    repoUrl: { type: String, trim: true },
    graduatedFromLabsId: { type: Schema.Types.ObjectId, ref: "LabsProject" },
    ...workflowFields(draftReviewPublishStatusValues),
  },
  { timestamps: true },
);

buildSchema.index({ status: 1, publishedAt: -1 });

export type BuildDocument = InferSchemaType<typeof buildSchema> & { _id: Types.ObjectId };

export const Build = defineModel<BuildDocument>("Build", buildSchema);
