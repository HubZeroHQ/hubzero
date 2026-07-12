import { Schema, type InferSchemaType, type Types } from "mongoose";

import { budgetRangeOptions, projectTypeOptions } from "@/lib/lead-schema";
import { defineModel } from "@/models/shared/define-model";

const projectTypeValues = projectTypeOptions.map((option) => option.value);
const budgetRangeValues = budgetRangeOptions.map((option) => option.value);
/**
 * `"archived"` (Phase F — better leads) reuses this same triage-status field
 * rather than a parallel `archivedAt` flag, mirroring `workflow-fields.ts`'s
 * `"archived"` status for authored content — `archiveLead`/`restoreLead`
 * (`actions/studio/leads.ts`) are both just `updateLeadStatus` calls, the
 * identical "restoring lands on a sensible default state, not whatever it
 * was before" rule `restoreArchive` already established for documents,
 * applied here (restore always lands on `"new"`).
 */
const leadStatusValues = ["new", "contacted", "closed", "archived"] as const;
const leadPriorityValues = ["low", "medium", "high"] as const;

/**
 * `type: "note"` entries are authored directly by an editor; `"status_change"`
 * and `"assignment"` entries are written automatically by the Server Actions
 * that make those changes (`actions/studio/leads.ts`) — one embedded array
 * covers both the "timeline" and "notes" requirements from the CMS Foundation
 * Phase G brief rather than two separate mechanisms, since a note is, in
 * effect, just one more kind of timeline entry. Embedded rather than a
 * separate top-level collection: this history belongs to exactly one Lead,
 * is never queried across Leads, and is the same "small nested array" shape
 * `TeamMember.experience`/`education` already use in this codebase.
 */
const leadActivityTypeValues = ["note", "status_change", "assignment"] as const;

const leadActivitySchema = new Schema(
  {
    type: { type: String, required: true, enum: leadActivityTypeValues },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    actorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    at: { type: Date, required: true, default: Date.now },
  },
  { _id: false },
);

/**
 * `ARCHITECTURE/11_DATABASE_ARCHITECTURE.md` §1's `Lead` collection —
 * system-generated (contact form submissions), not authored through a CMS
 * editor, so this schema is deliberately smaller than the versioned,
 * workflow-driven collections (`status: draft/review/published`) the future
 * CMS will introduce for authored content. `status` here tracks the admin
 * team's follow-up state (new/contacted/closed, §1), not a publish workflow.
 *
 * `assignedTo` and `timeline` are additive beyond `11`'s literal block —
 * CMS Foundation Phase G's explicit brief ("assignment-ready architecture",
 * "timeline", "notes if architecture naturally supports them"), flagged here
 * rather than silently invented. `assignedTo` references `User` (not
 * `TeamMember`): assignment is about who in `/studio` acts on a lead, and
 * only `User` accounts hold the `lead: edit` permission that makes acting on
 * one possible — a `TeamMember` may have no linked login at all (`11`'s own
 * "not every TeamMember has a login" note).
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
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", default: null },
    timeline: { type: [leadActivitySchema], default: [] },
    // Phase F additions — internal triage metadata, never submitted through
    // the public contact form (`lib/lead-schema.ts` deliberately doesn't
    // grow these fields; they exist only from `/studio` onward).
    priority: { type: String, enum: leadPriorityValues, default: "medium" },
    internalLabels: { type: [String], default: [] },
    reminderAt: { type: Date, default: null },
    estimatedValue: { type: Number, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: true } },
);

// Per `11_DATABASE_ARCHITECTURE.md` §5 — supports the admin lead inbox's
// "newest first" query (`lib/cms/collections/lead-fields.tsx`).
leadSchema.index({ status: 1, createdAt: -1 });

export type LeadDocument = InferSchemaType<typeof leadSchema> & { _id: Types.ObjectId };

export const Lead = defineModel<LeadDocument>("Lead", leadSchema);
