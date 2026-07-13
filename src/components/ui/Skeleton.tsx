import { cn } from '@/lib/utils/cn';

/**
 * DESIGN_SYSTEM.md §7 Loading States — muted fill, no shimmer/gradient.
 * The subtle pulse only plays for users who haven't requested reduced
 * motion (`motion-safe:`), per `.hubzero/design/motion.md` — Motion Must
 * Respect the User's Preferences.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('rounded-card bg-surface-elevated motion-safe:animate-pulse', className)}
      aria-hidden
    />
  );
}
