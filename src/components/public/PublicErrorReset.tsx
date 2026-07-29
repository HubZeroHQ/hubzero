'use client';

import { PublicStatusPage } from './PublicStatusPage';

export function PublicErrorReset({ reset }: { reset: () => void }) {
  return (
    <PublicStatusPage
      kind="error"
      action={
        <button type="button" onClick={reset} className="public-button-secondary">
          Try again
        </button>
      }
    />
  );
}
