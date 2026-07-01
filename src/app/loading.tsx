export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div
        role="status"
        aria-label="Loading"
        className="border-border border-t-accent h-8 w-8 animate-spin rounded-full border-2"
      />
    </main>
  );
}
