'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/Button';
import type { EntryActionState } from '@/lib/studio/entry-actions';

/**
 * CMS_PRODUCT_DESIGN.md Appendix A — "an explicit 'Graduate to Build'
 * action... not a manual create-new-Build-and-link workflow." Mirrors
 * `StatusStepper`'s client-transition pattern (a plain button invoking a
 * bound Server Action, `useTransition` for pending state) rather than a form,
 * since graduation takes no input — the action itself redirects to the new
 * Build on success (`lib/studio/actions/lab.ts`).
 */
export function GraduateToBuildButton({
  onGraduate,
}: {
  onGraduate: () => Promise<EntryActionState>;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();

  function handleClick() {
    setError(undefined);
    startTransition(async () => {
      const result = await onGraduate();
      if (result.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <Button type="button" variant="secondary" disabled={isPending} onClick={handleClick}>
        {isPending ? 'Graduating…' : 'Graduate to Build'}
      </Button>
      {error ? (
        <p role="alert" className="text-danger text-sm">
          {error}
        </p>
      ) : null}
    </div>
  );
}
