import type { Metadata } from 'next';
import { PublicCollectionIndex } from '@/components/public/collections/PublicCollectionIndex';
import { PublicJsonLd } from '@/components/public/PublicJsonLd';
import { PUBLIC_SITE } from '@/config/public-site';
import type { PublicTaxonomyTerm, PublicWorkSummary } from '@/lib/public/domain';
import { createPublicMetadata } from '@/lib/public/discovery/metadata';
import { breadcrumbJsonLd, collectionPageJsonLd } from '@/lib/public/discovery/structured-data';
import { listPublicSummaries } from '@/lib/public/queries';

const description =
  'Documented client engineering: the constraints, decisions, implementation, outcomes, and lessons behind HubZero work.';

export const revalidate = 86_400;

export const metadata: Metadata = createPublicMetadata({
  title: 'Work',
  description,
  path: '/work',
  noIndex: !PUBLIC_SITE.release.live,
});

export default async function WorkIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[] }>;
}) {
  const summaries = await listPublicSummaries('work').catch((error) => {
    console.error('Work public index read failed.', error);
    return [] as Awaited<ReturnType<typeof listPublicSummaries>>;
  });
  const work = summaries.filter((summary): summary is PublicWorkSummary => summary.type === 'work');
  const categoryFilters = uniqueCategories(work);
  const requestedCategory = await categoryFrom(searchParams);
  const activeCategory = categoryFilters.some((category) => category.slug === requestedCategory)
    ? requestedCategory
    : undefined;
  const entries = activeCategory
    ? work.filter((entry) => entry.categories.some((category) => category.slug === activeCategory))
    : work;

  return (
    <>
      <PublicJsonLd
        enabled={PUBLIC_SITE.release.live}
        values={[
          breadcrumbJsonLd([
            { name: 'HubZero', path: '/' },
            { name: 'Work', path: '/work' },
          ]),
          collectionPageJsonLd({
            name: 'HubZero Work',
            description,
            path: '/work',
            entries: work,
          }),
        ]}
      />
      <PublicCollectionIndex
        type="work"
        entries={entries}
        categoryFilters={categoryFilters}
        activeCategory={activeCategory}
      />
    </>
  );
}

async function categoryFrom(searchParams: Promise<{ category?: string | string[] }>) {
  const value = (await searchParams).category;
  return typeof value === 'string' ? value : undefined;
}

function uniqueCategories(entries: readonly PublicWorkSummary[]): PublicTaxonomyTerm[] {
  const categories = new Map<string, PublicTaxonomyTerm>();
  for (const entry of entries) {
    for (const category of entry.categories) categories.set(category.slug, category);
  }
  return [...categories.values()].sort((left, right) => left.label.localeCompare(right.label));
}
