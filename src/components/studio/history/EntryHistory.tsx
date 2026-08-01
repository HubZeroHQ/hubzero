import {
  groupHistory,
  HISTORY_BUCKET_LABEL,
  HISTORY_EVENT_LABEL,
  type HistoryEvent,
} from '@/lib/studio/history/events';

/**
 * The one entry-history timeline (v3.1 Milestone 7), shared by every editor —
 * there is no per-collection implementation, because "what happened to this
 * entry" is the same question everywhere.
 *
 * Read-only by construction: events are derived facts, and nothing here
 * offers a way to edit or delete one.
 *
 * Rendered as a real `<ol>` of `<li>`s inside per-bucket sections, so a screen
 * reader hears an ordered list with a heading per date group rather than a
 * wall of divs. Each row states who, what and when in text — no icon carries
 * meaning on its own — and timestamps use `<time dateTime>` so the machine-
 * readable instant travels with the human-readable one.
 */
export function EntryHistory({ events, now = new Date() }: { events: HistoryEvent[]; now?: Date }) {
  const groups = groupHistory(events, now);

  return (
    <section aria-labelledby="entry-history-title" className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 id="entry-history-title" className="text-text-primary text-sm font-semibold">
          History
        </h2>
        <p className="text-text-secondary text-xs">
          Everything Studio has recorded for this entry, newest first. Entries created before the
          event log was introduced show only what could be derived from their timestamps.
        </p>
      </div>

      {groups.length === 0 ? (
        <p className="text-text-muted text-sm">No recorded activity yet.</p>
      ) : (
        groups.map((group) => {
          const headingId = `entry-history-${group.bucket}`;
          return (
            <section key={group.bucket} aria-labelledby={headingId} className="flex flex-col gap-2">
              <h3
                id={headingId}
                className="text-text-muted font-mono text-[11px] tracking-[0.08em] uppercase"
              >
                {HISTORY_BUCKET_LABEL[group.bucket]}
              </h3>

              <ol className="border-border-default divide-border-muted divide-y rounded-[4px] border">
                {group.events.map((event) => (
                  <li
                    key={event.id}
                    className="flex flex-wrap items-baseline gap-x-2 gap-y-1 px-3 py-2"
                  >
                    <span className="text-text-primary text-sm">{event.description}</span>
                    <span className="text-text-muted text-xs">
                      {HISTORY_EVENT_LABEL[event.type]}
                    </span>
                    <span className="text-text-secondary text-xs">
                      {event.actor ? `by ${event.actor.name}` : 'actor not recorded'}
                    </span>
                    <time
                      dateTime={event.at.toISOString()}
                      className="text-text-muted ml-auto shrink-0 text-xs"
                    >
                      {formatTimestamp(event.at)}
                    </time>
                  </li>
                ))}
              </ol>
            </section>
          );
        })
      )}
    </section>
  );
}

/** Absolute, not relative: "2 days ago" is fine in a list you skim, but a history is read to establish when something actually happened. */
function formatTimestamp(at: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(at);
}
