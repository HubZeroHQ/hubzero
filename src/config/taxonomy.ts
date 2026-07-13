import type { TaxonomyKind } from '@/types/cms';

/** PLANNING.md §26.11 — the discriminator that lets one collection power distinct filter facets. */
export const TAXONOMY_KINDS: readonly TaxonomyKind[] = ['technology', 'category', 'topic'];
