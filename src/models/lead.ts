import { Schema, model, models, type InferSchemaType } from "mongoose";

import { budgetRangeOptions, projectTypeOptions } from "@/lib/lead-schema";

const projectTypeValues = projectTypeOptions.map((option) => option.value);
const budgetRangeValues = budgetRangeOptions.map((option) => option.value);
const leadStatusValues = ["new", "contacted", "closed"] as const;

/**
 * `ARCHITECTURE/11_DATABASE_ARCHITECTURE.md` §1's `Lead` collection —
 * system-generated (contact form submissions), not authored through a CMS
 * editor, so this schema is deliberately smaller than the versioned,
 * workflow-driven collections (`status: draft/review/published`) the future
 * CMS will introduce for authored content. `status` here tracks the admin
 * team's follow-up state (new/contacted/closed, §1), not a publish workflow.
 * First collection in the app to persist to MongoDB — the model layout here
 * (`src/models/<collection>.ts`, one file per collection) is the pattern the
 * CMS's future collections (CaseStudy, TeamMember, etc.) can extend.
 */
const leadSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 200 },
    company: { type: String, trim: true, maxlength: 160 },
    projectType: { type: String, required: true, enum: projectTypeValues },
    budgetRange: { type: String, enum: budgetRangeValues },
    message: { type: String, required: true, trim: true, maxlength: 4000 },
    sourcePage: { type: String, required: true },
    status: { type: String, required: true, enum: leadStatusValues, default: "new" },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// Per `11_DATABASE_ARCHITECTURE.md` §5 — supports the (future) admin lead inbox's
// "newest first" query. Not consumed by anything in this session's scope.
leadSchema.index({ status: 1, createdAt: -1 });

export type LeadDocument = InferSchemaType<typeof leadSchema>;

// `models.Lead` guards against Mongoose's "OverwriteModelError" across dev hot-reloads.
export const Lead = models.Lead ?? model("Lead", leadSchema);
