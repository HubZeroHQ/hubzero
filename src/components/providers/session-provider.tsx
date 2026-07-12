"use client";

import { SessionProvider as AuthSessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

/**
 * Wraps Auth.js's `SessionProvider` (`ARCHITECTURE/19_CMS_FOUNDATION.md` §4) —
 * the one new provider this phase introduces, alongside the existing
 * `theme-provider.tsx`. Gives client components under `/studio` (e.g. a
 * future user menu) `useSession()` without each one re-fetching the session
 * independently. The Server Components that actually gate access
 * (`studio/(protected)/layout.tsx`) still call `requireSessionUser()`
 * directly — this provider is a convenience for client-side reads, never
 * the enforcement point.
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  return <AuthSessionProvider>{children}</AuthSessionProvider>;
}
