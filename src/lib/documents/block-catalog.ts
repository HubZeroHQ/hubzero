import {
  AlignLeft,
  CheckSquare,
  Code2,
  Columns3,
  FileText,
  Film,
  Gauge,
  Heading,
  Image as ImageIcon,
  Images,
  Link2,
  List,
  ListOrdered,
  type LucideIcon,
  Megaphone,
  Minus,
  Quote,
  ScrollText,
  Table as TableIcon,
  Type,
  Wrench,
} from 'lucide-react';
import type { BlockType } from './blocks';

/**
 * Insertion-menu metadata for the full 21-block catalog, grouped exactly per
 * CMS_PRODUCT_DESIGN.md §5's five categories — "the menu itself teaches the
 * taxonomy," and a new block type only ever adds one row to whichever
 * category it fits, never a menu restructure.
 */
export interface BlockCatalogEntry {
  type: BlockType;
  label: string;
  description: string;
  icon: LucideIcon;
  keywords: string[];
}

export interface BlockCatalogCategory {
  category: string;
  entries: BlockCatalogEntry[];
}

export const BLOCK_CATALOG: BlockCatalogCategory[] = [
  {
    category: 'Text',
    entries: [
      {
        type: 'heading',
        label: 'Heading',
        description: 'Section structure (H2–H4)',
        icon: Heading,
        keywords: ['title', 'section', 'h2', 'h3', 'h4'],
      },
      {
        type: 'paragraph',
        label: 'Paragraph',
        description: 'Plain body prose',
        icon: Type,
        keywords: ['text', 'body'],
      },
      {
        type: 'richText',
        label: 'Rich text',
        description: 'Inline-formatted prose — bold, italic, links',
        icon: AlignLeft,
        keywords: ['formatted', 'bold', 'italic', 'inline'],
      },
      {
        type: 'markdown',
        label: 'Markdown',
        description: 'Escape hatch for quick structured text',
        icon: FileText,
        keywords: ['md', 'raw'],
      },
      {
        type: 'quote',
        label: 'Quote',
        description: 'Editorial emphasis, pull quotes',
        icon: Quote,
        keywords: ['pullquote', 'blockquote'],
      },
      {
        type: 'callout',
        label: 'Callout',
        description: 'Flagged note — neutral, warning, or success',
        icon: Megaphone,
        keywords: ['note', 'warning', 'tip', 'alert'],
      },
    ],
  },
  {
    category: 'Code',
    entries: [
      {
        type: 'code',
        label: 'Code',
        description: 'Syntax-highlighted code sample',
        icon: Code2,
        keywords: ['snippet', 'syntax'],
      },
    ],
  },
  {
    category: 'Media',
    entries: [
      {
        type: 'image',
        label: 'Image',
        description: 'Single image',
        icon: ImageIcon,
        keywords: ['photo', 'picture'],
      },
      {
        type: 'imageGallery',
        label: 'Image gallery',
        description: 'Multiple images',
        icon: Images,
        keywords: ['photos', 'gallery', 'carousel'],
      },
      {
        type: 'videoEmbed',
        label: 'Video embed',
        description: 'External video',
        icon: Film,
        keywords: ['youtube', 'video', 'embed'],
      },
    ],
  },
  {
    category: 'Structure',
    entries: [
      {
        type: 'divider',
        label: 'Divider',
        description: 'Visual/structural break',
        icon: Minus,
        keywords: ['hr', 'separator', 'break'],
      },
      {
        type: 'table',
        label: 'Table',
        description: 'Structured tabular data',
        icon: TableIcon,
        keywords: ['grid', 'rows', 'columns'],
      },
      {
        type: 'orderedList',
        label: 'Ordered list',
        description: 'Numbered list',
        icon: ListOrdered,
        keywords: ['numbered', 'steps'],
      },
      {
        type: 'unorderedList',
        label: 'Unordered list',
        description: 'Bulleted list',
        icon: List,
        keywords: ['bullets'],
      },
      {
        type: 'checklist',
        label: 'Checklist',
        description: 'Checkbox-toggleable list',
        icon: CheckSquare,
        keywords: ['todo', 'tasks', 'checkbox'],
      },
    ],
  },
  {
    category: 'Reference & Data',
    entries: [
      {
        type: 'fileAttachment',
        label: 'File attachment',
        description: 'Downloadable reference material',
        icon: ScrollText,
        keywords: ['download', 'pdf', 'file'],
      },
      {
        type: 'metrics',
        label: 'Metrics',
        description: 'Real, sourced numbers — never fabricated',
        icon: Gauge,
        keywords: ['statistics', 'numbers', 'kpi'],
      },
      {
        type: 'timeline',
        label: 'Timeline',
        description: 'Sequenced events',
        icon: Columns3,
        keywords: ['history', 'events', 'sequence'],
      },
      {
        type: 'technologyStack',
        label: 'Technology stack',
        description: 'Linked technology tags',
        icon: Wrench,
        keywords: ['tech', 'stack', 'tools'],
      },
      {
        type: 'links',
        label: 'Links',
        description: 'Related-resource links',
        icon: Link2,
        keywords: ['url', 'resources'],
      },
      {
        type: 'references',
        label: 'References',
        description: 'Citations and sources',
        icon: ScrollText,
        keywords: ['citations', 'sources', 'bibliography'],
      },
    ],
  },
];

export const BLOCK_CATALOG_FLAT: BlockCatalogEntry[] = BLOCK_CATALOG.flatMap(
  (category) => category.entries,
);

export function getBlockCatalogEntry(type: BlockType): BlockCatalogEntry {
  const entry = BLOCK_CATALOG_FLAT.find((candidate) => candidate.type === type);
  if (!entry) {
    throw new Error(`"${type}" is missing from the block catalog.`);
  }
  return entry;
}
