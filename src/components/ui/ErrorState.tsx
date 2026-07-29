import { cn } from '@/lib/utils/cn';

/**
 * Calm, plain error messaging per §13 Voice — states the problem, never
 * blames the user. Solid border + filled surface (vs. `EmptyState`'s
 * dashed/unfilled treatment) is deliberate — see that component's own
 * comment for why the two boundary styles stay distinct.
 */
export function ErrorState({
  title = 'Something went wrong.',
  description,
  action,
  className,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-card border-border-default bg-surface-default flex flex-col items-center justify-center gap-3 border px-6 py-12 text-center',
        className,
      )}
    >
      <p className="text-text-muted font-mono text-xs tracking-[0.1em] uppercase">Error</p>
      <p className="text-text-secondary text-sm font-medium">{title}</p>
      {description ? <p className="text-text-muted max-w-sm text-sm">{description}</p> : null}
      {action}
    </div>
  );
}
