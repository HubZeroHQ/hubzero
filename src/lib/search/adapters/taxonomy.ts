import { taxonomyRepository } from '@/lib/db/repositories/taxonomy';
import type { SearchAdapter, SearchResult } from '../types';

/**
 * Taxonomy — the extension point `types.ts` named and left open.
 *
 * Not built on `createContentAdapter`: a Taxonomy entry has no publish
 * workflow and no reference ID, so reusing the publishable factory would mean
 * inventing a status for it. Its `kind` (technology / category / topic) is
 * surfaced as the subtitle, which is also what makes two same-named entries of
 * different kinds distinguishable in a result list.
 */
export const taxonomySearchAdapter: SearchAdapter = {
  type: 'taxonomy',
  label: 'Taxonomy',
  isVisible: () => true,
  async search(query): Promise<SearchResult[]> {
    const entries = await taxonomyRepository.list();
    const normalized = query.toLowerCase();

    return entries
      .filter(
        (entry) =>
          entry.label.toLowerCase().includes(normalized) ||
          entry.slug.toLowerCase().includes(normalized),
      )
      .map((entry) => ({
        id: entry._id.toString(),
        type: 'taxonomy' as const,
        title: entry.label,
        subtitle: entry.kind,
        slug: entry.slug,
        updatedAt: entry.updatedAt.toISOString(),
        href: `/studio/library/taxonomy/${entry._id.toString()}/edit`,
      }));
  },
};
