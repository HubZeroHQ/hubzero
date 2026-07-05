/**
 * Renders a `<script type="application/ld+json">` block — the App Router
 * equivalent that actually reaches the page (the legacy site's `next/head`
 * JSON-LD was a confirmed no-op, `ARCHITECTURE/13_SEO_STRATEGY.md` §1.2).
 * `<` is escaped so authored content (a case-study client name, a note
 * title, …) containing a literal `</script>` can't break out of the tag.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
