import type { Metadata } from 'next';
import { PublicCollectionIndex } from '@/components/public/collections/PublicCollectionIndex';
import { PublicJsonLd } from '@/components/public/PublicJsonLd';
import { PUBLIC_SITE } from '@/config/public-site';
import type { PublicBlueprintSummary } from '@/lib/public/domain';
import { createPublicMetadata } from '@/lib/public/discovery/metadata';
import { breadcrumbJsonLd, collectionPageJsonLd } from '@/lib/public/discovery/structured-data';
import { listPublicSummaries } from '@/lib/public/queries';
import { measureServerOperation } from '@/lib/performance/server';

const description =
  'Reusable, versioned engineering foundations documented through their information architecture, design language, implementation guidance, and evidence.';

export const revalidate = 86_400;

export const metadata: Metadata = createPublicMetadata({
  title: 'Blueprints',
  description,
  path: '/blueprints',
  noIndex: !PUBLIC_SITE.release.live,
});

export default async function BlueprintsIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ architecture?: string | string[]; designLanguage?: string | string[] }>;
}) {
  return measureServerOperation('/blueprints', 'page', () =>
    renderBlueprintsIndexPage(searchParams),
  );
}

async function renderBlueprintsIndexPage(
  searchParams: Promise<{
    architecture?: string | string[];
    designLanguage?: string | string[];
  }>,
) {
  const summaries = await listPublicSummaries('blueprint');
  const blueprints = summaries.filter(
    (summary): summary is PublicBlueprintSummary => summary.type === 'blueprint',
  );
  const architectureFilters = uniqueValues(blueprints, (entry) => entry.architecture);
  const designLanguageFilters = uniqueValues(blueprints, (entry) => entry.designLanguage);
  const requested = await requestedFilters(searchParams);
  const activeArchitecture = architectureFilters.includes(requested.architecture ?? '')
    ? requested.architecture
    : undefined;
  const activeDesignLanguage = designLanguageFilters.includes(requested.designLanguage ?? '')
    ? requested.designLanguage
    : undefined;
  const entries = blueprints.filter(
    (entry) =>
      (!activeArchitecture || entry.architecture === activeArchitecture) &&
      (!activeDesignLanguage || entry.designLanguage === activeDesignLanguage),
  );

  return (
    <>
      <PublicJsonLd
        enabled={PUBLIC_SITE.release.live}
        values={[
          breadcrumbJsonLd([
            { name: 'HubZero', path: '/' },
            { name: 'Blueprints', path: '/blueprints' },
          ]),
          collectionPageJsonLd({
            name: 'HubZero Blueprints',
            description,
            path: '/blueprints',
            entries: blueprints,
          }),
        ]}
      />
      <PublicCollectionIndex
        type="blueprint"
        entries={entries}
        architectureFilters={architectureFilters}
        activeArchitecture={activeArchitecture}
        designLanguageFilters={designLanguageFilters}
        activeDesignLanguage={activeDesignLanguage}
      />
    </>
  );
}

async function requestedFilters(
  searchParams: Promise<{ architecture?: string | string[]; designLanguage?: string | string[] }>,
) {
  const params = await searchParams;
  return {
    architecture: typeof params.architecture === 'string' ? params.architecture : undefined,
    designLanguage: typeof params.designLanguage === 'string' ? params.designLanguage : undefined,
  };
}

function uniqueValues<T>(entries: readonly T[], select: (entry: T) => string): string[] {
  return [...new Set(entries.map(select))].sort((left, right) => left.localeCompare(right));
}
