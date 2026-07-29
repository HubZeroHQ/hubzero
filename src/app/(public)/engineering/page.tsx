import type { Metadata } from 'next';
import { EngineeringProfilesIndex } from '@/components/public/engineering/EngineeringProfilesIndex';
import { PublicJsonLd } from '@/components/public/PublicJsonLd';
import { PUBLIC_SITE } from '@/config/public-site';
import type { ImmutablePublic, PublicEngineeringProfileIndexEntry } from '@/lib/public/domain';
import { createPublicMetadata } from '@/lib/public/discovery/metadata';
import { breadcrumbJsonLd, collectionPageJsonLd } from '@/lib/public/discovery/structured-data';
import { listPublicEngineeringProfileIndexEntries } from '@/lib/public/queries';

const description =
  'Evidence-led Engineering Profiles connecting HubZero engineers to documented decisions, products, investigations, and authored Notes.';

export const revalidate = 86_400;

export const metadata: Metadata = createPublicMetadata({
  title: 'Engineering Profiles',
  description,
  path: '/engineering',
  noIndex: !PUBLIC_SITE.release.live,
});

export default async function EngineeringProfilesPage() {
  const entries = await safeEngineeringProfiles();
  return (
    <>
      <PublicJsonLd
        enabled={PUBLIC_SITE.release.live}
        values={[
          breadcrumbJsonLd([
            { name: 'HubZero', path: '/' },
            { name: 'Engineering Profiles', path: '/engineering' },
          ]),
          collectionPageJsonLd({
            name: 'HubZero Engineering Profiles',
            description,
            path: '/engineering',
            entries: entries.map(({ profile }) => profile),
          }),
        ]}
      />
      <EngineeringProfilesIndex entries={entries} />
    </>
  );
}

async function safeEngineeringProfiles(): Promise<
  readonly ImmutablePublic<PublicEngineeringProfileIndexEntry>[]
> {
  try {
    return await listPublicEngineeringProfileIndexEntries();
  } catch (error) {
    console.error('Engineering Profile public index read failed.', error);
    return [];
  }
}
