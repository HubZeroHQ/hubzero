import type { PublicAuthor } from '../domain';

export interface PublicFeedItem {
  title: string;
  url: string;
  summary: string;
  publicationDate: string;
  author: PublicAuthor;
  bodyHtml?: string;
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

/** Produces RSS from already-visible DTO projections; it never broadens repository access. */
export function renderRssFeed(input: {
  title: string;
  description: string;
  siteUrl: string;
  feedUrl: string;
  items: readonly PublicFeedItem[];
}): string {
  const items = input.items
    .map(
      (item) => `<item>
  <title>${escapeXml(item.title)}</title>
  <link>${escapeXml(item.url)}</link>
  <guid isPermaLink="true">${escapeXml(item.url)}</guid>
  <description>${escapeXml(item.summary)}</description>
  <pubDate>${new Date(item.publicationDate).toUTCString()}</pubDate>
  <author>${escapeXml(item.author.name)}</author>
</item>`,
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
<title>${escapeXml(input.title)}</title>
<description>${escapeXml(input.description)}</description>
<link>${escapeXml(input.siteUrl)}</link>
<atom:link xmlns:atom="http://www.w3.org/2005/Atom" href="${escapeXml(input.feedUrl)}" rel="self" type="application/rss+xml" />
${items}
</channel></rss>`;
}
