import type { Metadata } from 'next';
import { PublicShell } from '@/components/public/PublicShell';
import { PublicStatusPage } from '@/components/public/PublicStatusPage';
import { createPublicMetadata } from '@/lib/public/discovery/metadata';

export const metadata: Metadata = createPublicMetadata({
  title: 'Page not found',
  description: 'The address may have changed, or the page may not be public.',
  path: '/',
  noIndex: true,
});

export default function NotFound() {
  return (
    <PublicShell>
      <PublicStatusPage kind="notFound" />
    </PublicShell>
  );
}
