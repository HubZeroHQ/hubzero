import Link from 'next/link';
import type { PublishStatus } from '@/types/studio';

/**
 * Publishing as four totals rather than a collection-by-collection list
 * (v3.1 Milestone 16).
 *
 * The previous version listed every collection's counts individually — around
 * forty numbers, none of which asked the editor to do anything. A total per
 * status answers the question this section is actually for ("how much is in
 * flight?") in one glance, and the link goes where the work is.
 *
 * `inReview` links to the dashboard's own review queue rather than a filtered
 * list, because that queue is the thing an editor acts on.
 */
const STATUS_ORDER: readonly { status: PublishStatus; label: string; href: string }[] = [
  { status: 'published', label: 'Published', href: '/studio/content/work?status=published' },
  { status: 'draft', label: 'Drafts', href: '/studio/content/work?status=draft' },
  { status: 'inReview', label: 'In review', href: '/studio/content/work?status=inReview' },
  { status: 'archived', label: 'Archived', href: '/studio/content/work?status=archived' },
];

export function PublishingSummary({ counts }: { counts: Record<PublishStatus, number> }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {STATUS_ORDER.map(({ status, label, href }) => (
        <li key={status}>
          <Link
            href={href}
            className="border-border-muted hover:border-border-default hover:bg-surface-elevated duration-fast ease-standard flex flex-col gap-0.5 rounded-[4px] border px-3 py-2.5 transition-colors"
          >
            <span className="text-text-primary text-lg leading-none font-semibold tabular-nums">
              {counts[status] ?? 0}
            </span>
            <span className="text-text-muted text-xs">{label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
