import { Skeleton } from '@/components/ui/Skeleton';

/** Matches the detail view's shape (header, status row, tag sections, case study), not the list page's table skeleton it would otherwise inherit. */
export default function WorkDetailLoading() {
  return (
    <div className="flex flex-col gap-8">
      <Skeleton className="h-16 w-full" />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-11 w-64" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-full max-w-md" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-full max-w-md" />
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}
