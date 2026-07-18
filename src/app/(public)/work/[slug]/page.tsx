import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PublicCollectionDetail } from '@/components/public/collections/PublicCollectionDetail';
import { PublicJsonLd } from '@/components/public/PublicJsonLd';
import { PUBLIC_SITE } from '@/config/public-site';
import { createPublicMetadata } from '@/lib/public/discovery/metadata';
import { breadcrumbJsonLd, publicArtifactJsonLd } from '@/lib/public/discovery/structured-data';
import { getPublicDetail, listPublicSummaries } from '@/lib/public/queries';

export const revalidate = 86_400;

export async function generateStaticParams() {
  const entries = await listPublicSummaries('work').catch(() => []);
  return entries.flatMap((entry) => (entry.type === 'work' ? [{ slug: entry.slug }] : []));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entity = await getPublicDetail('work', slug);
  if (!entity || entity.type !== 'work') {
    return createPublicMetadata({
      title: 'Work not found',
      description: 'This case study is not available in the public record.',
      path: `/work/${slug}`,
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

export default async function WorkDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entity = await getPublicDetail('work', slug);
  if (!entity || entity.type !== 'work') notFound();

  return (
    <>
      <PublicJsonLd
        enabled={PUBLIC_SITE.release.live}
        values={[
          breadcrumbJsonLd([
            { name: 'HubZero', path: '/' },
            { name: 'Work', path: '/work' },
            { name: entity.title, path: entity.url },
          ]),
          publicArtifactJsonLd(entity),
        ]}
      />
      <PublicCollectionDetail entity={entity} />
    </>
  );
}
