import { Skeleton } from '@/components/ui/Skeleton';

/**
 * Shown inside the shell's content area during route transitions and
 * server data fetches (the Dashboard's repository queries). Matches the
 * general shape of a page: header + a few content blocks
 * (DESIGN_SYSTEM.md §7 — skeletons match the final layout, never a bare
 * centered spinner).
 */
export default function ShellLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="border-border-muted flex flex-col gap-1.5 border-b pb-6">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-40 w-full" />
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}
