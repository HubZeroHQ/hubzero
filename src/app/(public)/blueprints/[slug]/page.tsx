import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PublicCollectionDetail } from '@/components/public/collections/PublicCollectionDetail';
import { PublicJsonLd } from '@/components/public/PublicJsonLd';
import { PUBLIC_SITE } from '@/config/public-site';
import { createPublicMetadata } from '@/lib/public/discovery/metadata';
import { breadcrumbJsonLd, publicArtifactJsonLd } from '@/lib/public/discovery/structured-data';
import { isPreviewRequest } from '@/lib/public/preview';
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
  const preview = await isPreviewRequest();
  const entity = await getPublicDetail('blueprint', slug, { preview });
  if (!entity || entity.type !== 'blueprint') notFound();
  return createPublicMetadata({
    title: entity.title,
    description: entity.summary,
    path: entity.url,
    image: entity.hero,
    noIndex: preview || !PUBLIC_SITE.release.live,
    type: 'article',
  });
}

export default async function BlueprintDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const preview = await isPreviewRequest();
  const entity = await getPublicDetail('blueprint', slug, { preview });
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
