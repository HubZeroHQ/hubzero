import type { Metadata } from 'next';
import { CollectionPlaceholder } from '@/components/cms/CollectionPlaceholder';

export const metadata: Metadata = { title: 'Work — HubZero CMS' };

export default function WorkPage() {
  return (
    <CollectionPlaceholder
      title="Work"
      description="Browsing, filtering, and editing Work entries hasn't been built yet (PLANNING.md §38, Phase 7). The Work collection and its publishing workflow already exist behind this screen."
    />
  );
}
