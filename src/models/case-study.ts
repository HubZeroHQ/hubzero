import { Schema, type InferSchemaType, type Types } from "mongoose";

import { practiceAreaValues } from "@/lib/cms/collections/shared-options";
import { defineModel } from "@/models/shared/define-model";
import { draftReviewPublishStatusValues, workflowFields } from "@/models/shared/workflow-fields";

/**
 * `ARCHITECTURE/11_DATABASE_ARCHITECTURE.md` §1's `CaseStudy` collection —
 * the Phase B proof collection (`ARCHITECTURE/19_CMS_FOUNDATION.md` §14).
 * `relatedTeamMembers` and the attributed `quote` are deliberately omitted
 * for now: the former can now reference the `TeamMember` model added in
 * Phase D via the `reference` field type, the latter is a nested object
 * needing the `json` field type Phase D introduces for exactly this shape
 * (see `TeamMember.skills`) — both are additive, tracked as remaining work
 * in the Phase D report rather than folded into this pass, since neither
 * requires revisiting the workflow/permission/CRUD engine this collection
 * exists to prove.
 *
 * `practiceAreaValues` is shared with `Build`/`LabsProject`
 * (`lib/cms/collections/shared-options.ts`) — one enum, not three
 * independently maintained copies, matching `lead.ts`'s own
 * `projectTypeValues`-from-`lead-schema.ts` pattern.
 */

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
