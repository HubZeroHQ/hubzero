import type { Metadata } from 'next';
import { CollectionPlaceholder } from '@/components/cms/CollectionPlaceholder';

export const metadata: Metadata = { title: 'Blueprints — HubZero CMS' };

export default function BlueprintsPage() {
  return (
    <CollectionPlaceholder
      title="Blueprints"
      description="Browsing, filtering, and editing Blueprints hasn't been built yet (PLANNING.md §38, Phase 9). Launch is gated on at least one real, deployed foundation (§39)."
    />
  );
}
