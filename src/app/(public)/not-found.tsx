import type { Metadata } from 'next';
import { PublicStatusPage } from '@/components/public/PublicStatusPage';

export const metadata: Metadata = {
  title: 'Page not found',
  description: 'The address may have changed, or the page may not be public.',
};

export default function PublicNotFound() {
  return <PublicStatusPage kind="notFound" />;
}
