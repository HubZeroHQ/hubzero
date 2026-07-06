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
import { draftReviewPublishStatusValues, workflowFields } from "@/models/shared/workflow-fields";

/**
 * `ARCHITECTURE/11_DATABASE_ARCHITECTURE.md` §1's `CaseStudy` collection —
 * the Phase B proof collection (`ARCHITECTURE/19_CMS_FOUNDATION.md` §14).
 *
 * `problem`/`approach`/`result` — three mandatory markdown fields forcing
 * every case study into the same narrative shape — are replaced by a single
 * ordered `content: Block[]` (`ARCHITECTURE/20_CONTENT_BLOCKS.md`): the
 * author decides the story, the CMS only supplies the building blocks.
 * `summary`/`featured`/`readingTimeMinutes`/`contributors` are the card
 * metadata and team-relationship additions the same evolution introduces —
 * see that document §3-4 for why each earns its place.
 *
 * The attributed `quote` field remains deliberately deferred (unchanged from
 * the original Phase B note) — a nested object needing the `json` field
 * type, tracked as remaining work, not folded into this pass.
 *
 * `practiceAreaValues` is shared with `Build`/`LabsProject`
 * (`lib/cms/collections/shared-options.ts`).
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
    ...summaryField(),
    ...contentField(),
    techTags: { type: [String], default: [] },
    coverImage: { type: Schema.Types.ObjectId, ref: "Media" },
    ...contributorsField(),
    ...featuredField(),
    ...readingTimeField(),
    ...workflowFields(draftReviewPublishStatusValues),
  },
  { timestamps: true },
);

caseStudySchema.index({ status: 1, publishedAt: -1 });
caseStudySchema.index({ status: 1, featured: 1, publishedAt: -1 });

export type CaseStudyDocument = Omit<InferSchemaType<typeof caseStudySchema>, "content"> & {
  _id: Types.ObjectId;
  content: Block[];
};

export const CaseStudy = defineModel<CaseStudyDocument>("CaseStudy", caseStudySchema);
