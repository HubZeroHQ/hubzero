import { ExternalLink, Link2 } from 'lucide-react';
import DOMPurify from 'isomorphic-dompurify';
import type { Block } from '@/lib/documents/blocks';
import { cn } from '@/lib/utils/cn';

/**
 * PLANNING.md §25 — "the same `BlockRenderer` renders a Document... one
 * pipeline, so authored content can never visually diverge." This covers
 * the full 21-block catalog (`lib/documents/blocks.ts`) and is used both by
 * the public Work case study page and by the editor's Preview toggle
 * (`BlockEditor`) — literally the same component tree in both places, per
 * CMS_PRODUCT_DESIGN.md §5.
 *
 * `technologyLabels` is optional and resolves a `technologyStack` block's
 * Taxonomy references to real labels when the caller already has them
 * loaded (Work's detail/edit pages do, from `taxonomyRepository`); falling
 * back to the raw id keeps the block renderable rather than broken when a
 * caller hasn't threaded that data through yet.
 */
export function BlockRenderer({
  blocks,
  technologyLabels,
}: {
  blocks: Block[];
  technologyLabels?: Map<string, string>;
}) {
  return (
    <div className="flex flex-col gap-4">
      {blocks.map((block) => (
        <BlockView key={block.id} block={block} technologyLabels={technologyLabels} />
      ))}
    </div>
  );
}

/**
 * `richText` is the one block whose data is stored as HTML rather than
 * plain text or structured fields (`lib/documents/blocks.ts`'s
 * `richTextBlockSchema`) — and it's authored content that can reach a
 * public page, so it's sanitized to a strict inline-formatting allowlist on
 * every render rather than trusted as-is. This is a defense-in-depth
 * measure: the editor's Tiptap instance already can't produce anything
 * outside this allowlist, but the renderer doesn't rely on that alone.
 */
function sanitizeRichText(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'strong', 'em', 's', 'code', 'a', 'br'],
    ALLOWED_ATTR: ['href'],
  });
}

