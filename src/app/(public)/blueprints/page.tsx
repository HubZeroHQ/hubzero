import type { Metadata } from 'next';
import { PublicCollectionIndex } from '@/components/public/collections/PublicCollectionIndex';
import { PublicJsonLd } from '@/components/public/PublicJsonLd';
import { PUBLIC_SITE } from '@/config/public-site';
import type {
  ImmutablePublic,
  PublicBlueprintSummary,
  PublicEntitySummary,
} from '@/lib/public/domain';
import { createPublicMetadata } from '@/lib/public/discovery/metadata';
import { breadcrumbJsonLd, collectionPageJsonLd } from '@/lib/public/discovery/structured-data';
import { listPublicSummaries } from '@/lib/public/queries';

const description =
  'Reusable, versioned engineering foundations documented through their information architecture, design language, implementation guidance, and evidence.';

export const revalidate = 86_400;

export const metadata: Metadata = createPublicMetadata({
  title: 'Blueprints',
  description,
  path: '/blueprints',
  noIndex: !PUBLIC_SITE.release.live,
});

export default async function BlueprintsIndexPage() {
  const summaries = await safeBlueprintSummaries();
  const blueprints = summaries.filter(
    (summary): summary is ImmutablePublic<PublicBlueprintSummary> => summary.type === 'blueprint',
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
      <PublicCollectionIndex type="blueprint" entries={blueprints} />
    </>
  );
}

async function safeBlueprintSummaries(): Promise<readonly ImmutablePublic<PublicEntitySummary>[]> {
  try {
    return await listPublicSummaries('blueprint');
  } catch (error) {
    console.error('Blueprint public index read failed.', error);
    return [];
  }
}
