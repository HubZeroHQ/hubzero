import { Skeleton } from '@/components/ui/Skeleton';

/** Shared shape between `new/loading.tsx` and `[id]/edit/loading.tsx` — both routes render the same `NoteForm` layout (mirrors `BlueprintFormSkeleton`'s reasoning). */
export function NoteFormSkeleton() {
  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-11 w-40" />
    </div>
  );
}
