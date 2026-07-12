import { NextResponse } from "next/server";

// Side-effect import: guarantees every collection has registered itself
// (`lib/cms/collections/index.ts`'s own doc comment) before `runDueSchedules()`
// calls `listCollections()` — the identical requirement the dashboard page
// meets by importing this first. A Route Handler is exactly the kind of
// registry-reading entry point with no static import path to any specific
// collection that comment calls out as needing this.
import "@/lib/cms/collections";

import { runDueSchedules } from "@/lib/cms/scheduler";

/**
 * Fires every due `schedulePublish`/`scheduleUnpublish` (Phase B) across
 * every registered collection — meant to be hit by an external scheduler
 * (an OS crontab entry on the self-hosted deployment, `ARCHITECTURE/08_TECHNICAL_ARCHITECTURE.md`
 * §8; see `docs/operations/SCHEDULED_PUBLISHING.md` for the exact crontab
 * line), never by a signed-in Studio user — there is no session here, which
 * is why `runDueSchedules()`/`runScheduledPublish()`/`runScheduledArchive()`
 * (`lib/cms/crud-actions.ts`, `lib/cms/scheduler.ts`) never call
 * `requirePermission()`. `CRON_SECRET` is the only gate, so it's read lazily
 * here rather than added to `lib/env.ts`'s always-validated schema — that
 * file's own convention reserves that schema for vars every request touches;
 * this route is the only thing that touches this one.
 */
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET is not configured." }, { status: 501 });
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const results = await runDueSchedules();
  return NextResponse.json({ processed: results.length, results });
}
