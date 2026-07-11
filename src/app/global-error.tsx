"use client";

import { useEffect } from "react";

/**
 * Next's own root-layout error boundary — `error.tsx` can't catch a throw
 * inside `layout.tsx` itself (the root layout renders `error.tsx`'s own
 * parent boundary), so without this file a root-layout crash falls through
 * to Next's unstyled default error screen. Must render its own `<html>`/
 * `<body>` since it replaces the root layout entirely when it's active.
 */
export default function GlobalError({
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
    <html lang="en">
      <body className="font-sans antialiased">
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="text-caption text-text-muted font-mono tracking-widest uppercase">Error</p>
          <h1 className="text-h2 text-text font-semibold">Something went wrong.</h1>
          <p className="text-body text-text-muted max-w-md">
            An unexpected error occurred. Try again, or come back later.
          </p>
          <button
            type="button"
            onClick={reset}
            className="border-border text-body text-text hover:border-accent hover:text-accent-text focus-visible:outline-accent mt-2 rounded-full border px-5 py-2 transition-colors focus-visible:outline-2"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
