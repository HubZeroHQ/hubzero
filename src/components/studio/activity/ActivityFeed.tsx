'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { loadMoreActivityAction } from '@/lib/studio/actions/activity';
import type { ActivitySearchParams } from '@/lib/studio/activity/filters';
import type { ActivityItem, ActivityPage } from '@/lib/studio/activity/types';
import type { EditorialEventCursor } from '@/lib/events/repository';

/**
 * The Studio-wide activity feed (v3.1 Milestone 9).
 *
 * A real `<ol>` of `<li>`s: this is an ordered list of things that happened,
 * and a screen reader should hear it as one — including how many. Every row
 * states who, what, which entry and when **in text**; nothing here depends on
 * an icon or a colour to be understood.
 *
 * There is no `switch` on event type in this file, or anywhere else in the UI.
 * Rows render `action` and `detail`, which `lib/events/describe.ts` produced.
 * A new event type appears here the moment it is described there.
 */
export function ActivityFeed({
  initial,
  params,
}: {
  initial: ActivityPage;
  /** The current query string, replayed to the action so paging keeps the filters. */
  params: ActivitySearchParams;
}) {
  const [items, setItems] = useState<ActivityItem[]>(initial.items);
  const [cursor, setCursor] = useState<EditorialEventCursor | null>(initial.nextCursor);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function loadMore() {
    if (!cursor) return;
    setError(null);
    startTransition(async () => {
      try {
        const next = await loadMoreActivityAction(params, cursor);
        // Appended, never replaced: "Load more" extends what the editor is
        // already reading rather than scrolling it out from under them.
        setItems((current) => [...current, ...next.items]);
        setCursor(next.nextCursor);
      } catch {
        setError('That page could not be loaded. Try again.');
      }
    });
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="No activity matches these filters."
        description="Editorial events are recorded as work happens. Nothing recorded before the event log was introduced appears here."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ol className="border-border-default divide-border-muted divide-y rounded-[4px] border">
        {items.map((item) => (
          <ActivityRow key={item.id} item={item} />
        ))}
      </ol>

      {error ? (
        <p role="alert" className="text-status-danger text-sm">
          {error}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        {cursor ? (
          <Button type="button" variant="secondary" onClick={loadMore} disabled={isPending}>
            {isPending ? 'Loading…' : 'Load more'}
          </Button>
        ) : (
          <p className="text-text-muted text-xs">End of recorded activity.</p>
        )}
        <p aria-live="polite" className="text-text-muted text-xs">
          {items.length} {items.length === 1 ? 'event' : 'events'} shown
        </p>
      </div>
    </div>
  );
}

function ActivityRow({ item }: { item: ActivityItem }) {
  return (
    <li className="flex flex-wrap items-baseline gap-x-2 gap-y-1 px-3 py-2.5">
      <span className="text-text-secondary text-xs">
        {item.actor ? item.actor.name : 'Actor not recorded'}
      </span>

      <span className="text-text-primary text-sm">{item.action}</span>

      {item.entry.exists ? (
        <Link
          href={item.entry.href}
          className="text-text-primary hover:text-accent-primary text-sm font-medium underline underline-offset-2"
        >
          {item.entry.title}
        </Link>
      ) : (
        // The event still happened; the entry it named does not survive. Saying
        // so beats a dead link or a silently missing row.
        <span className="text-text-muted text-sm italic">This entry no longer exists</span>
      )}

      <span className="text-text-muted text-xs">{item.entry.collectionLabel}</span>

      {item.detail ? <span className="text-text-secondary text-xs">{item.detail}</span> : null}

      <time
        dateTime={new Date(item.at).toISOString()}
        className="text-text-muted ml-auto shrink-0 text-xs"
      >
        {formatTimestamp(new Date(item.at))}
      </time>
    </li>
  );
}

/** Absolute, matching the entry timeline: a feed is read to establish when something actually happened. */
function formatTimestamp(at: Date): string {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(at);
}
