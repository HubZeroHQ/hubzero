import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NoteDetail } from '@/components/public/notes/NoteDetail';
import { PublicJsonLd } from '@/components/public/PublicJsonLd';
import { PUBLIC_SITE } from '@/config/public-site';
import { createPublicMetadata } from '@/lib/public/discovery/metadata';
import { breadcrumbJsonLd, publicNoteJsonLd } from '@/lib/public/discovery/structured-data';
import { isPreviewRequest } from '@/lib/public/preview';
import { getPublicDetail, listPublicSummaries } from '@/lib/public/queries';

export const revalidate = 86_400;

export async function generateStaticParams() {
  const entries = await listPublicSummaries('note').catch(() => []);
  return entries.flatMap((entry) => (entry.type === 'note' ? [{ slug: entry.slug }] : []));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const preview = await isPreviewRequest();
  const note = await getPublicDetail('note', slug, { preview });
  if (!note || note.type !== 'note') notFound();
  return createPublicMetadata({
    title: note.title,
    description: note.summary,
    path: note.url,
    image: note.hero,
    noIndex: preview || !PUBLIC_SITE.release.live,
    type: 'article',
    publishedTime: note.publicationDate,
    authors: [{ name: note.author.name, url: note.author.url }],
  });
}

export default async function NoteDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const preview = await isPreviewRequest();
  const note = await getPublicDetail('note', slug, { preview });
  if (!note || note.type !== 'note') notFound();

  return (
    <>
      <PublicJsonLd
        enabled={PUBLIC_SITE.release.live}
        values={[
          breadcrumbJsonLd([
            { name: 'HubZero', path: '/' },
            { name: 'Notes', path: '/notes' },
            { name: note.title, path: note.url },
          ]),
          publicNoteJsonLd(note),
        ]}
      />
      <NoteDetail note={note} />
    </>
  );
}
