import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NoteDetail } from '@/components/public/notes/NoteDetail';
import { PublicJsonLd } from '@/components/public/PublicJsonLd';
import { PUBLIC_SITE } from '@/config/public-site';
import type { ImmutablePublic, PublicEntityDetail } from '@/lib/public/domain';
import { createPublicMetadata } from '@/lib/public/discovery/metadata';
import { breadcrumbJsonLd, publicNoteJsonLd } from '@/lib/public/discovery/structured-data';
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
  const note = await safeNoteDetail(slug);
  if (!note || note.type !== 'note') {
    return createPublicMetadata({
      title: 'Note not found',
      description: 'This Note is not available in the public engineering journal.',
      path: `/notes/${slug}`,
      noIndex: true,
    });
  }
  return createPublicMetadata({
    title: note.title,
    description: note.summary,
    path: note.url,
    image: note.hero,
    noIndex: !PUBLIC_SITE.release.live,
    type: 'article',
    publishedTime: note.publicationDate,
    authors: [{ name: note.author.name, url: note.author.url }],
  });
}

export default async function NoteDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const note = await safeNoteDetail(slug);
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

async function safeNoteDetail(slug: string): Promise<ImmutablePublic<PublicEntityDetail> | null> {
  try {
    return await getPublicDetail('note', slug);
  } catch (error) {
    console.error(`Note public detail read failed for "${slug}".`, error);
    return null;
  }
}
