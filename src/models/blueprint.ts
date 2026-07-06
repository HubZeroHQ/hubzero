import { Schema, type InferSchemaType, type Types } from "mongoose";

import type { Block } from "@/lib/cms/blocks/types";
import {
  contentField,
  contributorsField,
  featuredField,
  readingTimeField,
  summaryField,
} from "@/models/shared/card-fields";
import { defineModel } from "@/models/shared/define-model";
import { draftReviewPublishStatusValues, workflowFields } from "@/models/shared/workflow-fields";

/**
 * `ARCHITECTURE/11_DATABASE_ARCHITECTURE.md` §1's `Blueprint` collection.
 * `description` and `customizationNotes` — two mandatory/optional markdown
 * fields — are replaced by a single ordered `content: Block[]`
 * (`ARCHITECTURE/20_CONTENT_BLOCKS.md`); `summary` is the new dedicated card
 * blurb. `blueprintId` is a second unique identifier alongside `slug` —
 * "exposed in metadata, never in the URL" — editor-provided like `slug`
 * rather than auto-generated.
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
    ...summaryField(),
    ...contentField(),
    techStack: { type: [String], default: [] },
    coverImage: { type: Schema.Types.ObjectId, ref: "Media" },
    ...contributorsField(),
    ...featuredField(),
    ...readingTimeField(),
    previewUrl: { type: String, trim: true },
    demoDeploymentUrl: { type: String, trim: true },
    demoStatus: { type: String, required: true, enum: demoStatusValues, default: "stale" },
    ...workflowFields(draftReviewPublishStatusValues),
  },
  { timestamps: true },
);

blueprintSchema.index({ status: 1, publishedAt: -1 });

export type BlueprintDocument = Omit<InferSchemaType<typeof blueprintSchema>, "content"> & {
  _id: Types.ObjectId;
  content: Block[];
};

export const Blueprint = defineModel<BlueprintDocument>("Blueprint", blueprintSchema);
