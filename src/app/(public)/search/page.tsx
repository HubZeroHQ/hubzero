import type { Metadata } from 'next';
import { SearchPage } from '@/components/public/search/SearchPage';
import { createPublicMetadata } from '@/lib/public/discovery/metadata';
import type { PublicSearchResult } from '@/lib/public/discovery/search';
import { searchPublicContent } from '@/lib/public/queries';

export const metadata: Metadata = createPublicMetadata({
  title: 'Search',
  description: 'Search the published HubZero engineering record.',
  path: '/search',
  noIndex: true,
});

export default async function PublicSearchRoute({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const parameters = await searchParams;
  const rawQuery = Array.isArray(parameters.q) ? parameters.q[0] : parameters.q;
  const query = (rawQuery ?? '').trim().slice(0, 120);
  let results: PublicSearchResult[] = [];
  let unavailable = false;

  if (query) {
    try {
      results = await searchPublicContent(query, 48);
    } catch (error) {
      console.error('Public search route failed', error);
      unavailable = true;
    }
  }

  return <SearchPage query={query} results={results} unavailable={unavailable} />;
}
