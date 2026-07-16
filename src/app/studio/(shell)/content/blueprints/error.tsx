'use client';

import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';

/** Scoped to the Blueprints section so a failure here doesn't take down the whole shell boundary. */
export default function BlueprintsError({ reset }: { error: Error; reset: () => void }) {
  return (
    <ErrorState
      title="Blueprints couldn't load."
      description="Something went wrong loading this collection. Try again, or use the sidebar to go somewhere else."
      action={
        <Button variant="secondary" onClick={reset}>
          Try again
        </Button>
      }
    />
  );
}
