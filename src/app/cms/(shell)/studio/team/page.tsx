import type { Metadata } from 'next';
import { CollectionPlaceholder } from '@/components/cms/CollectionPlaceholder';

export const metadata: Metadata = { title: 'Team — HubZero CMS' };

export default function TeamPage() {
  return (
    <CollectionPlaceholder
      title="Team"
      description="Browsing and editing public Team profiles hasn't been built yet (PLANNING.md §38, Phase 6)."
    />
  );
}
