import { Skeleton } from '@/components/ui/Skeleton';

/** Matches the list page's shape (header, toolbar, table rows) rather than a generic centered spinner. */
export default function NotesListLoading() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-10 w-64" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-11 w-full" />
        ))}
      </div>
    </div>
  );
}
