import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from './PageHeader';

/**
 * The honest stand-in for every nav destination whose real browsing/editing
 * experience hasn't been built yet (PLANNING.md §38 — collection list
 * views, relation pickers, and the Document Engine are later phases).
 * One shared component, one thin route file per destination — never a
 * fabricated table or invented rows.
 */
export function CollectionPlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={title} />
      <EmptyState title="Not built yet" description={description} />
    </div>
  );
}
