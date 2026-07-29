import Link from 'next/link';
import type { MediaUsageRef } from '@/lib/media/usage';
import { EmptyState } from '@/components/ui/EmptyState';
import { Tag } from '@/components/ui/Tag';

const FIELD_LABEL: Record<Exclude<MediaUsageRef['field'], 'document'>, string> = {
  heroImage: 'Hero image',
  heroMedia: 'Hero media',
  galleryImage: 'Gallery image',
  previewAsset: 'Preview asset',
  portrait: 'Portrait',
};

/**
 * "Where is this asset currently used?" (Phase 5 brief) — the reverse
 * relationship computed by `lib/media/usage.ts`. Shown unconditionally on
 * the asset detail page (not just at delete/replace time) so an editor can
 * always answer that question before doing anything destructive.
 */
export function MediaUsagePanel({ usage }: { usage: MediaUsageRef[] }) {
  if (usage.length === 0) {
    return (
      <EmptyState
        title="Not used anywhere yet."
        description="This asset isn't referenced by any Document or entry field."
      />
    );
  }

  return (
    <ul className="border-border-muted divide-border-muted flex flex-col divide-y rounded-[4px] border">
      {usage.map((ref, index) => (
        <li
          key={`${ref.ownerType}-${ref.ownerId}-${ref.field}-${index}`}
          className="flex items-center gap-3 px-3 py-2.5"
        >
          <Tag>{ref.ownerType}</Tag>
          <Link
            href={ref.href}
            className="text-text-primary flex-1 truncate text-sm hover:underline"
          >
            {ref.label}
          </Link>
          {ref.referenceId ? (
            <span className="text-text-muted font-mono text-[11px] uppercase">
              {ref.referenceId}
            </span>
          ) : null}
          <span className="text-text-muted text-xs">
            {ref.field === 'document'
              ? `In ${ref.documentRole ?? 'document'}`
              : FIELD_LABEL[ref.field]}
          </span>
        </li>
      ))}
    </ul>
  );
}
