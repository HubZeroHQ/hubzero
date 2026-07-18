import { PUBLIC_SITE } from '@/config/public-site';
import { canonicalUrl } from '@/lib/public/discovery/metadata';
import { renderRssFeed } from '@/lib/public/discovery/feed';
import { listPublicNoteIndexEntries } from '@/lib/public/queries';

export async function GET(): Promise<Response> {
  if (!PUBLIC_SITE.release.live || !PUBLIC_SITE.release.feed) {
    return new Response('Not found', { status: 404 });
  }

  try {
    const entries = await listPublicNoteIndexEntries();
    const xml = renderRssFeed({
      title: 'HubZero Notes',
      description: 'Engineering decisions, investigations, and lessons published by HubZero.',
      siteUrl: canonicalUrl('/').toString(),
      feedUrl: canonicalUrl('/feed.xml').toString(),
      items: entries.map(({ note }) => ({
        title: note.title,
        url: canonicalUrl(note.url).toString(),
        summary: note.summary,
        publicationDate: note.publicationDate,
        author: note.author,
      })),
    });
    return new Response(xml, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
      },
    });
  } catch (error) {
    console.error('Public RSS feed failed', error);
    return new Response('Feed unavailable', { status: 503 });
  }
}
