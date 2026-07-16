import { Skeleton } from '@/components/ui/Skeleton';
import { BuildFormSkeleton } from '@/components/studio/builds/BuildFormSkeleton';

/** Matches the edit view's shape (metadata form + two-document tab strip), not the list page's table skeleton it would otherwise inherit. */
export default function EditBuildLoading() {
  return (
    <div className="flex flex-col gap-10">
      <Skeleton className="h-16 w-full" />
      <BuildFormSkeleton />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  );
}
