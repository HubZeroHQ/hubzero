import { Link } from "@/components/ui";

/**
 * Studio-scoped 404 — without this, a bad `/studio/**` id (e.g. a stale
 * bookmark to a deleted Case Study) falls through to the root `not-found.tsx`,
 * which drops the Studio shell entirely and links back to the public
 * homepage instead of `/studio`. This one renders inside
 * `studio/(protected)/layout.tsx`, so the sidebar/topbar stay intact.
 */
export default function StudioNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-24 text-center">
      <p className="text-caption text-text-muted font-mono tracking-widest uppercase">404</p>
      <h1 className="text-h2 text-text font-semibold">Not found.</h1>
      <p className="text-body text-text-muted max-w-md">
        That item doesn&apos;t exist, or it may have been deleted.
      </p>
      <Link
        href="/studio"
        className="border-border text-body text-text hover:border-accent hover:text-accent-text mt-2 rounded-full border px-5 py-2 no-underline transition-colors hover:no-underline"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
