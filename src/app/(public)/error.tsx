'use client';

import { useEffect } from 'react';
import { PublicErrorReset } from '@/components/public/PublicErrorReset';

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return <PublicErrorReset reset={reset} />;
}
