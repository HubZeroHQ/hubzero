import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { loadActivity } from '@/lib/studio/activity/service';

/**
 * A short preview of Studio-wide activity (v3.1 Milestone 16).
 *
 * This widget previously stated that no activity log existed and rendered an
 * empty state permanently. That was true when it was written and stopped being
 * true in Milestone 8 — the editorial event log now records real events, and
 * Milestone 9 built the full feed at `/studio/activity`. The placeholder was
 * left behind, so the dashboard was telling editors that a system they already
 * have does not exist.
 *
 * Deliberately five rows and no filters: the full feed is one click away and
 * does that job properly. A dashboard widget that reimplemented it would be a
 * second activity surface to keep in step.
 */
const PREVIEW_LIMIT = 5;

export async function RecentActivityWidget() {
  const session = await auth();
  if (!session) return null;

  const { items } = await loadActivity(
    {},
    { role: session.user.role, userId: session.user.id },
    { limit: PREVIEW_LIMIT },
  ).catch(() => ({ items: [], nextCursor: null }));

  return (
    <div className="flex flex-col gap-3">
      {items.length === 0 ? (
        <p className="text-text-muted text-xs">
          Nothing recorded yet. Editorial events appear here as work happens.
        </p>
      ) : (
        <ol className="divide-border-muted divide-y">
          {items.map((item) => (
            <li key={item.id} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 py-2">
              <span className="text-text-secondary text-xs">
                {item.actor ? item.actor.name : 'Actor not recorded'}
              </span>
              <span className="text-text-primary text-sm">{item.action}</span>
              {item.entry.exists ? (
                <Link
                  href={item.entry.href}
                  className="text-text-primary hover:text-accent-primary text-sm underline underline-offset-2"
                >
                  {item.entry.title}
                </Link>
              ) : (
                <span className="text-text-muted text-sm italic">Entry deleted</span>
              )}
              <time
                dateTime={new Date(item.at).toISOString()}
                className="text-text-muted ml-auto shrink-0 text-xs"
              >
                {formatTimestamp(new Date(item.at))}
              </time>
            </li>
          ))}
        </ol>
      )}

      <Link
        href="/studio/activity"
        className="text-text-secondary hover:text-text-primary inline-flex items-center gap-1 text-xs"
      >
        All activity
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
      </Link>
    </div>
  );
}

function formatTimestamp(at: Date): string {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(at);
}
