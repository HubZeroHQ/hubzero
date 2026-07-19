import type { Metadata } from 'next';
import { PublicStatusPage } from '@/components/public/PublicStatusPage';
import { createPublicMetadata } from '@/lib/public/discovery/metadata';

export const metadata: Metadata = createPublicMetadata({
  title: 'Page not found',
  description: 'The address may have changed, or the page may not be public.',
  path: '/',
  noIndex: true,
});

export default function PublicNotFound() {
  return <PublicStatusPage kind="notFound" />;
}
