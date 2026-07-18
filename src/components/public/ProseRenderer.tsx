import DOMPurify from 'isomorphic-dompurify';
import type { ImmutablePublic, PublicBlock, PublicDocument } from '@/lib/public/domain';
import { PublicImage } from './PublicImage';

function safeInlineHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'strong', 'em', 's', 'code', 'a', 'br'],
    ALLOWED_ATTR: ['href'],
  });
}

export function ProseRenderer({
  document,
  headingOffset = 0,
}: {
  document: ImmutablePublic<PublicDocument>;
  headingOffset?: 0 | 1;
}) {
  return (
    <article className="public-prose" data-document-role={document.role}>
      {document.blocks.map((block) => (
        <PublicBlockView key={block.id} block={block} headingOffset={headingOffset} />
      ))}
    </article>
  );
}

function PublicBlockView({
  block,
  headingOffset,
}: {
  block: ImmutablePublic<PublicBlock>;
  headingOffset: 0 | 1;
}) {
  switch (block.type) {
    case 'heading': {
      const level = block.data.level + headingOffset;
      const Heading = level === 2 ? 'h2' : level === 3 ? 'h3' : level === 4 ? 'h4' : 'h5';
      return <Heading id={block.id}>{block.data.text}</Heading>;
    }
    case 'paragraph':
      return <p>{block.data.text}</p>;
    case 'richText':
      return <div dangerouslySetInnerHTML={{ __html: safeInlineHtml(block.data.html) }} />;
    case 'markdown':
      return <pre className="public-markdown">{block.data.markdown}</pre>;
    case 'quote':
      return (
        <blockquote>
          <p>{block.data.text}</p>
          {block.data.attribution ? <cite>— {block.data.attribution}</cite> : null}
        </blockquote>
      );
    case 'code':
      return (
        <pre className="public-code" data-language={block.data.language}>
          <code>{block.data.code}</code>
        </pre>
      );
    case 'image':
      return <PublicImage media={block.data.media} />;
    case 'imageGallery':
      return (
        <div className="public-prose-gallery">
          {block.data.images.map((media) => (
            <PublicImage key={media.url} media={media} />
          ))}
        </div>
      );
    case 'videoEmbed':
      return (
        <a className="public-resource-link" href={block.data.url} target="_blank" rel="noreferrer">
          {block.data.caption ?? 'Watch video'} <span aria-hidden>↗</span>
        </a>
      );
    case 'divider':
      return <hr />;
    case 'callout':
      return (
        <aside className="public-callout" data-tone={block.data.tone}>
          {block.data.text}
        </aside>
      );
    case 'table':
      return (
        <div className="public-table-wrap" tabIndex={0} role="region" aria-label="Scrollable table">
          <table>
            {block.data.headers.length ? (
              <thead>
                <tr>
                  {block.data.headers.map((header, index) => (
                    <th key={index} scope="col">
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
                    <td key={cellIndex}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'orderedList':
      return (
        <ol>
          {block.data.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ol>
      );
    case 'unorderedList':
      return (
        <ul>
          {block.data.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );
    case 'checklist':
      return (
        <ul className="public-checklist">
          {block.data.items.map((item, index) => (
            <li key={index}>
              <span aria-hidden>{item.checked ? '✓' : '—'}</span>
              <span>{item.text}</span>
            </li>
          ))}
        </ul>
      );
    case 'fileAttachment':
      return (
        <a className="public-resource-link" href={block.data.url} target="_blank" rel="noreferrer">
          {block.data.fileName} <span aria-hidden>↓</span>
        </a>
      );
    case 'metrics':
      return (
        <dl className="public-metrics">
          {block.data.metrics.map((metric, index) => (
            <div key={index}>
              <dt>{metric.label}</dt>
              <dd>{metric.value}</dd>
              <p>Source: {metric.source}</p>
            </div>
          ))}
        </dl>
      );
    case 'timeline':
      return (
        <ol className="public-timeline">
          {block.data.events.map((event, index) => (
            <li key={index}>
              <time>{event.date}</time>
              <h4>{event.title}</h4>
              {event.description ? <p>{event.description}</p> : null}
            </li>
          ))}
        </ol>
      );
    case 'technologyStack':
      return (
        <ul className="public-taxonomy-list" aria-label="Technology stack">
          {block.data.technologies.map((technology) => (
            <li key={technology.slug}>{technology.label}</li>
          ))}
        </ul>
      );
    case 'links':
      return (
        <ul className="public-link-list">
          {block.data.links.map((link, index) => (
            <li key={index}>
              <a href={link.url} target="_blank" rel="noreferrer">
                {link.label} <span aria-hidden>↗</span>
              </a>
            </li>
          ))}
        </ul>
      );
    case 'references':
      return (
        <ol className="public-references">
          {block.data.citations.map((citation, index) => (
            <li key={index}>
              {citation.url ? (
                <a href={citation.url} target="_blank" rel="noreferrer">
                  {citation.label}
                </a>
              ) : (
                citation.label
              )}
            </li>
          ))}
        </ol>
      );
  }
}
