import { EmptyState } from '@/components/ui/EmptyState';

/**
 * CMS_PRODUCT_DESIGN.md §3 — "a compact chronological feed of status
 * transitions and edits." No collection in `types/cms.ts`/PLANNING.md §26
 * records that history today (there is no audit-log/activity entity), and
 * introducing one is a data-model change outside Phase 2's scope
 * (CMS_PRODUCT_DESIGN.md's own header: "this document does not change the
 * data model"). Wired up honestly empty rather than fabricated — the feed
 * starts populating the moment an activity log exists to back it.
 */
export function RecentActivityWidget() {
  return (
    <EmptyState
      title="No activity yet"
      description="Status changes and edits across Work, Builds, Blueprints, Labs, and Notes will appear here once entries start moving through the workflow."
    />
  );
}
