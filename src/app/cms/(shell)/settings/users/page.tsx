import type { Metadata } from 'next';
import { CollectionPlaceholder } from '@/components/cms/CollectionPlaceholder';

export const metadata: Metadata = { title: 'Users — HubZero CMS' };

export default function UsersSettingsPage() {
  return (
    <CollectionPlaceholder
      title="Users"
      description="Managing CMS users and roles hasn't been built yet (PLANNING.md §26.9, §29)."
    />
  );
}
