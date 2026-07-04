import { Schema, type InferSchemaType, type Types } from "mongoose";

import { defineModel } from "@/models/shared/define-model";
import { draftReviewPublishStatusValues, workflowFields } from "@/models/shared/workflow-fields";

/**
 * `ARCHITECTURE/11_DATABASE_ARCHITECTURE.md` §1's `CaseStudy` collection —
 * the Phase B proof collection (`ARCHITECTURE/19_CMS_FOUNDATION.md` §14).
 * `relatedTeamMembers` and the attributed `quote` are deliberately omitted
 * for now: the former needs a `TeamMember` model that doesn't exist until
 * Phase E, the latter is a nested object outside the fixed field-type
 * vocabulary (§6) this phase's form engine renders. Both are additive —
 * neither requires revisiting the workflow/permission/CRUD engine this
 * collection exists to prove.
 */
const practiceAreaValues = ["software", "hardware", "both", "ai"] as const;

const caseStudySchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 80,
    },
    client: { type: String, required: true, trim: true, maxlength: 160 },
    industry: { type: String, required: true, trim: true, maxlength: 160 },
    practiceArea: { type: String, required: true, enum: practiceAreaValues },
    problem: { type: String, required: true, trim: true, maxlength: 20000 },
    approach: { type: String, required: true, trim: true, maxlength: 20000 },
    result: { type: String, required: true, trim: true, maxlength: 20000 },
    techTags: { type: [String], default: [] },
    coverImage: { type: String, trim: true },
    ...workflowFields(draftReviewPublishStatusValues),
  },
  { timestamps: true },
);

caseStudySchema.index({ status: 1, publishedAt: -1 });

export type CaseStudyDocument = InferSchemaType<typeof caseStudySchema> & { _id: Types.ObjectId };

export const CaseStudy = defineModel<CaseStudyDocument>("CaseStudy", caseStudySchema);
