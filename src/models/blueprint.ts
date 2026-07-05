import { Schema, type InferSchemaType, type Types } from "mongoose";

import { defineModel } from "@/models/shared/define-model";
import { draftReviewPublishStatusValues, workflowFields } from "@/models/shared/workflow-fields";

/**
 * `ARCHITECTURE/11_DATABASE_ARCHITECTURE.md` §1's `Blueprint` collection.
 * `blueprintId` is a second unique identifier alongside `slug` — "exposed in
 * metadata, never in the URL" — editor-provided like `slug` rather than
 * auto-generated, since `11` specifies its shape and uniqueness but not a
 * generation scheme, and inventing one isn't this phase's call to make.
 */
const demoStatusValues = ["live", "stale", "retired"] as const;

const blueprintSchema = new Schema(
  {
    blueprintId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 60,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 80,
    },
    name: { type: String, required: true, trim: true, maxlength: 160 },
    category: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, required: true, trim: true, maxlength: 20000 },
    techStack: { type: [String], default: [] },
    coverImage: { type: Schema.Types.ObjectId, ref: "Media" },
    previewUrl: { type: String, trim: true },
    demoDeploymentUrl: { type: String, trim: true },
    customizationNotes: { type: String, trim: true, maxlength: 20000 },
    demoStatus: { type: String, required: true, enum: demoStatusValues, default: "stale" },
    ...workflowFields(draftReviewPublishStatusValues),
  },
  { timestamps: true },
);

blueprintSchema.index({ status: 1, publishedAt: -1 });

export type BlueprintDocument = InferSchemaType<typeof blueprintSchema> & { _id: Types.ObjectId };

export const Blueprint = defineModel<BlueprintDocument>("Blueprint", blueprintSchema);
