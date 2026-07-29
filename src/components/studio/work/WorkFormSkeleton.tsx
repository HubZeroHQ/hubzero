import { Skeleton } from '@/components/ui/Skeleton';

/**
 * Shared shape between `new/loading.tsx` and `[id]/edit/loading.tsx` —
 * both routes render the same `WorkForm` layout, so both loading skeletons
 * should match its actual field rhythm (title, slug, a 3-column row, repo
 * URL, relation pickers, submit) rather than each hand-rolling a slightly
 * different approximation, or worse, inheriting the list page's
 * table-shaped skeleton the way this route did before scoped loading
 * files existed.
 */
export function WorkFormSkeleton() {
  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-16 w-full" />
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-11 w-40" />
    </div>
  );
}
