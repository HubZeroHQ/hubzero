import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EngineeringProfileDetail } from '@/components/public/engineering/EngineeringProfileDetail';
import { PublicJsonLd } from '@/components/public/PublicJsonLd';
import { PUBLIC_SITE } from '@/config/public-site';
import { createPublicMetadata } from '@/lib/public/discovery/metadata';
import {
  breadcrumbJsonLd,
  publicEngineeringProfileJsonLd,
} from '@/lib/public/discovery/structured-data';
import { isPreviewRequest } from '@/lib/public/preview';
import { getPublicDetail, listPublicEngineeringProfileIndexEntries } from '@/lib/public/queries';

export const revalidate = 86_400;

export async function generateStaticParams() {
  const entries = await listPublicEngineeringProfileIndexEntries().catch(() => []);
  return entries.map(({ profile }) => ({ slug: profile.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const preview = await isPreviewRequest();
  const profile = await getPublicDetail('engineeringProfile', slug, { preview });
  if (!profile || profile.type !== 'engineeringProfile') notFound();
  return createPublicMetadata({
    title: `${profile.title}, ${profile.role}`,
    description: profile.summary,
    path: profile.url,
    image: profile.portrait ?? profile.hero,
    noIndex: preview || !PUBLIC_SITE.release.live,
  });
}

export default async function EngineeringProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const preview = await isPreviewRequest();
  const profile = await getPublicDetail('engineeringProfile', slug, { preview });
  if (!profile || profile.type !== 'engineeringProfile') notFound();

  return (
    <>
      <PublicJsonLd
        enabled={PUBLIC_SITE.release.live}
        values={[
          breadcrumbJsonLd([
            { name: 'HubZero', path: '/' },
            { name: 'Engineering Profiles', path: '/engineering' },
            { name: profile.title, path: profile.url },
          ]),
          publicEngineeringProfileJsonLd(profile),
        ]}
      />
      <EngineeringProfileDetail profile={profile} />
    </>
  );
}
