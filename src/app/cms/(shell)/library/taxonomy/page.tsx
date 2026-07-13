import type { Metadata } from 'next';
import { CollectionPlaceholder } from '@/components/cms/CollectionPlaceholder';

export const metadata: Metadata = { title: 'Taxonomy — HubZero CMS' };

export default function TaxonomyPage() {
  return (
    <CollectionPlaceholder
      title="Taxonomy"
      description="Managing shared tags, categories, and technologies hasn't been built yet (PLANNING.md §26.11)."
    />
  );
}
