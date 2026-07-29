import type { Metadata } from 'next';
import { PageHeader } from '@/components/studio/PageHeader';
import { TaxonomyForm } from '@/components/studio/taxonomy/TaxonomyForm';
import { createTaxonomyEntryAction } from '@/lib/studio/actions/taxonomy';

export const metadata: Metadata = { title: 'New Taxonomy entry — HubZero Studio' };

export default function NewTaxonomyEntryPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="New Taxonomy entry" />
      <TaxonomyForm action={createTaxonomyEntryAction} submitLabel="Create entry" />
    </div>
  );
}
