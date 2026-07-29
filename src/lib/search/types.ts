import type { PublishStatus, ServicePublishStatus, UserRole } from '@/types/studio';

/**
 * The entity types the Studio search index understands today
 * (CMS_PRODUCT_DESIGN.md §7). Deliberately narrower than every collection
 * in `types/studio.ts` — Taxonomy and full-text Document search remain
 * named extension points for a later phase (a heavier full-text query this
 * shell doesn't build), not omissions the registry pattern below can't
 * already accommodate. Media joined in Phase 5 (`adapters/media.ts`),
 * matched by alt text/reuse tags/filename per §7's table.
 */
export type SearchEntityType =
  | 'work'
  | 'builds'
  | 'blueprints'
  | 'labs'
  | 'notes'
  | 'engineeringProfiles'
  | 'team'
  | 'services'
  | 'leads'
  | 'users'
  | 'media';

export interface SearchResult {
  id: string;
  type: SearchEntityType;
  title: string;
  subtitle?: string;
  referenceId?: string;
  status?: PublishStatus | ServicePublishStatus;
  href: string;
}

export interface SearchContext {
  role: UserRole;
  userId: string;
}

/**
 * The extension point named in the Phase 2 brief: a future collection
 * joins search by writing one of these and registering it
 * (`registerSearchAdapter`) — the aggregation engine in `registry.ts`
 * never needs to change.
 */
export interface SearchAdapter {
  type: SearchEntityType;
  label: string;
  /** Whether this adapter runs at all for the current viewer (e.g. Users is Head Admin only, §8). */
  isVisible(ctx: SearchContext): boolean;
  search(query: string, ctx: SearchContext): Promise<SearchResult[]>;
}
