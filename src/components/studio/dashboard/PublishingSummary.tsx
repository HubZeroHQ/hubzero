import Link from 'next/link';
import { DASHBOARD_CONTENT_COLLECTIONS, type ContentSummary } from '@/lib/studio/dashboard-queries';
import type { PublishStatus } from '@/types/studio';

const STATUS_ORDER: readonly { status: PublishStatus; label: string }[] = [
  { status: 'published', label: 'published' },
  { status: 'draft', label: 'draft' },
  { status: 'inReview', label: 'in review' },
  { status: 'archived', label: 'archived' },
];

/**
 * Publishing state grouped by the collection the destination actually opens.
 *
 * The former aggregate tiles combined every collection, then linked every
 * total to Work. A mixed total has no existing filtered destination. One
 * compact link per collection preserves the overview while every navigation
 * now lands on the records it describes.
 */
export function PublishingSummary({ entries }: { entries: ContentSummary[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {Object.entries(DASHBOARD_CONTENT_COLLECTIONS).map(([type, collection]) => {
        const collectionEntries = entries.filter((entry) => entry.type === type);
        const counts = collectionEntries.reduce<Partial<Record<PublishStatus, number>>>(
          (result, entry) => {
            result[entry.status] = (result[entry.status] ?? 0) + 1;
            return result;
          },
          {},
        );

        return (
          <li key={type}>
            <Link
              href={collection.href}
              className="border-border-muted hover:border-border-default hover:bg-surface-elevated duration-fast ease-standard flex h-full flex-col gap-2 rounded-[4px] border px-3 py-2.5 transition-colors"
            >
              <span className="text-text-primary text-sm font-medium">{collection.label}</span>
              <span className="text-text-muted flex flex-wrap gap-x-3 gap-y-1 text-xs">
                {STATUS_ORDER.map(({ status, label }) => (
                  <span key={status}>
                    <span className="text-text-secondary font-mono tabular-nums">
                      {counts[status] ?? 0}
                    </span>{' '}
                    {label}
                  </span>
                ))}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
