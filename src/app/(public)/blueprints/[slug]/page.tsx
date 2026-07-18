import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PublicCollectionDetail } from '@/components/public/collections/PublicCollectionDetail';
import { PublicJsonLd } from '@/components/public/PublicJsonLd';
import { PUBLIC_SITE } from '@/config/public-site';
import type { ImmutablePublic, PublicEntityDetail } from '@/lib/public/domain';
import { createPublicMetadata } from '@/lib/public/discovery/metadata';
import { breadcrumbJsonLd, publicArtifactJsonLd } from '@/lib/public/discovery/structured-data';
import { getPublicDetail, listPublicSummaries } from '@/lib/public/queries';

export const revalidate = 86_400;

export async function generateStaticParams() {
  const entries = await listPublicSummaries('blueprint').catch(() => []);
  return entries.flatMap((entry) => (entry.type === 'blueprint' ? [{ slug: entry.slug }] : []));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entity = await safeBlueprintDetail(slug);
  if (!entity || entity.type !== 'blueprint') {
    return createPublicMetadata({
      title: 'Blueprint not found',
      description: 'This Blueprint is not available in the public record.',
      path: `/blueprints/${slug}`,
      noIndex: true,
    });
  }
  return createPublicMetadata({
    title: entity.title,
    description: entity.summary,
    path: entity.url,
    image: entity.hero,
    noIndex: !PUBLIC_SITE.release.live,
    type: 'article',
  });
}

export default async function BlueprintDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entity = await safeBlueprintDetail(slug);
  if (!entity || entity.type !== 'blueprint') notFound();

  return (
    <>
      <PublicJsonLd
        enabled={PUBLIC_SITE.release.live}
        values={[
          breadcrumbJsonLd([
            { name: 'HubZero', path: '/' },
            { name: 'Blueprints', path: '/blueprints' },
            { name: entity.title, path: entity.url },
          ]),
          publicArtifactJsonLd(entity),
        ]}
      />
      <PublicCollectionDetail entity={entity} />
    </>
  );
}

async function safeBlueprintDetail(
  slug: string,
): Promise<ImmutablePublic<PublicEntityDetail> | null> {
  try {
    return await getPublicDetail('blueprint', slug);
  } catch (error) {
    console.error(`Blueprint public detail read failed for "${slug}".`, error);
    return null;
  }
}
