# Scheduled Publishing

How the "schedule publish" / "schedule unpublish" workflow actions (Studio, Phase B) actually fire — this is the operational half; the engine itself is `src/lib/cms/crud-actions.ts`'s `schedulePublish`/`scheduleUnpublish`/`runScheduledPublish`/`runScheduledArchive` and `src/lib/cms/scheduler.ts`'s `runDueSchedules()`.

## 1. What triggers it

Setting a document's `scheduledPublishAt`/`scheduledUnpublishAt` field in Studio doesn't publish/archive anything by itself — it only records the intent. Something has to call `POST /api/cron/process-schedule` for it to actually happen. This app has no built-in cron runner (it's a self-hosted Next.js app, `ARCHITECTURE/08_TECHNICAL_ARCHITECTURE.md` §8, not a serverless platform with its own cron primitive), so that "something" is an OS-level crontab entry on the production host.

## 2. Required environment variable

```
CRON_SECRET=<a long random string>
```

Not in `.env.example`'s always-validated set (`src/lib/env.ts`) — it's read lazily, directly in the route, since it's the only thing that touches it. If it's unset, the route refuses every request with a `501`.

## 3. The crontab entry

Run every minute (adjust the interval to taste — nothing about this schedule is minute-precision-sensitive):

```
* * * * * curl -fsS -X POST -H "Authorization: Bearer $CRON_SECRET" https://your-domain.example/api/cron/process-schedule >> /var/log/hubzero-scheduler.log 2>&1
```

Replace `https://your-domain.example` with the real deployment URL and `$CRON_SECRET` with the same value set in the app's environment (source it from a file crontab can read, e.g. `/etc/hubzero/cron.env`, rather than hardcoding it in the crontab line itself).

## 4. What the route does

`POST /api/cron/process-schedule`:

1. Checks `Authorization: Bearer <CRON_SECRET>` — `401` if it doesn't match, `501` if `CRON_SECRET` isn't configured at all.
2. Calls `runDueSchedules()`, which loops every registered collection (`lib/cms/collection-config.ts`'s registry — no hardcoded collection list) and:
   - Publishes every `status: "scheduled"` document whose `scheduledPublishAt` has passed (via `runScheduledPublish`, which snapshots to `VersionHistory` exactly like a manual publish, attributed to the document's own author).
   - Archives every `status: "published"` document whose `scheduledUnpublishAt` has passed (via `runScheduledArchive`).
3. Returns `{ processed: <count>, results: [...] }` — one entry per document actually processed, each with its own `status: "success" | "error"`.

## 5. If a scheduled publish keeps failing

The most likely cause is a collection-specific `publishGuard` (e.g. Blueprint's "demo status must be Live") that was satisfied when the document was scheduled but no longer is by the time the scheduled moment arrives. The document stays `"scheduled"` — it isn't silently dropped — and the next cron run retries it. Check the cron log (or the route's JSON response, if triggered manually) for the specific `message`, then either fix the underlying condition or cancel the schedule from the document's edit screen.
