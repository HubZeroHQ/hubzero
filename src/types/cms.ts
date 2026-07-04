import type { UserRole } from "@/models/user";

export type { UserRole };

/**
 * The shared type vocabulary the auth layer and (from Phase B onward) the
 * generic CRUD/permission engine are written against —
 * `ARCHITECTURE/19_CMS_FOUNDATION.md` §4. Kept minimal in Phase A: only the
 * claims actually embedded in the session JWT today. `Role`/`Action`/
 * `Resource` (the `can()` permission matrix) are introduced in Phase B, not
 * pre-declared here as empty scaffolding.
 */
export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  dynamicPermissions: string[];
}
