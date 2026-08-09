import type { Metadata } from 'next';
import { PublicCollectionIndex } from '@/components/public/collections/PublicCollectionIndex';
import { PublicJsonLd } from '@/components/public/PublicJsonLd';
import { PUBLIC_SITE } from '@/config/public-site';
import type { PublicLabSummary } from '@/lib/public/domain';
import { createPublicMetadata } from '@/lib/public/discovery/metadata';
import { breadcrumbJsonLd, collectionPageJsonLd } from '@/lib/public/discovery/structured-data';
import { listPublicSummaries } from '@/lib/public/queries';
import { measureServerOperation } from '@/lib/performance/server';

const description =
  'Active HubZero engineering investigations with explicit stages, dated progress, technical evidence, and graduation criteria.';

export const revalidate = 86_400;

export const metadata: Metadata = createPublicMetadata({
  title: 'Labs',
  description,
  path: '/labs',
  noIndex: !PUBLIC_SITE.release.live,
});

export default async function LabsIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string | string[] }>;
}) {
  return measureServerOperation('/labs', 'page', () => renderLabsIndexPage(searchParams));
}

async function renderLabsIndexPage(searchParams: Promise<{ stage?: string | string[] }>) {
  const summaries = await listPublicSummaries('lab').catch((error) => {
    console.error('Labs public index read failed.', error);
    return [] as Awaited<ReturnType<typeof listPublicSummaries>>;
  });
  const labs = summaries.filter((summary): summary is PublicLabSummary => summary.type === 'lab');
  const stageFilters = [...new Set(labs.map((entry) => entry.stage))].sort(
    (left, right) => STAGE_ORDER.indexOf(left) - STAGE_ORDER.indexOf(right),
  );
  const requestedStage = await stageFrom(searchParams);
  const activeStage = stageFilters.includes(requestedStage as PublicLabSummary['stage'])
    ? requestedStage
    : undefined;
  const entries = activeStage ? labs.filter((entry) => entry.stage === activeStage) : labs;

  return (
    <>
      <PublicJsonLd
        enabled={PUBLIC_SITE.release.live}
        values={[
          breadcrumbJsonLd([
            { name: 'HubZero', path: '/' },
            { name: 'Labs', path: '/labs' },
          ]),
          collectionPageJsonLd({
            name: 'HubZero Labs',
            description,
            path: '/labs',
            entries: labs,
          }),
        ]}
      />
      <PublicCollectionIndex
        type="lab"
        entries={entries}
        stageFilters={stageFilters}
        activeStage={activeStage}
      />
    </>
  );
}

const STAGE_ORDER: readonly PublicLabSummary['stage'][] = ['exploring', 'building', 'testing'];

async function stageFrom(searchParams: Promise<{ stage?: string | string[] }>) {
  const value = (await searchParams).stage;
  return typeof value === 'string' ? value : undefined;
}
