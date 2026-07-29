import { Skeleton } from '@/components/ui/Skeleton';
import { BuildFormSkeleton } from '@/components/studio/builds/BuildFormSkeleton';

/** Matches the create form's shape (header + stacked fields), not the list page's table skeleton it would otherwise inherit. */
export default function NewBuildLoading() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-16 w-full" />
      <BuildFormSkeleton />
    </div>
  );
}
