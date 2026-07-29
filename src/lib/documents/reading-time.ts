import type { Block } from './blocks';

/**
 * Derived at read time, never stored — the Document Engine's ownership
 * model (§25) already treats a Document's body as the single source of
 * truth for its content, so a persisted "reading time" field would just be
 * a second value that can silently drift out of sync with the blocks it
 * describes. General Document Engine infrastructure rather than
 * Note-specific: any long-form owner (a Build's technical doc, a Lab's
 * journal) can call this the same way.
 */
const WORDS_PER_MINUTE = 200;

type ReadingTimeBlock =
  | Exclude<Block, Extract<Block, { type: 'image' | 'imageGallery' | 'technologyStack' }>>
  | { type: 'image' | 'imageGallery' | 'technologyStack'; data: unknown };

function blockText(block: ReadingTimeBlock): string {
  switch (block.type) {
    case 'heading':
      return block.data.text;
    case 'paragraph':
      return block.data.text;
    case 'markdown':
      return block.data.markdown;
    case 'richText':
      return block.data.html.replace(/<[^>]+>/g, ' ');
    case 'quote':
      return block.data.text;
    case 'callout':
      return block.data.text;
    case 'code':
      return block.data.code;
    case 'orderedList':
    case 'unorderedList':
      return block.data.items.join(' ');
    case 'checklist':
      return block.data.items.map((item) => item.text).join(' ');
    case 'table':
      return [...block.data.headers, ...block.data.rows.flat()].join(' ');
    case 'timeline':
      return block.data.events
        .map((event) => `${event.title} ${event.description ?? ''}`)
        .join(' ');
    case 'references':
      return block.data.citations.map((citation) => citation.label).join(' ');
    case 'links':
      return block.data.links.map((link) => link.label).join(' ');
    default:
      return '';
  }
}

/** Rounded, floored at one minute — "< 1 min" reads as an error, not a genuinely short piece. */
export function estimateReadingTimeMinutes(blocks: readonly ReadingTimeBlock[]): number {
  const wordCount = blocks.map(blockText).join(' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE));
}
