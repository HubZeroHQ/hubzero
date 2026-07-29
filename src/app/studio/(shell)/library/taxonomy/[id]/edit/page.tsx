import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ConfirmActionDialog } from '@/components/studio/ConfirmActionDialog';
import { PageHeader } from '@/components/studio/PageHeader';
import { TaxonomyForm } from '@/components/studio/taxonomy/TaxonomyForm';
import { taxonomyRepository } from '@/lib/db/repositories/taxonomy';
import {
  deleteTaxonomyEntryAction,
  updateTaxonomyEntryAction,
} from '@/lib/studio/actions/taxonomy';
import { taxonomyUsage } from '@/lib/studio/safeguards/taxonomy';

export const metadata: Metadata = { title: 'Edit Taxonomy entry — HubZero Studio' };

export default async function EditTaxonomyEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const entry = await taxonomyRepository.findById(id);
  if (!entry) {
    notFound();
  }

  const usage = await taxonomyUsage(id);
  const totalUsage = usage.reduce((sum, source) => sum + source.count, 0);
  const boundUpdateAction = updateTaxonomyEntryAction.bind(null, id);
  const boundDelete = deleteTaxonomyEntryAction.bind(null, id);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={`Edit — ${entry.label}`} />

      <section className="flex flex-col gap-2">
        <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">Usage</h2>
        {totalUsage === 0 ? (
          <p className="text-text-muted text-sm">Not referenced anywhere yet.</p>
        ) : (
          <ul className="text-text-secondary flex flex-col gap-1 text-sm">
            {usage.map((source) => (
              <li key={source.collection}>
                {source.collection}: {source.count}
              </li>
            ))}
          </ul>
        )}
      </section>

      <TaxonomyForm
        action={boundUpdateAction}
        submitLabel="Save changes"
        initialValues={{ kind: entry.kind, label: entry.label, slug: entry.slug }}
      />

      <ConfirmActionDialog
        triggerLabel="Delete entry"
        title="Delete this Taxonomy entry?"
        description={
          totalUsage > 0
            ? `Blocked — still referenced by ${totalUsage} ${totalUsage === 1 ? 'entry' : 'entries'}. Merge it into another entry from the list page first.`
            : 'This permanently removes the entry. This cannot be undone.'
        }
        confirmLabel="Delete"
        action={boundDelete}
      />
    </div>
  );
}
