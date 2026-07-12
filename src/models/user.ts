import { Schema, type InferSchemaType, type Types } from "mongoose";

import { defineModel } from "@/models/shared/define-model";

/**
 * `ARCHITECTURE/11_DATABASE_ARCHITECTURE.md` §1's `User` collection — admin
 * panel accounts, distinct from `TeamMember` ("not every TeamMember has a
 * login"). `role` is the responsibility-based RBAC tier
 * (`ARCHITECTURE/09_CMS_ARCHITECTURE.md` §4); `dynamicPermissions` are
 * additive grants layered on top (e.g. `"team_lead"`) per
 * `ARCHITECTURE/19_CMS_FOUNDATION.md` §3 — both are read by the (Phase B)
 * `can()` permission engine, not consumed by anything in this phase beyond
 * being present on the session.
 *
 * `sessionVersion` is the JWT-revocation mechanism (`19` §2): bumping it
 * invalidates every JWT already issued for this user without needing a
 * database-backed session store. Bumped on password change and available for
 * a future "sign this user out everywhere" Head Admin action.
 */
const userRoleValues = ["head_admin", "admin", "teammate"] as const;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 200,
    },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true, enum: userRoleValues, default: "teammate" },
    dynamicPermissions: { type: [String], default: [] },
    linkedTeamMemberId: { type: Schema.Types.ObjectId, ref: "TeamMember" },
    sessionVersion: { type: Number, required: true, default: 0 },
    /**
     * A disabled account is blocked at login (`auth.ts`'s `authorize()`) but
     * its data/history is retained — the Users screen's "disable" action
     * (`ARCHITECTURE/12_ADMIN_PANEL_SPECIFICATION.md` §2), distinct from a
     * hard delete. Disabling also bumps `sessionVersion` so an already-active
     * session is killed immediately, not just blocked on the next login.
     */
    disabled: { type: Boolean, required: true, default: false },
  },
  { timestamps: true },
);

export type UserRole = (typeof userRoleValues)[number];
export type UserDocument = InferSchemaType<typeof userSchema> & { _id: Types.ObjectId };

export const User = defineModel<UserDocument>("User", userSchema);
