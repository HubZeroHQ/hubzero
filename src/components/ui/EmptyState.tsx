import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * DESIGN_SYSTEM.md §7 Empty States — a clear label plus an implied next
 * action, never a bare blank area. Voice follows §13: instructive, never
 * apologetic ("Drop a project image", not "Oops, nothing here yet!").
 *
 * Dashed border + no fill (vs. `ErrorState`'s solid border + filled
 * surface) is deliberate, not an oversight: dashed reads as "nothing has
 * happened here yet, add something" (an invitation), while a solid filled
 * surface reads as "something happened and it needs attention" (a
 * problem) — the two states should stay visually distinguishable at a
 * glance, not converge on one "boundary" treatment.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-card border-border-default flex flex-col items-center justify-center gap-3 border border-dashed px-6 py-12 text-center',
        className,
      )}
    >
      {icon ? (
        <div className="text-text-muted" aria-hidden>
          {icon}
        </div>
      ) : null}
      <p className="text-text-secondary text-sm font-medium">{title}</p>
      {description ? <p className="text-text-muted max-w-sm text-sm">{description}</p> : null}
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}
