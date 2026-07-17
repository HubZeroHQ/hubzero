'use client';

import { Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

/**
 * The visual flag on a just-inserted AI block (CMS_PRODUCT_DESIGN.md §5:
 * "each visually flagged... until the author has explicitly reviewed or
 * edited it"). Deliberately not amber — DESIGN_SYSTEM.md §7/§15 reserve
 * amber for live/active/selected state, and a document can easily contain
 * several AI-flagged blocks at once, which would violate "amber... never
 * repeated more than once in the same viewport." A neutral left-border
 * treatment plus a small mono label reads as "needs a look," not "selected."
 *
 * This flag is session-local UI state, not part of the block schema — once
 * an author edits or explicitly dismisses it, or the document is reloaded,
 * the flag is gone. The actual, permanent safeguard is the publishing
 * workflow's human review gate (§28/§31), not this badge.
 */
export function AiGeneratedBadge({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div
      className={cn(
        'border-border-strong bg-surface-elevated/60 flex items-center justify-between gap-2 rounded-t-[4px] border-b px-3 py-1.5',
      )}
    >
      <span className="text-text-secondary inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.05em] uppercase">
        <Sparkles className="h-3 w-3" aria-hidden />
        AI-generated — review before saving
      </span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Mark reviewed"
        title="Mark reviewed"
        className="text-text-muted hover:text-text-primary hover:bg-surface-elevated duration-fast ease-standard rounded-control flex h-6 w-6 items-center justify-center transition-colors"
      >
        <X className="h-3 w-3" aria-hidden />
      </button>
    </div>
  );
}
