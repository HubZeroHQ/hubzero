'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/Button';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import type { PublishStatus } from '@/types/cms';

const TRANSITION_LABEL: Record<PublishStatus, string> = {
  draft: 'Save as draft',
  inReview: 'Submit for review',
  approved: 'Approve',
  published: 'Publish',
  archived: 'Archive',
};

/**
 * CMS_PRODUCT_DESIGN.md §5/§30 — "the status stepper shows only the
 * transition(s) valid for the acting role, never a five-option dropdown."
 * `availableTransitions`/`canUnpublishOverride` are computed server-side
 * (`lib/cms/workflow-permissions.ts`) from the viewer's role, so this
 * component never re-derives permission logic itself — it only renders
 * whatever the server already decided the viewer may do.
 */
export function StatusStepper({
  status,
  availableTransitions,
  canUnpublishOverride,
  onTransition,
}: {
  status: PublishStatus;
  availableTransitions: PublishStatus[];
  canUnpublishOverride: boolean;
  onTransition: (to: PublishStatus) => Promise<{ error?: string }>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();

  function handleTransition(to: PublishStatus) {
    setError(undefined);
    startTransition(async () => {
      const result = await onTransition(to);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-2">
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
            {TRANSITION_LABEL[to]}
          </Button>
        ))}
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
      {error ? (
        <p role="alert" className="text-danger text-sm">
          {error}
        </p>
      ) : null}
    </div>
  );
}
