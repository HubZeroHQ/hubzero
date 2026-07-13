import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

/** DESIGN_SYSTEM.md §7 Tags/Badges — mono, small, non-interactive, never colored per-category. */
export function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'bg-surface-elevated inline-flex items-center rounded-full border border-[#2a2a2a] px-2.5 py-1',
        'text-text-secondary font-mono text-[11px] tracking-[0.05em] uppercase',
        className,
      )}
    >
      {children}
    </span>
  );
}
