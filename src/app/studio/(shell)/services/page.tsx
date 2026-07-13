import type { Metadata } from 'next';
import { CollectionPlaceholder } from '@/components/studio/CollectionPlaceholder';

export const metadata: Metadata = { title: 'Services — HubZero Studio' };

export default function ServicesPage() {
  return (
    <CollectionPlaceholder
      title="Services"
      description="Browsing and editing Services and their evidence links hasn't been built yet (PLANNING.md §38, Phase 11)."
    />
  );
}
