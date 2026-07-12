"use client";

import { useEffect } from "react";

import { Link } from "@/components/ui";

/**
 * Studio-scoped error boundary — a CMS crash reads as an internal/admin
 * error, not the public-site error page, and points back into `/studio`
 * instead of the marketing homepage.
 */
export default function StudioError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-24 text-center">
      <p className="text-caption text-text-muted font-mono tracking-widest uppercase">Error</p>
      <h1 className="text-h2 text-text font-semibold">Something went wrong.</h1>
      <p className="text-body text-text-muted max-w-md">
        An unexpected error occurred in Studio. Try again, or go back to the dashboard.
      </p>
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="border-border text-body text-text hover:border-accent hover:text-accent-text rounded-full border px-5 py-2 transition-colors"
        >
          Try again
        </button>
        <Link href="/studio" className="text-body">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
