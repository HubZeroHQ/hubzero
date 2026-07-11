import { listCollections } from "@/lib/cms/collection-config";
import { runScheduledArchive, runScheduledPublish } from "@/lib/cms/crud-actions";
import { connectToDatabase } from "@/lib/db";
import type { Resource } from "@/types/cms";

export interface ScheduleRunResult {
  resource: Resource;
  documentId: string;
  action: "publish" | "archive";
  status: "success" | "error";
  message?: string;
}

/**
 * The scheduler's entire job (Phase B): find every document across every
 * registered collection whose scheduled moment has arrived, and fire it
 * through the same generic engine `runScheduledPublish`/`runScheduledArchive`
 * (`crud-actions.ts`) use for a single document — registry-driven, so a
 * future collection needs no change here to participate in scheduling.
 *
 * Called from `app/api/cron/process-schedule/route.ts`, which is the only
 * thing that should ever call this (see that route's own comment on why
 * there's no signed-in user here).
 */
export async function runDueSchedules(now: Date = new Date()): Promise<ScheduleRunResult[]> {
  await connectToDatabase();
  const results: ScheduleRunResult[] = [];

  for (const config of listCollections()) {
    if (config.workflow === "none") continue;

    const duePublishes = await config.model
      .find({ status: "scheduled", scheduledPublishAt: { $lte: now } })
      .select("_id")
      .lean<{ _id: unknown }[]>();
    // Each due document is an independent mutation (its own `snapshotVersion`/
    // `notify` side effects, no shared state) — run the batch concurrently
    // rather than one-at-a-time, so a cron tick with many due items isn't
    // serialized into N sequential round-trips.
    results.push(
      ...(await Promise.all(
        duePublishes.map(async ({ _id }) => {
          const documentId = String(_id);
          const result = await runScheduledPublish(config, documentId);
          return {
            resource: config.resource,
            documentId,
            action: "publish" as const,
            status: result.status,
            message: result.status === "error" ? result.message : undefined,
          };
        }),
      )),
    );

    const dueUnpublishes = await config.model
      .find({ status: "published", scheduledUnpublishAt: { $lte: now } })
      .select("_id")
      .lean<{ _id: unknown }[]>();
    results.push(
      ...(await Promise.all(
        dueUnpublishes.map(async ({ _id }) => {
          const documentId = String(_id);
          const result = await runScheduledArchive(config, documentId);
          return {
            resource: config.resource,
            documentId,
            action: "archive" as const,
            status: result.status,
            message: result.status === "error" ? result.message : undefined,
          };
        }),
      )),
    );
  }

  return results;
}

export interface ScheduledItemRow {
  resource: Resource;
  label: string;
  studioBasePath?: string;
  documentId: string;
  recordLabel: string;
  at: Date;
}

async function listScheduled(
  filter: Record<string, unknown>,
  dateField: "scheduledPublishAt" | "scheduledUnpublishAt",
  limit: number,
): Promise<ScheduledItemRow[]> {
  await connectToDatabase();
  const rows: ScheduledItemRow[] = [];

  for (const config of listCollections()) {
    if (config.workflow === "none") continue;
    const docs = await config.model
      .find(filter)
      .sort({ [dateField]: 1 })
      .limit(limit)
      .lean<Record<string, unknown>[]>();
    for (const doc of docs) {
      rows.push({
        resource: config.resource,
        label: config.label,
        studioBasePath: config.studioBasePath,
        documentId: String(doc._id),
        recordLabel: config.recordLabel?.(doc) ?? String(doc._id),
        at: doc[dateField] as Date,
      });
    }
  }

  return rows.sort((a, b) => a.at.getTime() - b.at.getTime()).slice(0, limit);
}

/**
 * The dashboard's "Upcoming publishes"/"Scheduled changes" cards' data
 * source — every collection's currently-pending scheduled action, soonest
 * first, generic across the registry like every other dashboard query
 * (`app/studio/(protected)/page.tsx`'s own precedent).
 */
export function listUpcomingPublishes(limit = 10): Promise<ScheduledItemRow[]> {
  return listScheduled(
    { status: "scheduled", scheduledPublishAt: { $ne: null } },
    "scheduledPublishAt",
    limit,
  );
}

export function listUpcomingUnpublishes(limit = 10): Promise<ScheduledItemRow[]> {
  return listScheduled(
    { status: "published", scheduledUnpublishAt: { $ne: null } },
    "scheduledUnpublishAt",
    limit,
  );
}
