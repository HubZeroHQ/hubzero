import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Shared `loading.tsx` content for every DB-backed marketing index page
 * (Work, Notes, Blueprints, Labs, Team) — one shape reused across all five
 * rather than five hand-tuned skeletons, matching the same "one generic
 * implementation, config/usage differs" discipline the CMS engine applies
 * elsewhere. Shown only for the first navigation into the route; in-place
 * table/filter interactions have their own pending state already.
 */
export function MarketingListSkeleton() {
  return (
    <div className="pt-16 pb-28 sm:pt-20 lg:pt-24">
      <Container>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-4 h-12 w-full max-w-2xl" />
        <Skeleton className="mt-6 h-5 w-full max-w-xl" />
      </Container>
      <Container className="mt-16 lg:mt-20">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex flex-col gap-4">
              <Skeleton className="aspect-[4/3] w-full" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}

/** The `[slug]`/`[username]` detail-page counterpart — a headline block plus a long-form body. */
export function MarketingDetailSkeleton() {
  return (
    <div className="pt-16 pb-28 sm:pt-20 lg:pt-24">
      <Container size="prose">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-4 h-10 w-full" />
        <Skeleton className="mt-2 h-10 w-2/3" />
        <Skeleton className="mt-8 aspect-video w-full" />
        <div className="mt-10 space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-4 w-full" />
          ))}
          <Skeleton className="h-4 w-2/3" />
        </div>
      </Container>
    </div>
  );
}