function BlockView({
  block,
  technologyLabels,
}: {
  block: Block;
  technologyLabels?: Map<string, string>;
}) {
  switch (block.type) {
    case 'heading': {
      const { level, text } = block.data;
      if (level === 2) {
        return <h2 className="text-text-primary text-xl font-semibold">{text}</h2>;
      }
      if (level === 3) {
        return <h3 className="text-text-primary text-lg font-semibold">{text}</h3>;
      }
      return <h4 className="text-text-primary text-base font-semibold">{text}</h4>;
    }
    case 'paragraph':
      return <p className="text-text-secondary text-sm leading-relaxed">{block.data.text}</p>;
    case 'richText':
      return (
        <div
          className="text-text-secondary [&_a]:text-accent [&_code]:bg-surface-default [&_strong]:text-text-primary text-sm leading-relaxed [&_a]:underline [&_code]:rounded-[4px] [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_em]:italic [&_strong]:font-semibold"
          // Sanitized above via `sanitizeRichText`'s strict allowlist.
          dangerouslySetInnerHTML={{ __html: sanitizeRichText(block.data.html) }}
        />
      );
    case 'markdown':
      return (
        <pre className="text-text-secondary bg-surface-default rounded-card border-border-muted border p-3 text-sm whitespace-pre-wrap">
          {block.data.markdown}
        </pre>
      );
    case 'quote':
      return (
        <blockquote className="border-border-strong text-text-secondary border-l-2 pl-4 text-sm italic">
          {block.data.text}
          {block.data.attribution ? (
            <footer className="text-text-muted mt-1 not-italic">— {block.data.attribution}</footer>
          ) : null}
        </blockquote>
      );
    case 'code':
      return (
        <pre className="bg-surface-default rounded-card border-border-muted overflow-x-auto border p-3 text-xs">
          <code>{block.data.code}</code>
        </pre>
      );
    case 'image': {
      const { url, altText, caption } = block.data;
      if (!url) {
        return null;
      }
      return (
        <figure className="flex flex-col gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary author-supplied URLs, kept out of the Next.js image optimizer until real Media Library integration lands */}
          <img src={url} alt={altText} loading="lazy" className="rounded-card w-full" />
          {caption ? <figcaption className="text-text-muted text-xs">{caption}</figcaption> : null}
        </figure>
      );
    }
    case 'imageGallery':
      return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {block.data.images.map((image, index) => (
            <figure key={image.mediaId || index} className="flex flex-col gap-1">
              {/* eslint-disable-next-line @next/next/no-img-element -- see the `image` case above */}
              <img
                src={image.url}
                alt={image.altText}
                loading="lazy"
                className="rounded-card aspect-square w-full object-cover"
              />
            </figure>
          ))}
        </div>
      );
    case 'videoEmbed':
      return (
        <a
          href={block.data.url}
          target="_blank"
          rel="noreferrer"
          className="border-border-default rounded-card hover:bg-surface-elevated duration-fast ease-standard flex items-center gap-2 border p-3 text-sm transition-colors"
        >
          <ExternalLink className="text-text-muted h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="text-text-primary flex-1">{block.data.caption ?? 'Watch video'}</span>
        </a>
      );
    case 'callout': {
      // DESIGN_SYSTEM.md — amber (`accent`) is reserved for live/active/
      // selected state only, never a warning; `danger` is the distinct
      // warm-red token the system reserves for that meaning instead.
      const toneClass = {
        neutral: 'border-border-default',
        warning: 'border-danger',
        success: 'border-success',
      }[block.data.tone];
      return (
        <div className={cn('rounded-card bg-surface-default border-l-2 p-3 text-sm', toneClass)}>
          {block.data.text}
        </div>
      );
    }
    case 'divider':
      return <hr className="border-border-muted" />;
    case 'table':
      return (
        <div className="border-border-muted rounded-card overflow-x-auto border">
          <table className="w-full border-collapse text-sm">
            {block.data.headers.length > 0 ? (
              <thead>
                <tr>
                  {block.data.headers.map((header, index) => (
                    <th
                      key={index}
                      className="border-border-muted bg-surface-default text-text-primary border-b px-3 py-2 text-left font-semibold"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
            ) : null}
            <tbody>
              {block.data.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="border-border-muted text-text-secondary border-b px-3 py-2"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'orderedList':
      return (
        <ol className="text-text-secondary list-decimal pl-5 text-sm">
          {block.data.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ol>
      );
    case 'unorderedList':
      return (
        <ul className="text-text-secondary list-disc pl-5 text-sm">
          {block.data.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );
    case 'checklist':
      return (
        <ul className="flex flex-col gap-1 text-sm">
          {block.data.items.map((item, index) => (
            <li key={index} className="text-text-secondary flex items-center gap-2">
              <input type="checkbox" checked={item.checked} readOnly disabled />
              <span className={item.checked ? 'line-through opacity-60' : undefined}>
                {item.text}
              </span>
            </li>
          ))}
        </ul>
      );
    case 'fileAttachment':
      return (
        <a
          href={block.data.url}
          target="_blank"
          rel="noreferrer"
          className="border-border-default rounded-card hover:bg-surface-elevated duration-fast ease-standard flex items-center gap-2 border p-3 text-sm transition-colors"
        >
          <span className="text-text-primary">{block.data.fileName}</span>
        </a>
      );
    case 'metrics':
      return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {block.data.metrics.map((metric, index) => (
            <div key={index} className="border-border-default rounded-card border p-3">
              <p className="text-text-primary text-xl font-semibold">{metric.value}</p>
              <p className="text-text-secondary text-xs">{metric.label}</p>
              <p className="text-text-muted mt-1 font-mono text-[10px] tracking-[0.05em] uppercase">
                Source: {metric.source}
              </p>
            </div>
          ))}
        </div>
      );
    case 'timeline':
      return (
        <ol className="border-border-muted flex flex-col gap-4 border-l pl-4">
          {block.data.events.map((event, index) => (
            <li key={index}>
              <p className="text-text-muted font-mono text-[11px] tracking-[0.05em] uppercase">
                {event.date}
              </p>
              <p className="text-text-primary text-sm font-medium">{event.title}</p>
              {event.description ? (
                <p className="text-text-secondary text-sm">{event.description}</p>
              ) : null}
            </li>
          ))}
        </ol>
      );
    case 'technologyStack':
      return (
        <div className="flex flex-wrap gap-2">
          {block.data.technologyIds.map((id) => (
            <span
              key={id}
              className="bg-surface-elevated text-text-secondary rounded-full border border-[#2a2a2a] px-2.5 py-1 font-mono text-[11px] tracking-[0.05em] uppercase"
            >
              {technologyLabels?.get(id) ?? id}
            </span>
          ))}
        </div>
      );
    case 'links':
      return (
        <ul className="flex flex-col gap-1 text-sm">
          {block.data.links.map((link, index) => (
            <li key={index}>
              <a
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="text-accent hover:underline"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      );
    case 'references':
      return (
        <ul className="flex flex-col gap-1.5 text-sm">
          {block.data.citations.map((citation, index) => (
            <li key={index} className="text-text-secondary flex items-center gap-1.5">
              <Link2 className="text-text-muted h-3 w-3 shrink-0" aria-hidden />
              {citation.url ? (
                <a href={citation.url} target="_blank" rel="noreferrer" className="hover:underline">
                  {citation.label}
                </a>
              ) : (
                <span>{citation.label}</span>
              )}
            </li>
          ))}
        </ul>
      );
    default: {
      const exhaustive: never = block;
      void exhaustive;
      return null;
    }
  }
}
