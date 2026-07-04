import { redirect } from "next/navigation";

import { auth } from "@/lib/cms/auth";
import { roleMeetsMinimum } from "@/lib/cms/roles";
import type { SessionUser, UserRole } from "@/types/cms";

/**
 * Authentication utilities used by `/studio/**` Server Components — the
 * defense-in-depth partner to `middleware.ts` (`ARCHITECTURE/19_CMS_FOUNDATION.md`
 * §2). Middleware only checks JWT shape/validity at the edge; these helpers
 * run in the Node runtime and additionally catch the `sessionVersion`
 * revocation case (`auth.ts`'s `session` callback sets `session.error` when
 * a session has been invalidated server-side).
 */

/** Returns the current session user, or `null` if unauthenticated/revoked. Never redirects. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user || session.error) return null;
  return session.user;
}

/** Returns the current session user, redirecting to `/studio/login` if there isn't one. */
export async function requireSessionUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/studio/login");
  return user;
}

/**
 * Requires the current user's role to meet or exceed `minimumRole` (per
 * `09_CMS_ARCHITECTURE.md` §4's Head Admin > Admin > Teammate hierarchy).
 * A coarse role-tier gate, not the fine-grained per-resource `can()` engine
 * (Phase B) — this is what a whole-screen gate like "Users management is
 * Head-Admin-only" needs today, and it doesn't need to know about
 * `dynamicPermissions` to do that job.
 */
export async function requireRole(minimumRole: UserRole): Promise<SessionUser> {
  const user = await requireSessionUser();
  if (!roleMeetsMinimum(user.role, minimumRole)) {
    redirect("/studio");
  }
  return user;
}
