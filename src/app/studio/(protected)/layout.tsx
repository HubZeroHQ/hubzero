import { StudioShell } from "@/components/admin/layout/studio-shell";
import { SessionProvider } from "@/components/providers/session-provider";
import { requireSessionUser } from "@/lib/cms/session";
import type { WithChildren } from "@/types";

/**
 * The auth-gated half of `/studio` (`ARCHITECTURE/19_CMS_FOUNDATION.md` §4).
 * Split into a `(protected)` route group specifically so `/studio/login`
 * (a sibling of this group, not inside it) never mounts this layout — a
 * blanket layout wrapping `login/` too would call `requireSessionUser()` on
 * the login page itself and redirect an unauthenticated visitor back to the
 * page they're already on, an infinite loop. `middleware.ts` already
 * special-cases `/studio/login`'s URL for the same reason; this route-group
 * split is the Server Component-layer equivalent of that same exception,
 * applied at the file-system routing level instead of by checking a
 * pathname string inside a shared layout.
 *
 * `requireSessionUser()` here is the defense-in-depth partner to
 * `middleware.ts` (§2) — it also catches the `sessionVersion` revocation
 * case middleware can't (that check only runs in the Node runtime, see
 * `session.ts`).
 */
export default async function ProtectedStudioLayout({ children }: WithChildren) {
  const user = await requireSessionUser();

  return (
    <SessionProvider>
      <StudioShell user={user}>{children}</StudioShell>
    </SessionProvider>
  );
}
