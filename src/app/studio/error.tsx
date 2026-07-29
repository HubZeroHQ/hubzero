'use client';

import { ErrorState } from '@/components/ui/ErrorState';
import { Button } from '@/components/ui/Button';

/**
 * Catches errors the shell chrome itself can't recover from (e.g. the
 * `(shell)/layout.tsx` session/nav query failing) — full-page fallback
 * since the sidebar/top bar may not have rendered at all.
 */
export default function StudioError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="bg-bg-base flex min-h-screen items-center justify-center px-4">
      <ErrorState
        title="Studio couldn't load."
        description="Something went wrong loading this page."
        action={
          <Button variant="secondary" onClick={reset}>
            Try again
          </Button>
        }
      />
    </main>
  );
}
