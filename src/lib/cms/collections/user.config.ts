import {
  updateUserSchema,
  userEmptyStateMessage,
  userFilters,
  userListColumns,
  type UpdateUserInput,
} from "@/lib/cms/collections/user-fields";
import { defineCollection, registerCollection } from "@/lib/cms/collection-config";
import { connectToDatabase } from "@/lib/db";
import { User, type UserDocument } from "@/models/user";

/**
 * `workflow: "none"` — Users have no draft/publish lifecycle, the same tier
 * as Lead (`ARCHITECTURE/19_CMS_FOUNDATION.md` §12). Registering this
 * collection is what lets the Users screen reuse the generic `list()`/
 * `getOne()`/`remove()` (cursor pagination, filter/search wiring, the
 * `<DataTable>`) for free — `create`/`update` are deliberately *not*
 * exported from `createCrudActions()` here (see `actions/studio/users.ts`);
 * `formFields` is empty for the same reason.
 *
 * `deleteGuard` is the sanctioned extension point
 * (`collection-config.ts`'s own doc comment) for "never leave the system
 * with zero Head Admins" — `ARCHITECTURE/12_ADMIN_PANEL_SPECIFICATION.md` §2
 * and this session's brief both require it, and it's exactly the kind of
 * referential-integrity check `deleteGuard` exists for, just checked against
 * a role count instead of another collection's foreign key.
 */
export const userConfig = registerCollection(
  defineCollection<UserDocument, UpdateUserInput>({
    resource: "user",
    label: "Users",
    model: User,
    zodSchema: updateUserSchema,
    workflow: "none",
    listColumns: userListColumns,
    filters: userFilters,
    formFields: [],
    searchableFields: ["name", "email"],
    emptyStateMessage: userEmptyStateMessage,
    studioBasePath: "users",
    recordLabel: (doc) => doc.name,
    deleteGuard: async (id) => {
      await connectToDatabase();
      const doc = await User.findById(id).select("role").lean();
      if (!doc || doc.role !== "head_admin") return null;
      const otherHeadAdmins = await User.countDocuments({
        role: "head_admin",
        _id: { $ne: id },
      });
      return otherHeadAdmins === 0 ? "Cannot delete the last remaining Head Admin." : null;
    },
  }),
);
