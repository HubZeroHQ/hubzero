'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();
  const inFlightRef = useRef(false);

  function handleClick() {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setError(undefined);
    startTransition(async () => {
      try {
        const result = await onGraduate();
        if (result.error) {
          setError(result.error);
        } else {
          // Production success redirects from the Server Action. This refresh
          // covers a successful non-redirecting implementation/test double and
          // keeps the component's mutation contract complete.
          router.refresh();
        }
      } finally {
        inFlightRef.current = false;
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
