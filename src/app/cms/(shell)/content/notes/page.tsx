import type { Metadata } from 'next';
import { CollectionPlaceholder } from '@/components/cms/CollectionPlaceholder';

export const metadata: Metadata = { title: 'Notes — HubZero CMS' };

export default function NotesPage() {
  return (
    <CollectionPlaceholder
      title="Notes"
      description="Browsing, filtering, and editing the engineering journal hasn't been built yet. The public /notes route is phased in separately once real published content exists (PLANNING.md §14, §38 Phase 14)."
    />
  );
}
