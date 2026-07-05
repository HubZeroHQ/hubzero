import "@/lib/cms/collections";

import { siteConfig } from "@/config/site";
import { findPublished } from "@/lib/cms/public-content";
import { Note, type NoteDocument } from "@/models/note";

export const revalidate = 3600;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * RSS for published Notes (`ARCHITECTURE/13_SEO_STRATEGY.md` §3 — "Notes
 * ships as a complete platform in the MVP," so crawl/syndication
 * infrastructure for it is in scope from launch, not deferred). A Route
 * Handler, not a Server Component — this response is XML, not HTML, which
 * is exactly the "external feed/webhook shape" `08_TECHNICAL_ARCHITECTURE.md`
 * §2 reserves Route Handlers for.
 */
export async function GET() {
  const notes = await findPublished<NoteDocument>(Note);

  const items = notes
    .map((doc) => {
      const url = `${siteConfig.url}/notes/${doc.slug}`;
      const pubDate = new Date(doc.publishedAt ?? doc.createdAt ?? Date.now()).toUTCString();
      return `
    <item>
      <title>${escapeXml(doc.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(doc.summary)}</description>
      <pubDate>${pubDate}</pubDate>
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(siteConfig.name)} Notes</title>
    <link>${siteConfig.url}/notes</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>en</language>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
