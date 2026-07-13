import type { Metadata } from 'next';
import { CollectionPlaceholder } from '@/components/cms/CollectionPlaceholder';

export const metadata: Metadata = { title: 'Builds — HubZero CMS' };

export default function BuildsPage() {
  return (
    <CollectionPlaceholder
      title="Builds"
      description="Browsing, filtering, and editing Builds hasn't been built yet (PLANNING.md §38, Phase 8). The Builds collection and its two-Document structure already exist behind this screen."
    />
  );
}
