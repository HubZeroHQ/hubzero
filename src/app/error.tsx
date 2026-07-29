'use client';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <p className="text-text-muted font-mono text-xs tracking-[0.1em] uppercase">Error</p>
      <p className="text-text-secondary">Something went wrong.</p>
      <button
        onClick={reset}
        className="rounded-control border-border-default text-text-primary hover:bg-surface-elevated border px-4 py-2 text-sm"
      >
        Try again
      </button>
    </main>
  );
}
