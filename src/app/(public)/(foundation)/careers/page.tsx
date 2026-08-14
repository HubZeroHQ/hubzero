import type { Metadata } from 'next';
import { Careers } from '@/components/public/careers/Careers';
import { PublicJsonLd } from '@/components/public/PublicJsonLd';
import { PUBLIC_SITE } from '@/config/public-site';
import type { PublicCareerSummary } from '@/lib/public/domain';
import { createPublicMetadata } from '@/lib/public/discovery/metadata';
import { breadcrumbJsonLd, collectionPageJsonLd } from '@/lib/public/discovery/structured-data';
import { listPublicSummaries } from '@/lib/public/queries';

const description =
  'Open roles at HubZero and how hiring works here — reviewed by a person, tied to real current need.';

export const revalidate = 86_400;

export const metadata: Metadata = createPublicMetadata({
  title: 'Careers',
  description,
  path: '/careers',
  noIndex: !PUBLIC_SITE.release.live,
});

export default async function CareersIndexPage() {
  const summaries = await listPublicSummaries('career');
  const openings = summaries.filter(
    (summary): summary is PublicCareerSummary => summary.type === 'career',
  );

  return (
    <>
      <PublicJsonLd
        enabled={PUBLIC_SITE.release.live}
        values={[
          breadcrumbJsonLd([
            { name: 'HubZero', path: '/' },
            { name: 'Careers', path: '/careers' },
          ]),
          collectionPageJsonLd({
            name: 'HubZero Careers',
            description,
            path: '/careers',
            entries: openings,
          }),
        ]}
      />
      <Careers openings={openings} />
    </>
  );
}
