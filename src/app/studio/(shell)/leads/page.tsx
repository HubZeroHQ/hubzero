import type { Metadata } from 'next';
import { CollectionPlaceholder } from '@/components/studio/CollectionPlaceholder';

export const metadata: Metadata = { title: 'Leads — HubZero Studio' };

export default function LeadsPage() {
  return (
    <CollectionPlaceholder
      title="Leads"
      description="The Leads inbox — triage, assignment, and status — hasn't been built yet (PLANNING.md §38, Phase 12). New leads already surface on the Dashboard."
    />
  );
}
