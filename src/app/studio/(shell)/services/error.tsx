'use client';

import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';

export default function ServicesError({ reset }: { error: Error; reset: () => void }) {
  return (
    <ErrorState
      title="Services couldn't load."
      description="Something went wrong loading this collection. Try again, or use the sidebar to go somewhere else."
      action={
        <Button variant="secondary" onClick={reset}>
          Try again
        </Button>
      }
    />
  );
}
