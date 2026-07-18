import type { Metadata } from 'next';
import { Homepage } from '@/components/public/homepage/Homepage';
import { PUBLIC_SITE } from '@/config/public-site';
import { createPublicMetadata } from '@/lib/public/discovery/metadata';
import type {
  ImmutablePublic,
  PublicHomepageProjection,
  PublicServiceSummary,
} from '@/lib/public/domain';
import { getPublicHomepage, listPublicSummaries } from '@/lib/public/queries';

const EMPTY_HOMEPAGE: PublicHomepageProjection = {
  work: [],
  builds: [],
  labs: [],
  notes: [],
  profiles: [],
};

export const revalidate = 86_400;

export const metadata: Metadata = createPublicMetadata({
  description: PUBLIC_SITE.description,
  path: '/',
  noIndex: !PUBLIC_SITE.release.live,
});

export default async function PublicRoot() {
  let projection: ImmutablePublic<PublicHomepageProjection> = EMPTY_HOMEPAGE;
  let services: readonly ImmutablePublic<PublicServiceSummary>[] = [];
  const [homepageResult, servicesResult] = await Promise.allSettled([
    getPublicHomepage(),
    listPublicSummaries('service'),
  ]);
  if (homepageResult.status === 'fulfilled') {
    projection = homepageResult.value;
  } else {
    console.error('Homepage public projection unavailable.', homepageResult.reason);
  }
  if (servicesResult.status === 'fulfilled') {
    services = servicesResult.value.filter(
      (entry): entry is ImmutablePublic<PublicServiceSummary> =>
        entry.type === 'service' && entry.evidence.length > 0,
    );
  } else {
    console.error('Homepage Services projection unavailable.', servicesResult.reason);
  }
  return <Homepage projection={projection} services={services} />;
}
