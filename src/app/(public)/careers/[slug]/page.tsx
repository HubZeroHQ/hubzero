import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CareerDetail } from '@/components/public/careers/CareerDetail';
import { PublicJsonLd } from '@/components/public/PublicJsonLd';
import { PUBLIC_SITE } from '@/config/public-site';
import type { ImmutablePublic, PublicEntityDetail } from '@/lib/public/domain';
import { createPublicMetadata } from '@/lib/public/discovery/metadata';
import { breadcrumbJsonLd } from '@/lib/public/discovery/structured-data';
import { isPreviewRequest } from '@/lib/public/preview';
import { getPublicDetail, listPublicSummaries } from '@/lib/public/queries';

export const revalidate = 86_400;

export async function generateStaticParams() {
  const entries = await listPublicSummaries('career').catch(() => []);
  return entries.flatMap((entry) => (entry.type === 'career' ? [{ slug: entry.slug }] : []));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const preview = await isPreviewRequest();
  const career = await safeCareerDetail(slug, preview);
  if (!career || career.type !== 'career') {
    return createPublicMetadata({
      title: 'Role not found',
      description: 'This role is not available in the public record.',
      path: `/careers/${slug}`,
      noIndex: true,
    });
  }
  return createPublicMetadata({
    title: `${career.title} — Careers`,
    description: career.summary,
    path: career.url,
    noIndex: preview || !PUBLIC_SITE.release.live,
  });
}

export default async function CareerDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const preview = await isPreviewRequest();
  const career = await safeCareerDetail(slug, preview);
  if (!career || career.type !== 'career') notFound();

  return (
    <>
      <PublicJsonLd
        enabled={PUBLIC_SITE.release.live}
        values={[
          breadcrumbJsonLd([
            { name: 'HubZero', path: '/' },
            { name: 'Careers', path: '/careers' },
            { name: career.title, path: career.url },
          ]),
        ]}
      />
      <CareerDetail career={career} />
    </>
  );
}

async function safeCareerDetail(
  slug: string,
  preview: boolean,
): Promise<ImmutablePublic<PublicEntityDetail> | null> {
  try {
    return await getPublicDetail('career', slug, { preview });
  } catch (error) {
    console.error(`Career public detail read failed for "${slug}".`, error);
    return null;
  }
}
