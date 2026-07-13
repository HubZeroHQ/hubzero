import Link from 'next/link';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { ReferenceIdBadge } from '@/components/ui/ReferenceIdBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatRelativeTime } from '@/lib/utils/relative-time';
import type { ContentSummary } from '@/lib/studio/dashboard-queries';
import type { ReferenceId, ReferenceIdPrefix } from '@/types/studio';

/**
 * Shared row renderer for the four widgets that are each "a list of
 * Content entries" (Needs Your Attention, In Review Queue, Your Drafts,
 * Recently Published) — one implementation of the row rather than four
 * near-identical copies.
 */
export function ContentEntryList({
  entries,
  emptyTitle,
  emptyDescription,
  limit = 8,
}: {
  entries: ContentSummary[];
  emptyTitle: string;
  emptyDescription?: string;
  limit?: number;
}) {
  if (entries.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <ul className="divide-border-muted flex flex-col divide-y">
      {entries.slice(0, limit).map((entry) => (
        <li key={entry.id}>
          <Link
            href={entry.href}
            className="duration-fast ease-standard hover:bg-surface-elevated flex items-center gap-3 py-2.5 text-sm transition-colors"
          >
            <StatusIndicator status={entry.status} />
            <span className="text-text-primary min-w-0 flex-1 truncate">{entry.title}</span>
            <ReferenceIdBadge
              referenceId={entry.referenceId as ReferenceId<ReferenceIdPrefix>}
              className="shrink-0"
            />
            <span className="text-text-muted shrink-0 text-xs">
              {formatRelativeTime(entry.updatedAt)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
