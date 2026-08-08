'use client';

import { useEffect, useRef, useState } from 'react';
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

type WorkflowState = {
  status: PublishStatus;
  availableTransitions: PublishStatus[];
  canUnpublishOverride: boolean;
  canReject: boolean;
  reviewNote?: string | null;
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
  onTransition: (
    to: PublishStatus,
    note?: string,
  ) => Promise<{
    error?: string;
    workflow?: WorkflowState;
  }>;
}) {
  const [error, setError] = useState<string | undefined>();
  const [announcement, setAnnouncement] = useState<string | undefined>();
  const [rejecting, setRejecting] = useState(false);
  const [rejectNote, setRejectNote] = useState('');
  const serverWorkflow = {
    status,
    availableTransitions,
    canUnpublishOverride,
    canReject,
    reviewNote,
  };
  const [workflow, setWorkflow] = useState<WorkflowState>(serverWorkflow);

  // Route props remain canonical. The success payload below is also produced
  // on the server and bridges the period before a refreshed RSC payload lands.
  useEffect(() => {
    setWorkflow({ status, availableTransitions, canUnpublishOverride, canReject, reviewNote });
  }, [status, availableTransitions, canUnpublishOverride, canReject, reviewNote]);

  /**
   * Which action is currently running, keyed by the button that started it —
   * so the button the editor pressed can show progress while the others
   * simply wait (v3.1 Milestone 10).
   */
  const [runningAction, setRunningAction] = useState<string | null>(null);

  /**
   * The duplicate-click guard, and the reason it is a ref rather than
   * `runningAction`.
   *
   * `isPending`/state flip on the *next* render, so several clicks dispatched
   * before React re-renders all pass a state-based check — five rapid clicks
   * on "Submit for review" previously fired five Server Actions, and the four
   * that lost the race reported `"inReview" cannot move directly to
   * "inReview"` over a transition that had actually succeeded. A ref is
   * written synchronously inside the click handler, so the second click in the
   * same tick already sees it.
   */
  const inFlight = useRef(false);

  const busy = runningAction !== null;

  function handleTransition(key: string, to: PublishStatus, note?: string) {
    if (inFlight.current) return;
    inFlight.current = true;
    setRunningAction(key);
    setError(undefined);

    void (async () => {
      try {
        const result = await onTransition(to, note);

        if (result?.error) {
          setError(result.error);
          // The server refused. That usually means the entry has already moved
          // on — another tab, another editor — so the stale buttons this
          // component is still showing are exactly what caused the refusal.
          // Refreshing resynchronises them instead of leaving the editor
          // clicking a button that can no longer work.
          return;
        }

        // Announced via `aria-live` below — a screen-reader user triggering a
        // transition otherwise has no non-visual signal that it succeeded.
        if (result.workflow) {
          setWorkflow(result.workflow);
        }
        setAnnouncement(transitionAnnouncement(workflow.status, to));
        setRejecting(false);
        setRejectNote('');
      } catch {
        // A Server Action that never resolves cleanly (a dropped connection, a
        // 503 on the way out) must not leave the workflow frozen. The entry's
        // real state is whatever the server has; say so and let the editor
        // retry rather than silently claiming success.
        setError('That action could not be completed. Check the entry’s status and try again.');
      } finally {
        // The single reason the interface can never stay permanently disabled:
        // every path out of this function — success, refusal, or throw —
        // releases the controls.
        inFlight.current = false;
        setRunningAction(null);
      }
    })();
  }

  function labelFor(key: string, fallback: string): string {
    return runningAction === key ? 'Working…' : fallback;
  }

  function handleConfirmReject() {
    if (!rejectNote.trim()) {
      setError('A rejection reason is required.');
      return;
    }
    handleTransition('reject', 'draft', rejectNote);
  }

  return (
    <div className="flex flex-col gap-2">
      {workflow.reviewNote ? (
        <div className="border-danger/40 bg-danger/5 rounded-md border p-3 text-sm">
          <p className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">
            Reviewer feedback
          </p>
          <p className="text-text-secondary mt-1">{workflow.reviewNote}</p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <StatusIndicator status={workflow.status} />
        {/*
          Every transition mutates the same `status`, so while one is running
          the others are not "unrelated controls" that happen to be disabled —
          starting a second one is the race that produces the stale-transition
          error. They are blocked deliberately; only the button actually
          running reports progress, so the editor can tell which is which.
        */}
        {workflow.availableTransitions.map((to) => (
          <Button
            key={to}
            type="button"
            variant={to === 'published' ? 'primary' : 'secondary'}
            disabled={busy}
            aria-busy={runningAction === to}
            onClick={() => handleTransition(to, to)}
          >
            {labelFor(to, transitionLabel(workflow.status, to))}
          </Button>
        ))}
        {workflow.canReject && !rejecting ? (
          <Button type="button" variant="ghost" disabled={busy} onClick={() => setRejecting(true)}>
            Reject
          </Button>
        ) : null}
        {workflow.canUnpublishOverride && !workflow.canReject ? (
          <Button
            type="button"
            variant="ghost"
            disabled={busy}
            aria-busy={runningAction === 'unpublish'}
            onClick={() => handleTransition('unpublish', 'draft')}
          >
            {labelFor('unpublish', 'Unpublish to draft')}
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
              disabled={busy}
              aria-busy={runningAction === 'reject'}
              onClick={handleConfirmReject}
            >
              {labelFor('reject', 'Confirm rejection')}
            </Button>
            {/*
              Cancel stays live while a rejection is submitting: it is genuinely
              unrelated — it closes a local form rather than touching the
              server — and an editor who changes their mind should never be
              stuck waiting on a request to back out of a text box.
            */}
            <Button
              type="button"
              variant="ghost"
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
