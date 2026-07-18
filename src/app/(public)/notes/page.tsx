import type { Metadata } from 'next';
import { NotesIndex } from '@/components/public/notes/NotesIndex';
import { PublicJsonLd } from '@/components/public/PublicJsonLd';
import { PUBLIC_SITE } from '@/config/public-site';
import type { ImmutablePublic, PublicNoteIndexEntry } from '@/lib/public/domain';
import { createPublicMetadata } from '@/lib/public/discovery/metadata';
import { breadcrumbJsonLd, collectionPageJsonLd } from '@/lib/public/discovery/structured-data';
import { listPublicNoteIndexEntries } from '@/lib/public/queries';

const description =
  'Short-form engineering notes on implementation details, experiments, architecture decisions, and lessons learned.';

export const revalidate = 86_400;

export const metadata: Metadata = createPublicMetadata({
  title: 'Notes',
  description,
  path: '/notes',
  noIndex: !PUBLIC_SITE.release.live,
});

export default async function NotesIndexPage() {
  const entries = await safeNoteIndexEntries();
  return (
    <>
      <PublicJsonLd
        enabled={PUBLIC_SITE.release.live}
        values={[
          breadcrumbJsonLd([
            { name: 'HubZero', path: '/' },
            { name: 'Notes', path: '/notes' },
          ]),
          collectionPageJsonLd({
            name: 'HubZero Notes',
            description,
            path: '/notes',
            entries: entries.map(({ note }) => note),
          }),
        ]}
      />
      <NotesIndex entries={entries} />
    </>
  );
}

async function safeNoteIndexEntries(): Promise<readonly ImmutablePublic<PublicNoteIndexEntry>[]> {
  try {
    return await listPublicNoteIndexEntries();
  } catch (error) {
    console.error('Notes public index read failed.', error);
    return [];
  }
}
