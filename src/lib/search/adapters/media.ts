import { mediaRepository } from '@/lib/db/repositories/media';
import type { SearchAdapter, SearchResult } from '../types';

/**
 * CMS_PRODUCT_DESIGN.md §7 — "Media: Alt text, reuse tags, filename." Media
 * carries no `status`/`referenceId` (it isn't a `PublishableEntity`,
 * `types/studio.ts`), so unlike `createContentAdapter`'s five workflow
 * collections this is a small adapter of its own rather than a call into
 * that shared factory.
 */
export const mediaSearchAdapter: SearchAdapter = {
  type: 'media',
  label: 'Media',
  isVisible: () => true,
  async search(query): Promise<SearchResult[]> {
    const assets = await mediaRepository.list();
    const normalizedQuery = query.toLowerCase();

    return assets
      .filter(
        (asset) =>
          asset.altText.toLowerCase().includes(normalizedQuery) ||
          (asset.originalFilename?.toLowerCase().includes(normalizedQuery) ?? false) ||
          asset.reuseTags.some((tag) => tag.toLowerCase().includes(normalizedQuery)),
      )
      .map((asset) => ({
        id: asset._id.toString(),
        type: 'media' as const,
        title: asset.originalFilename ?? asset.altText,
        href: `/studio/library/media/${asset._id.toString()}`,
      }));
  },
};
