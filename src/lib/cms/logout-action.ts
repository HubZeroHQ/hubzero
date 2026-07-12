"use server";

import { signOut } from "@/lib/cms/auth";

/**
 * Kept in its own file, with a file-level `"use server"` directive, because
 * `StudioMobileNav` (a Client Component) needs to call it directly. A
 * function-level `"use server"` inside `session.ts` would still force
 * Next.js to bundle that whole module — including its `auth.ts` →
 * `db.ts` → Mongoose import chain — for the client, which is exactly the
 * "Module not found: timers/promises" build failure this split avoids.
 * `session.ts`'s other exports are Server-Component-only and never imported
 * from client code, so they don't need this same isolation.
 */
export async function logout() {
  await signOut({ redirectTo: "/studio/login" });
}
