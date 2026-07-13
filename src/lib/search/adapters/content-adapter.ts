import type { ObjectId } from 'mongodb';
import type { PublishStatus } from '@/types/studio';
import type { SearchAdapter, SearchEntityType, SearchResult } from '../types';

interface PublishableSearchable {
  _id: ObjectId;
  slug: string;
  status: PublishStatus;
}

/**
 * Shared factory for the five workflow-driven Content collections (Work,
 * Builds, Blueprints, Labs, Notes) — every one of them is a
 * `PublishableEntity` (§24) searched the same way (title/slug/reference ID,
 * every status visible per §7's Studio-vs-public-index distinction). Visible
 * to every authenticated role: Team Members have full read transparency
 * into Content (§8).
 */
export function createContentAdapter<T extends PublishableSearchable>(config: {
  type: SearchEntityType;
  label: string;
  /** A static list-page link, or a per-entry link once that collection has a detail route (Work, §38 Phase 3). */
  href: string | ((entry: T) => string);
  list: () => Promise<T[]>;
  getTitle: (entry: T) => string;
  getReferenceId?: (entry: T) => string | undefined;
}): SearchAdapter {
  return {
    type: config.type,
    label: config.label,
    isVisible: () => true,
    async search(query): Promise<SearchResult[]> {
      const entries = await config.list();
      const normalizedQuery = query.toLowerCase();

      return entries
        .filter((entry) => {
          const title = config.getTitle(entry).toLowerCase();
          const referenceId = config.getReferenceId?.(entry)?.toLowerCase() ?? '';
          return (
            title.includes(normalizedQuery) ||
            entry.slug.toLowerCase().includes(normalizedQuery) ||
            referenceId.includes(normalizedQuery)
          );
        })
        .map((entry) => ({
          id: entry._id.toString(),
          type: config.type,
          title: config.getTitle(entry),
          referenceId: config.getReferenceId?.(entry),
          status: entry.status,
          href: typeof config.href === 'function' ? config.href(entry) : config.href,
        }));
    },
  };
}
