import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { ReferenceIdBadge } from '@/components/ui/ReferenceIdBadge';
import { formatRelativeTime } from '@/lib/utils/relative-time';
import type { ContentSummary } from '@/lib/studio/dashboard-queries';
import type { ReferenceId, ReferenceIdPrefix } from '@/types/studio';
import { DashboardListRow } from './DashboardListRow';

/**
 * Shared row renderer for the four widgets that are each "a list of
 * Content entries" (Needs Your Attention, In Review Queue, Your Drafts,
 * Recently Published) — one implementation of the row rather than four
 * near-identical copies.
 */
export function ContentEntryList({
  entries,
  emptyTitle,
  limit = 8,
}: {
  entries: ContentSummary[];
  emptyTitle: string;
  limit?: number;
}) {
  if (entries.length === 0) {
    // One quiet line, not the full-page `EmptyState` box.
    //
    // That component is sized for a screen whose entire content is missing —
    // dashed border, centred heading, supporting sentence. Inside a dashboard
    // card it made the widget with *nothing* in it the tallest thing in the
    // row, so the dashboard drew the eye to the collection that needed the
    // least attention. The title alone carries the meaning here; the card
    // heading above it already provides the context the description repeated.
    return <p className="text-text-muted py-1 text-sm">{emptyTitle}</p>;
  }

  return (
    <ul className="divide-border-muted flex flex-col divide-y">
      {entries.slice(0, limit).map((entry) => (
        <li key={entry.id}>
          <DashboardListRow href={entry.href}>
            <StatusIndicator status={entry.status} />
            <span className="text-text-primary min-w-0 flex-1 truncate">{entry.title}</span>
            <ReferenceIdBadge
              referenceId={entry.referenceId as ReferenceId<ReferenceIdPrefix>}
              className="shrink-0"
            />
            <span className="text-text-muted shrink-0 text-xs">
              {formatRelativeTime(entry.updatedAt)}
            </span>
          </DashboardListRow>
        </li>
      ))}
    </ul>
  );
}
