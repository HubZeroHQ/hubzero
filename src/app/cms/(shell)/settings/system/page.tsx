import type { Metadata } from 'next';
import { CollectionPlaceholder } from '@/components/cms/CollectionPlaceholder';

export const metadata: Metadata = { title: 'System — HubZero CMS' };

export default function SystemSettingsPage() {
  return (
    <CollectionPlaceholder
      title="System"
      description="System-level configuration and integrations management hasn't been built yet."
    />
  );
}
