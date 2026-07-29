import { Skeleton } from '@/components/ui/Skeleton';
import { WorkFormSkeleton } from '@/components/studio/work/WorkFormSkeleton';

/** Matches the edit view's shape (metadata form + block editor), not the list page's table skeleton it would otherwise inherit. */
export default function EditWorkLoading() {
  return (
    <div className="flex flex-col gap-10">
      <Skeleton className="h-16 w-full" />
      <WorkFormSkeleton />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  );
}
