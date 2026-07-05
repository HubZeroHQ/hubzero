import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { passwordSchema } from "@/lib/cms/password";
import { emptyToUndefined } from "@/lib/utils";
import type { UserDocument, UserRole } from "@/models/user";
import type { ClientDocument, FieldOption, FilterConfig, TableColumn } from "@/types/cms";

/**
 * User's Zod validation and table/filter config — kept Mongoose-import-free
 * for the same reason every other collection's `-fields.tsx` module is (see
 * `team-member-fields.tsx`). No `formFields`/`FieldConfig` export here: the
 * Users screen uses bespoke forms (`users/new/user-create-form.tsx`,
 * `users/[id]/user-edit-form.tsx`), not the generic `<CmsForm>`, because a
 * masked password field with a strength rule and an "unchanged unless
 * filled in" edit semantics doesn't fit `FieldConfig`'s fixed vocabulary
 * (`ARCHITECTURE/19_CMS_FOUNDATION.md` §6) — the same reasoning that already
 * gives Lead (the other `workflow: "none"` collection) its own bespoke
 * detail-screen forms instead of `<CmsForm>`.
 */

export type UserRow = ClientDocument<UserDocument>;

export const userRoleOptions: FieldOption[] = [
  { value: "head_admin", label: "Head Admin" },
  { value: "admin", label: "Admin" },
  { value: "teammate", label: "Teammate" },
];

export const userRoleLabels: Record<UserRole, string> = {
  head_admin: "Head Admin",
  admin: "Admin",
  teammate: "Teammate",
};

const userRoleValues = ["head_admin", "admin", "teammate"] as const;

const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Enter an email address.")
  .max(200)
  .pipe(z.email("Enter a valid email address."));

const nameField = z.string().trim().min(1, "Enter a name.").max(120);
const roleField = z.enum(userRoleValues, { error: "Choose a role." });

export const createUserSchema = z.object({
  email: emailField,
  name: nameField,
  role: roleField,
  password: passwordSchema,
});
export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  email: emailField,
  name: nameField,
  role: roleField,
  disabled: z.boolean().default(false),
  // Blank means "leave the password unchanged" — only validated against the
  // strength rule when an editor actually types a new one.
  password: z.preprocess(emptyToUndefined, passwordSchema.optional()),
});
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const userEmptyStateMessage =
  "No users yet. The first Head Admin is created from the command line — see docs/operations/ADMIN_BOOTSTRAP.md — then Admins and Teammates can be added here.";

export const userListColumns: TableColumn<UserRow>[] = [
  { key: "name", label: "Name", sortable: true },
  { key: "email", label: "Email", sortable: true },
  {
    key: "role",
    label: "Role",
    render: (doc) => userRoleLabels[doc.role] ?? doc.role,
  },
  {
    key: "disabled",
    label: "Status",
    render: (doc) =>
      doc.disabled ? <Badge tone="danger">Disabled</Badge> : <Badge tone="success">Active</Badge>,
  },
  {
    key: "createdAt",
    label: "Created",
    sortable: true,
    render: (doc) => (doc.createdAt ? new Date(doc.createdAt).toLocaleDateString("en-US") : "—"),
  },
];

export const userFilters: FilterConfig<UserRow>[] = [
  { name: "role", label: "Role", type: "select", options: userRoleOptions },
];
