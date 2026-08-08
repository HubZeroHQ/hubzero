import { AlertTriangle, Check, Circle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { EditorSaveStatus } from '@/lib/studio/editor-state/types';

/**
 * The one save-state chip every Studio editor shows (phase brief §3), so
 * "Saved" means the same thing and looks the same thing on a Work entry, a
 * Career, and whatever collection is added next.
 *
 * `role="status"` + `aria-live="polite"` announces each transition without
 * interrupting the author mid-sentence, and the spinner carries
 * `aria-hidden` because the text beside it already says "Saving" — a
 * screen reader should hear the state once, not twice (phase brief §11).
 */
export function SaveStateIndicator({
  status,
  className,
}: {
  status: EditorSaveStatus;
  lastSavedAt?: Date | null;
  error?: string;
  className?: string;
}) {
  const { icon, label, tone } = describe(status);

  return (
    <p
      role="status"
      aria-live="polite"
      className={cn('flex items-center gap-1.5 text-xs', tone, className)}
    >
      {icon}
      <span>{label}</span>
    </p>
  );
}

function describe(status: EditorSaveStatus): {
  icon: React.ReactNode;
  label: string;
  tone: string;
} {
  switch (status) {
    case 'saving':
      return {
        icon: <Loader2 className="h-3 w-3 animate-spin" aria-hidden />,
        label: 'Saving',
        tone: 'text-text-secondary',
      };
    case 'dirty':
      return {
        icon: <Circle className="h-2 w-2 fill-current" aria-hidden />,
        label: 'Unsaved',
        tone: 'text-text-secondary',
      };
    case 'error':
      return {
        icon: <AlertTriangle className="h-3 w-3" aria-hidden />,
        label: 'Failed',
        tone: 'text-danger',
      };
    default:
      return {
        icon: <Check className="h-3 w-3" aria-hidden />,
        label: 'Saved',
        tone: 'text-text-muted',
      };
  }
}
