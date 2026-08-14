import type { Metadata } from 'next';
import { RootDocument } from '@/app/root-document';
import { PublicShell } from '@/components/public/PublicShell';
import { PublicStatusPage } from '@/components/public/PublicStatusPage';

export const metadata: Metadata = {
  title: 'Page not found — HubZero',
  description: 'The address may have changed, or the page may not be public.',
};

/** Complete routing-level 404 for HubZero's independent public and Studio roots. */
export default function GlobalNotFound() {
  return (
    <RootDocument>
      <PublicShell>
        <PublicStatusPage kind="notFound" />
      </PublicShell>
    </RootDocument>
  );
}
