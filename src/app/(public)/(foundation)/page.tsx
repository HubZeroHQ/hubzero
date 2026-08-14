import type { Metadata } from 'next';
import { Homepage } from '@/components/public/homepage/Homepage';
import { PUBLIC_SITE } from '@/config/public-site';
import { createPublicMetadata } from '@/lib/public/discovery/metadata';
import type { ImmutablePublic, PublicServiceSummary } from '@/lib/public/domain';
import { getPublicHomepage, listPublicSummaries } from '@/lib/public/queries';

export const revalidate = 86_400;

export const metadata: Metadata = createPublicMetadata({
  description: PUBLIC_SITE.description,
  path: '/',
  noIndex: !PUBLIC_SITE.release.live,
});

export default async function PublicRoot() {
  const [projection, serviceSummaries] = await Promise.all([
    getPublicHomepage(),
    listPublicSummaries('service'),
  ]);
  const services = serviceSummaries.filter(
    (entry): entry is ImmutablePublic<PublicServiceSummary> =>
      entry.type === 'service' && entry.evidence.length > 0,
  );
  return <Homepage projection={projection} services={services} />;
}
