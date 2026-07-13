import { Skeleton } from '@/components/ui/Skeleton';
import { WorkFormSkeleton } from '@/components/studio/work/WorkFormSkeleton';

/** Matches the create form's shape (header + stacked fields), not the list page's table skeleton it would otherwise inherit. */
export default function NewWorkLoading() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-16 w-full" />
      <WorkFormSkeleton />
    </div>
  );
}
