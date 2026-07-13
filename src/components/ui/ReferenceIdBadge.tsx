import { cn } from '@/lib/utils/cn';
import type { ReferenceId, ReferenceIdPrefix } from '@/types/cms';

/**
 * PLANNING.md §27 / §18 — the permanent, read-only `HZ-{PREFIX}-{NNN}`
 * identifier, rendered in the mono "system voice" everywhere an entry's
 * title appears (breadcrumbs, list rows, detail headers).
 */
export function ReferenceIdBadge({
  referenceId,
  className,
}: {
  referenceId: ReferenceId<ReferenceIdPrefix>;
  className?: string;
}) {
  return (
    <span
      className={cn('text-text-muted font-mono text-[11px] tracking-[0.05em] uppercase', className)}
    >
      {referenceId}
    </span>
  );
}
