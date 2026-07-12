import { Schema, type InferSchemaType, type Types } from "mongoose";

import { defineModel } from "@/models/shared/define-model";
import { draftPublishStatusValues, workflowFields } from "@/models/shared/workflow-fields";

/**
 * `ARCHITECTURE/11_DATABASE_ARCHITECTURE.md` §1's `TeamMember` collection.
 *
 * Two deliberate, documented additions beyond that block's literal fields:
 * - `linkedUserId` (`ARCHITECTURE/19_CMS_FOUNDATION.md` §11: "the `editOwn`
 *   permission needs `TeamMember.linkedUserId`... a small, explicit addition,
 *   not a redesign") — the inverse of `User.linkedTeamMemberId`, and the
 *   field `collection-config.ts`'s `ownerField` reads for this collection so
 *   "edit your own profile" means the teammate the profile belongs to, not
 *   whichever admin created the row during onboarding.
 * - `experience`/`education` item shapes: `11_DATABASE_ARCHITECTURE.md` §1
 *   names these fields (`experience?: ExperienceItem[], education?:
 *   EducationItem[]`) but never defines the two interfaces. The shapes below
 *   are this phase's minimal, reasonable reading — free-text `startDate`/
 *   `endDate` (a resume-style "2022" or "Jan 2022–Present", not a strict
 *   `Date`, since that's how this information is actually written) — flagged
 *   in the Phase D report as an assumption for founder review, not a silent
 *   invention.
 */

const skillGroupSchema = new Schema(
  {
    category: { type: String, required: true, trim: true, maxlength: 80 },
    items: { type: [String], default: [] },
  },
  { _id: false },
);

const socialsSchema = new Schema(
  {
    github: { type: String, trim: true },
    linkedin: { type: String, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 200 },
  },
  { _id: false },
);

const experienceItemSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    organization: { type: String, required: true, trim: true, maxlength: 160 },
    startDate: { type: String, required: true, trim: true, maxlength: 40 },
    endDate: { type: String, trim: true, maxlength: 40 },
    description: { type: String, trim: true, maxlength: 2000 },
  },
  { _id: false },
);

const educationItemSchema = new Schema(
  {
    institution: { type: String, required: true, trim: true, maxlength: 160 },
    degree: { type: String, required: true, trim: true, maxlength: 160 },
    startDate: { type: String, required: true, trim: true, maxlength: 40 },
    endDate: { type: String, trim: true, maxlength: 40 },
  },
  { _id: false },
);

const teamMemberSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 60,
    },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    role: { type: String, required: true, trim: true, maxlength: 120 },
    bio: { type: String, required: true, trim: true, maxlength: 8000 },
    photo: { type: Schema.Types.ObjectId, ref: "Media" },
    skills: { type: [skillGroupSchema], default: [] },
    socials: { type: socialsSchema, required: true },
    isCoreMember: { type: Boolean, required: true, default: false },
    // Defaults to hidden: an incomplete just-onboarded profile shouldn't be
    // public until someone deliberately flips this on, mirroring the
    // draft-by-default posture every other workflow field already has.
    profileVisible: { type: Boolean, required: true, default: false },
    experience: { type: [experienceItemSchema], default: [] },
    education: { type: [educationItemSchema], default: [] },
    linkedUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    ...workflowFields(draftPublishStatusValues),
  },
  { timestamps: true },
);

teamMemberSchema.index({ status: 1, publishedAt: -1 });

export type TeamMemberDocument = InferSchemaType<typeof teamMemberSchema> & { _id: Types.ObjectId };

export const TeamMember = defineModel<TeamMemberDocument>("TeamMember", teamMemberSchema);
