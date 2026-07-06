import { Schema, type InferSchemaType, type Types } from "mongoose";

import { practiceAreaValues } from "@/lib/cms/collections/shared-options";
import type { Block } from "@/lib/cms/blocks/types";
import {
  contentField,
  contributorsField,
  featuredField,
  readingTimeField,
  summaryField,
} from "@/models/shared/card-fields";
import { defineModel } from "@/models/shared/define-model";
import { draftPublishStatusValues, workflowFields } from "@/models/shared/workflow-fields";

/**
 * `ARCHITECTURE/11_DATABASE_ARCHITECTURE.md` §1's `LabsProject` collection.
 * `description` — a single mandatory markdown field — is replaced by ordered
 * `content: Block[]` (`ARCHITECTURE/20_CONTENT_BLOCKS.md`); `summary` is the
 * new dedicated card blurb that collection didn't previously have.
 *
 * `isClientWork` is always `false` — "structurally prevents this collection
 * from ever being confused with a real client CaseStudy" — so it's not a
 * form field at all (`labs-project.config.ts`'s `computedFields` injects the
 * constant on every create/update, the same escape hatch Note's
 * `readingTimeMinutes` uses); there is no path by which an editor sets it to
 * `true`. `graduatedToBuildId` is likewise not in the regular edit form —
 * it's only ever set by the bespoke "mark as graduated" action
 * (`actions/studio/labs-projects.ts`), which writes it and
 * `Build.graduatedFromLabsId` together so the pair stays consistent
 * (`ARCHITECTURE/11_DATABASE_ARCHITECTURE.md` §2's bidirectional-validation
 * requirement) — a stray direct edit could otherwise set one side without
 * the other.
 */
const stageValues = ["active", "archived", "graduated"] as const;

const labsProjectSchema = new Schema(
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
    practiceArea: { type: String, required: true, enum: practiceAreaValues },
    ...summaryField(),
    ...contentField(),
    techTags: { type: [String], default: [] },
    coverImage: { type: Schema.Types.ObjectId, ref: "Media" },
    ...contributorsField(),
    ...featuredField(),
    ...readingTimeField(),
    isClientWork: { type: Boolean, required: true, default: false, immutable: true },
    stage: { type: String, required: true, enum: stageValues, default: "active" },
    graduatedToBuildId: { type: Schema.Types.ObjectId, ref: "Build" },
    ...workflowFields(draftPublishStatusValues),
  },
  { timestamps: true },
);

labsProjectSchema.index({ status: 1, publishedAt: -1 });

export type LabsProjectDocument = Omit<InferSchemaType<typeof labsProjectSchema>, "content"> & {
  _id: Types.ObjectId;
  content: Block[];
};

export const LabsProject = defineModel<LabsProjectDocument>("LabsProject", labsProjectSchema);
