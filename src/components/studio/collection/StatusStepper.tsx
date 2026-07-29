'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/Button';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import type { PublishStatus } from '@/types/studio';

const TRANSITION_LABEL: Record<PublishStatus, string> = {
  draft: 'Save as draft',
  inReview: 'Submit for review',
  approved: 'Approve',
  published: 'Publish',
  archived: 'Archive',
};

const STATUS_ANNOUNCEMENT: Record<PublishStatus, string> = {
  draft: 'Moved back to draft.',
  inReview: 'Submitted for review.',
  approved: 'Approved.',
  published: 'Published.',
  archived: 'Archived.',
};

/**
 * `TRANSITION_LABEL`/`STATUS_ANNOUNCEMENT` are keyed by `to` only, which is
 * ambiguous for `draft`: reaching it from `archived` ("Restore") reads very
 * differently than the plain `draft` copy written for other paths — "Save as
 * draft" implies the viewer is choosing to save in-progress work, not
 * recovering something retired. This is the one pair (`from`, `to`) that
 * needs its own copy; every other transition's label/announcement is
 * unambiguous from `to` alone, so it isn't worth restructuring both maps to
 * be keyed by the full pair just for this single case.
 */
function transitionLabel(from: PublishStatus, to: PublishStatus): string {
  if (from === 'archived' && to === 'draft') return 'Restore';
  return TRANSITION_LABEL[to];
}

function transitionAnnouncement(from: PublishStatus, to: PublishStatus): string {
  if (from === 'archived' && to === 'draft') return 'Restored to draft.';
  return STATUS_ANNOUNCEMENT[to];
}

/**
 * CMS_PRODUCT_DESIGN.md §5/§30 — "the status stepper shows only the
 * transition(s) valid for the acting role, never a five-option dropdown."
 * `availableTransitions`/`canUnpublishOverride`/`canReject` are computed
 * server-side (`lib/studio/workflow-permissions.ts`) from the viewer's role,
 * so this component never re-derives permission logic itself — it only
 * renders whatever the server already decided the viewer may do.
 */
export function StatusStepper({
  status,
  availableTransitions,
  canUnpublishOverride,
  canReject,
  reviewNote,
  onTransition,
}: {
  status: PublishStatus;
  availableTransitions: PublishStatus[];
  canUnpublishOverride: boolean;
  /** Whether the viewer may reject this entry (currently `inReview`) back to `draft` with a required note — the explicit re-review path, distinct from the note-less unpublish override below. */
  canReject: boolean;
  /** The reviewer's reason the last time this entry was rejected — cleared once it moves past `inReview` again. */
  reviewNote?: string | null;
  onTransition: (to: PublishStatus, note?: string) => Promise<{ error?: string }>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();
  const [announcement, setAnnouncement] = useState<string | undefined>();
  const [rejecting, setRejecting] = useState(false);
  const [rejectNote, setRejectNote] = useState('');

  function handleTransition(to: PublishStatus, note?: string) {
    setError(undefined);
    startTransition(async () => {
      const result = await onTransition(to, note);
      if (result.error) {
        setError(result.error);
        return;
      }
      // Announced via `aria-live` below — a screen-reader user triggering a
      // transition otherwise has no non-visual signal that it succeeded
      // once `router.refresh()` re-renders the stepper with new props.
      setAnnouncement(transitionAnnouncement(status, to));
      setRejecting(false);
      setRejectNote('');
      router.refresh();
    });
  }

  function handleConfirmReject() {
    if (!rejectNote.trim()) {
      setError('A rejection reason is required.');
      return;
    }
    handleTransition('draft', rejectNote);
  }

  return (
    <div className="flex flex-col gap-2">
      {reviewNote ? (
        <div className="border-danger/40 bg-danger/5 rounded-md border p-3 text-sm">
          <p className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">
            Reviewer feedback
          </p>
          <p className="text-text-secondary mt-1">{reviewNote}</p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <StatusIndicator status={status} />
        {availableTransitions.map((to) => (
          <Button
            key={to}
            type="button"
            variant={to === 'published' ? 'primary' : 'secondary'}
            disabled={isPending}
            onClick={() => handleTransition(to)}
          >
            {transitionLabel(status, to)}
          </Button>
        ))}
        {canReject && !rejecting ? (
          <Button
            type="button"
            variant="ghost"
            disabled={isPending}
            onClick={() => setRejecting(true)}
          >
            Reject
          </Button>
        ) : null}
        {canUnpublishOverride ? (
          <Button
            type="button"
            variant="ghost"
            disabled={isPending}
            onClick={() => handleTransition('draft')}
          >
            Unpublish to draft
          </Button>
        ) : null}
      </div>

      {rejecting ? (
        <div className="flex flex-col gap-2">
          <label
            className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase"
            htmlFor="reject-note"
          >
            Rejection reason
          </label>
          <textarea
            id="reject-note"
            className="border-border-default bg-surface-default rounded-md border p-2 text-sm"
            rows={3}
            value={rejectNote}
            onChange={(event) => setRejectNote(event.target.value)}
            placeholder="Tell the author what needs to change before this can move forward again."
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={isPending}
              onClick={handleConfirmReject}
            >
              Confirm rejection
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={isPending}
              onClick={() => {
                setRejecting(false);
                setRejectNote('');
                setError(undefined);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="text-danger text-sm">
          {error}
        </p>
      ) : null}
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}
