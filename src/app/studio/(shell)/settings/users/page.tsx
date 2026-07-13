import type { Metadata } from 'next';
import { CollectionPlaceholder } from '@/components/studio/CollectionPlaceholder';

export const metadata: Metadata = { title: 'Users — HubZero Studio' };

export default function UsersSettingsPage() {
  return (
    <CollectionPlaceholder
      title="Users"
      description="Managing Studio users and roles hasn't been built yet (PLANNING.md §26.9, §29)."
    />
  );
}
