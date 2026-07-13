import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

/** Shared widget shell (CMS_PRODUCT_DESIGN.md §3) — every widget is a card with a title and a real, filtered view inside it. */
export function DashboardWidgetCard({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      aria-label={title}
      className={cn(
        'rounded-card border-border-default bg-surface-default flex flex-col gap-3 border p-5',
        className,
      )}
    >
      <h2 className="text-text-primary text-sm font-semibold">{title}</h2>
      {children}
    </section>
  );
}
