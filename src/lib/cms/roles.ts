import type { UserRole } from "@/types/cms";

/**
 * The Head Admin > Admin > Teammate hierarchy (`09_CMS_ARCHITECTURE.md` §4),
 * shared between `session.ts`'s `requireRole()` (server-side gate) and the
 * Studio sidebar (client-side nav filtering) — extracted once a second
 * consumer needed the same ranking, rather than duplicated.
 */
const roleRank: Record<UserRole, number> = {
  teammate: 0,
  admin: 1,
  head_admin: 2,
};

export function roleMeetsMinimum(role: UserRole, minimum: UserRole): boolean {
  return roleRank[role] >= roleRank[minimum];
}
