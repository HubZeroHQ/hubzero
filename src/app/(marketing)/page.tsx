export default function HomePage() {
  return (
    <div className="flex min-h-[calc(100dvh-5rem)] flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-caption text-text-muted font-mono tracking-widest uppercase">HubZero v2</p>
      <h1 className="text-h1 text-text font-semibold">Foundation is live.</h1>
      <p className="text-body text-text-muted max-w-md">
        The production site is under active construction. Public pages ship in the phases that
        follow this foundation.
      </p>
    </div>
  );
}
