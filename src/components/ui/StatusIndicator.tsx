import { cn } from '@/lib/utils/cn';
import type { PublishStatus, ServicePublishStatus } from '@/types/cms';

/**
 * DESIGN_SYSTEM.md §7 Status Indicators — filled dot + mono label, three
 * colors only (green = nominal/success, amber = in-progress/active, gray =
 * pending/inactive), never a persistent pulse/glow. Covers both the full
 * five-state workflow (§28) and Services' simplified two-state variant
 * (§26.7) from one map, since they're the same visual language.
 */
type Tone = 'success' | 'active' | 'inactive';

const STATUS_TONE: Record<PublishStatus | ServicePublishStatus, Tone> = {
  draft: 'inactive',
  inReview: 'active',
  approved: 'active',
  published: 'success',
  archived: 'inactive',
};

const STATUS_LABEL: Record<PublishStatus | ServicePublishStatus, string> = {
  draft: 'Draft',
  inReview: 'In review',
  approved: 'Approved',
  published: 'Published',
  archived: 'Archived',
};

const TONE_DOT: Record<Tone, string> = {
  success: 'bg-success',
  active: 'bg-accent',
  inactive: 'bg-text-muted',
};

interface StatusIndicatorProps {
  status: PublishStatus | ServicePublishStatus;
  label?: string;
  className?: string;
}

export function StatusIndicator({ status, label, className }: StatusIndicatorProps) {
  const tone = STATUS_TONE[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', TONE_DOT[tone])} aria-hidden />
      <span className="text-text-muted font-mono text-xs tracking-[0.08em] uppercase">
        {label ?? STATUS_LABEL[status]}
      </span>
    </span>
  );
}
