import { Skeleton } from '@/components/ui/Skeleton';

/** Matches the detail view's shape (header, status row, hero, tag sections, four documents), not the list page's table skeleton it would otherwise inherit. */
export default function LabDetailLoading() {
  return (
    <div className="flex flex-col gap-8">
      <Skeleton className="h-16 w-full" />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-11 w-64" />
      </div>
      <Skeleton className="aspect-[16/9] w-full" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-full max-w-md" />
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-32 w-full" />
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}
