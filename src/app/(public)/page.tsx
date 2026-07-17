import type { Metadata } from 'next';
import { Homepage } from '@/components/public/homepage/Homepage';
import { PUBLIC_SITE } from '@/config/public-site';
import { createPublicMetadata } from '@/lib/public/discovery/metadata';
import type { ImmutablePublic, PublicHomepageProjection } from '@/lib/public/domain';
import { getPublicHomepage } from '@/lib/public/queries';

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
  try {
    projection = await getPublicHomepage();
  } catch (error) {
    console.error('Homepage public projection unavailable.', error);
  }
  return <Homepage projection={projection} />;
}
