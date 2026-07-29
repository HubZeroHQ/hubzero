import Link from 'next/link';

/** Shown only while Next.js Draft Mode is enabled (Experience v3 Preview Integrity milestone) — a visitor never has the cookie that turns this on. */
export function PreviewBanner() {
  return (
    <div className="public-preview-banner" role="status">
      <p>
        Preview — viewing this page as it will look once published. Not visible to visitors yet.
      </p>
      <Link href="/api/preview/exit">Exit preview</Link>
    </div>
  );
}
