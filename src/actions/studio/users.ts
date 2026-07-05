"use server";

import bcrypt from "bcryptjs";
import { Types } from "mongoose";

import {
  createUserSchema,
  updateUserSchema,
  type CreateUserInput,
  type UpdateUserInput,
} from "@/lib/cms/collections/user-fields";
import { userConfig } from "@/lib/cms/collections/user.config";
import { createCrudActions, flattenZodErrors } from "@/lib/cms/crud-actions";
import { connectToDatabase } from "@/lib/db";
import { PASSWORD_HASH_COST } from "@/lib/cms/password";
import { requirePermission } from "@/lib/cms/permissions";
import { User } from "@/models/user";
import type { CrudActionState } from "@/types/cms";

/**
 * Users management (`ARCHITECTURE/12_ADMIN_PANEL_SPECIFICATION.md` §2,
 * Head-Admin-only). `list`/`getOne`/`remove` are the generic engine's, reused
 * as-is (`remove`'s `deleteGuard` on `userConfig` already blocks deleting the
 * last Head Admin). `createUser`/`updateUser` are bespoke — password hashing,
 * duplicate-email handling, and the last-Head-Admin role-safety checks below
 * don't fit the generic `create()`/`update()` shape, the same reason Lead's
 * detail screen (the other `workflow: "none"` collection) has its own
 * bespoke actions instead of `createCrudActions()`'s generic ones.
 */
const { list, getOne, remove } = createCrudActions(userConfig);
export { list, getOne, remove };

function rawFromFormData(formData: FormData): Record<string, unknown> {
  return {
    email: formData.get("email"),
    name: formData.get("name"),
    role: formData.get("role"),
    password: formData.get("password"),
    disabled: formData.get("disabled") === "on",
  };
}

async function countOtherHeadAdmins(excludeId: string): Promise<number> {
  return User.countDocuments({ role: "head_admin", _id: { $ne: excludeId } });
}

export async function createUser(
  _prevState: CrudActionState<CreateUserInput>,
  formData: FormData,
): Promise<CrudActionState<CreateUserInput>> {
  await requirePermission("manageUsers", "user");
  await connectToDatabase();

  const parsed = createUserSchema.safeParse(rawFromFormData(formData));
  if (!parsed.success) {
    return { status: "error", fieldErrors: flattenZodErrors<CreateUserInput>(parsed.error) };
  }

  const existing = await User.findOne({ email: parsed.data.email }).select("_id").lean();
  if (existing) {
    return {
      status: "error",
      fieldErrors: { email: "A user with this email already exists." },
    };
  }

  try {
    const passwordHash = await bcrypt.hash(parsed.data.password, PASSWORD_HASH_COST);
    const user = await User.create({
      email: parsed.data.email,
      name: parsed.data.name,
      role: parsed.data.role,
      passwordHash,
    });
    return { status: "success", id: user._id.toString() };
  } catch (error) {
    console.error("Failed to create user:", error);
    return { status: "error", formError: "Something went wrong while saving. Please try again." };
  }
}

export async function updateUser(
  id: string,
  _prevState: CrudActionState<UpdateUserInput>,
  formData: FormData,
): Promise<CrudActionState<UpdateUserInput>> {
  await requirePermission("manageUsers", "user");
  await connectToDatabase();

  if (!Types.ObjectId.isValid(id)) return { status: "error", formError: "Not found." };
  const existing = await User.findById(id);
  if (!existing) return { status: "error", formError: "Not found." };

  const parsed = updateUserSchema.safeParse(rawFromFormData(formData));
  if (!parsed.success) {
    return { status: "error", fieldErrors: flattenZodErrors<UpdateUserInput>(parsed.error) };
  }

  if (parsed.data.email !== existing.email) {
    const emailTaken = await User.findOne({ email: parsed.data.email, _id: { $ne: id } })
      .select("_id")
      .lean();
    if (emailTaken) {
      return {
        status: "error",
        fieldErrors: { email: "A user with this email already exists." },
      };
    }
  }

  // Never leave the system with zero Head Admins — covers both "someone
  // else demotes/disables the last Head Admin" and "a Head Admin
  // accidentally removes their own role/access while they're the last one"
  // (`ARCHITECTURE/12_ADMIN_PANEL_SPECIFICATION.md` §2 and this session's
  // brief), since the check doesn't care who the signed-in actor is.
  const isDemotingFromHeadAdmin =
    existing.role === "head_admin" && parsed.data.role !== "head_admin";
  const isDisablingHeadAdmin =
    existing.role === "head_admin" && parsed.data.disabled && !existing.disabled;
  if (isDemotingFromHeadAdmin || isDisablingHeadAdmin) {
    const otherHeadAdmins = await countOtherHeadAdmins(id);
    if (otherHeadAdmins === 0) {
      return {
        status: "error",
        formError: isDemotingFromHeadAdmin
          ? "Cannot change this user's role — they are the last remaining Head Admin."
          : "Cannot disable this user — they are the last remaining Head Admin.",
      };
    }
  }

  const roleChanged = parsed.data.role !== existing.role;
  const disabledChanged = parsed.data.disabled !== existing.disabled;
  const passwordChanged = Boolean(parsed.data.password);

  existing.email = parsed.data.email;
  existing.name = parsed.data.name;
  existing.role = parsed.data.role;
  existing.disabled = parsed.data.disabled;
  if (parsed.data.password) {
    existing.passwordHash = await bcrypt.hash(parsed.data.password, PASSWORD_HASH_COST);
  }
  // Force re-authentication wherever this account is already signed in
  // (`ARCHITECTURE/19_CMS_FOUNDATION.md` §2's revocation mechanism) whenever
  // something security-relevant about the account just changed.
  if (roleChanged || disabledChanged || passwordChanged) {
    existing.sessionVersion += 1;
  }

  try {
    await existing.save();
    return { status: "success", id };
  } catch (error) {
    console.error(`Failed to update user ${id}:`, error);
    return { status: "error", formError: "Something went wrong while saving. Please try again." };
  }
}
