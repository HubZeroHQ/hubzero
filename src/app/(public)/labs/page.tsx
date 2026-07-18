import type { Metadata } from 'next';
import { PublicCollectionIndex } from '@/components/public/collections/PublicCollectionIndex';
import { PublicJsonLd } from '@/components/public/PublicJsonLd';
import { PUBLIC_SITE } from '@/config/public-site';
import type { PublicLabSummary } from '@/lib/public/domain';
import { createPublicMetadata } from '@/lib/public/discovery/metadata';
import { breadcrumbJsonLd, collectionPageJsonLd } from '@/lib/public/discovery/structured-data';
import { listPublicSummaries } from '@/lib/public/queries';

const description =
  'Active HubZero engineering investigations with explicit stages, dated progress, technical evidence, and graduation criteria.';

export const revalidate = 86_400;

export const metadata: Metadata = createPublicMetadata({
  title: 'Labs',
  description,
  path: '/labs',
  noIndex: !PUBLIC_SITE.release.live,
});

export default async function LabsIndexPage() {
  const summaries = await listPublicSummaries('lab');
  const labs = summaries.filter((summary): summary is PublicLabSummary => summary.type === 'lab');
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
      <PublicCollectionIndex type="lab" entries={labs} />
    </>
  );
}
