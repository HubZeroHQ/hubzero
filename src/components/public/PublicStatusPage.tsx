import Link from 'next/link';

const COPY = {
  notFound: {
    code: '404',
    title: 'This page is not available.',
    description: 'The address may have changed, or the page may not be public.',
  },
  unavailable: {
    code: 'Unavailable',
    title: 'This surface is temporarily unavailable.',
    description: 'Try again shortly. No public content has been changed.',
  },
  error: {
    code: 'Error',
    title: 'The page could not be loaded.',
    description: 'Try the request again. If it persists, return to the previous page.',
  },
} as const;

export function PublicStatusPage({
  kind,
  action,
}: {
  kind: keyof typeof COPY;
  action?: React.ReactNode;
}) {
  const copy = COPY[kind];
  return (
    <main id="main-content" tabIndex={-1} className="public-status-main">
      <div className="public-container public-status-grid">
        <p className="public-eyebrow">{copy.code}</p>
        <div className="public-status-copy">
          <h1>{copy.title}</h1>
          <p>{copy.description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            {action ?? (
              <Link href="/" className="public-button-secondary">
                Return to HubZero
              </Link>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
