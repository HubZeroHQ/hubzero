import type { Metadata } from 'next';
import { PublicCollectionIndex } from '@/components/public/collections/PublicCollectionIndex';
import { PublicJsonLd } from '@/components/public/PublicJsonLd';
import { PUBLIC_SITE } from '@/config/public-site';
import type { PublicBuildSummary } from '@/lib/public/domain';
import { createPublicMetadata } from '@/lib/public/discovery/metadata';
import { breadcrumbJsonLd, collectionPageJsonLd } from '@/lib/public/discovery/structured-data';
import { listPublicSummaries } from '@/lib/public/queries';

const description =
  'Finished products created by HubZero, documented through their current state, architecture, decisions, and technical evidence.';

export const revalidate = 86_400;

export const metadata: Metadata = createPublicMetadata({
  title: 'Builds',
  description,
  path: '/builds',
  noIndex: !PUBLIC_SITE.release.live,
});

export default async function BuildsIndexPage() {
  const summaries = await listPublicSummaries('build').catch((error) => {
    console.error('Builds public index read failed.', error);
    return [] as Awaited<ReturnType<typeof listPublicSummaries>>;
  });
  const builds = summaries.filter(
    (summary): summary is PublicBuildSummary => summary.type === 'build',
  );
  return (
    <>
      <PublicJsonLd
        enabled={PUBLIC_SITE.release.live}
        values={[
          breadcrumbJsonLd([
            { name: 'HubZero', path: '/' },
            { name: 'Builds', path: '/builds' },
          ]),
          collectionPageJsonLd({
            name: 'HubZero Builds',
            description,
            path: '/builds',
            entries: builds,
          }),
        ]}
      />
      <PublicCollectionIndex type="build" entries={builds} />
    </>
  );
}
