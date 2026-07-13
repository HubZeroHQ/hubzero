import type { Metadata } from 'next';
import { CollectionPlaceholder } from '@/components/cms/CollectionPlaceholder';

export const metadata: Metadata = { title: 'Labs — HubZero CMS' };

export default function LabsPage() {
  return (
    <CollectionPlaceholder
      title="Labs"
      description="Browsing, filtering, and editing Labs — including the Graduate to Build action — hasn't been built yet (PLANNING.md §38, Phase 10)."
    />
  );
}
