'use client';

import { ErrorState } from '@/components/ui/ErrorState';
import { Button } from '@/components/ui/Button';

/** Catches errors from a CMS page while the shell chrome (sidebar/top bar) stays mounted around it. */
export default function ShellError({ reset }: { error: Error; reset: () => void }) {
  return (
    <ErrorState
      description="This screen couldn't load. Try again, or use the sidebar to go somewhere else."
      action={
        <Button variant="secondary" onClick={reset}>
          Try again
        </Button>
      }
    />
  );
}
