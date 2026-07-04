import { Schema, type InferSchemaType, type Types } from "mongoose";

import { practiceAreaOptions } from "@/lib/cms/collections/case-study-fields";
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
type PracticeAreaValue = (typeof practiceAreaOptions)[number]["value"];

// Derived from the same `practiceAreaOptions` the form/table config uses
// (`case-study-fields.tsx`) — one enum, not two independently maintained
// copies, matching `lead.ts`'s own `projectTypeValues`-from-`lead-schema.ts`
// pattern. Cast to a literal tuple for the same reason that file documents:
// a widened `string[]` would still satisfy `enum`'s type but silently lose
// the literal-union type `InferSchemaType` derives.
const practiceAreaValues = practiceAreaOptions.map((option) => option.value) as [
  PracticeAreaValue,
  ...PracticeAreaValue[],
];

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
