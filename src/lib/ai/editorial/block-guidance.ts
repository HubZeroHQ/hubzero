import type { BlockType } from '@/lib/documents/blocks';
import { BLOCK_CATALOG_FLAT } from '@/lib/documents/block-catalog';

/**
 * Teaches the model when to use — and when not to use — each of the 21
 * Document Engine block types, plus how they combine into good visual
 * rhythm (PLANNING.md §25's block catalog, CMS_PRODUCT_DESIGN.md §5's
 * insert-menu categories). `block-catalog.ts` already has a one-line
 * `description` per type for the human-facing insert menu; this file adds
 * the editorial layer — usage guidance a person browsing a menu doesn't
 * need, but a model choosing a document's structure does.
 */
export interface BlockUsageGuidance {
  useWhen: string;
  avoidWhen: string;
}

const BLOCK_USAGE_GUIDANCE: Record<BlockType, BlockUsageGuidance> = {
  heading: {
    useWhen:
      "Starting a genuinely new section. Use H2 for top-level sections, H3 for subsections, H4 sparingly for a subsection's own subdivision.",
    avoidWhen:
      "Never two headings in a row with no content between them, and never a heading for a section that's only one short paragraph long.",
  },
  paragraph: {
    useWhen: 'The default for prose. Two to five sentences, one idea.',
    avoidWhen:
      'A paragraph doing the job of a list (three or more parallel items) or a table (structured comparison) — use those instead.',
  },
  richText: {
    useWhen: 'Prose that genuinely needs an inline link, bold, or italic emphasis mid-sentence.',
    avoidWhen:
      'Plain prose with no inline formatting need — use `paragraph` instead; do not reach for richText by default.',
  },
  markdown: {
    useWhen:
      "A quick escape hatch for structured text that doesn't fit another block cleanly — sparingly.",
    avoidWhen:
      'Anything a dedicated block (heading, list, table, code) already covers — prefer the dedicated block.',
  },
  quote: {
    useWhen: 'A genuine pull quote or attributed statement worth visual emphasis.',
    avoidWhen: "Fabricating a quote from someone who wasn't actually given as a source in context.",
  },
  callout: {
    useWhen:
      'A single, genuinely important caveat, gotcha, or aside — a security consideration, a deprecation notice, a non-obvious constraint.',
    avoidWhen:
      'Decorative use. A document with a callout every few paragraphs has lost the signal; reserve for what actually needs to interrupt the reader.',
  },
  code: {
    useWhen:
      'A real, realistic code sample — production-shaped variable names, not `foo`/`bar` toy examples — that illustrates a specific point just made in prose.',
    avoidWhen: 'A code sample with no surrounding prose explaining why it matters.',
  },
  image: {
    useWhen:
      'A single supporting image where one exists (from the images supplied in context). Caption it as an engineering fact, not a visual description: name the architectural decision, tradeoff, or constraint the image demonstrates rather than describing what is literally on screen. "Product page." is weak; "The desktop view uses a separate component tree instead of one responsive layout — the tradeoff that kept the mobile bundle small" is the target.',
    avoidWhen:
      'No image was actually supplied — never invent an image block with a fabricated description; use an explicit placeholder instead (§31) so the author sees exactly what needs resolving. Also avoid a caption that only restates the alt text in different words with no engineering content added.',
  },
  imageGallery: {
    useWhen:
      "Multiple related images supplied in context (e.g. several screenshots of the same feature). Each image's own caption should still name the specific decision or state it illustrates, not a shared generic label repeated across all of them.",
    avoidWhen: 'Only one image exists — use a single `image` block instead.',
  },
  videoEmbed: {
    useWhen: 'A real, supplied external video URL.',
    avoidWhen: 'No video URL was supplied — never fabricate one.',
  },
  divider: {
    useWhen: 'A genuine structural break between unrelated sections, used sparingly.',
    avoidWhen:
      'Between every section — headings already provide structure; a divider on top of every heading is visual noise.',
  },
  table: {
    useWhen:
      'Structured, comparable data with clear rows and columns (a comparison, a spec sheet).',
    avoidWhen:
      'Data that isn\'t genuinely tabular — forcing prose into a table to look "structured" hurts readability.',
  },
  orderedList: {
    useWhen: 'Sequential steps where order matters (a procedure, a migration sequence).',
    avoidWhen: 'Items with no real order — use `unorderedList` instead.',
  },
  unorderedList: {
    useWhen: 'Parallel items with no inherent order (features, considerations).',
    avoidWhen: "A list of only one or two items — that's a sentence, not a list.",
  },
  checklist: {
    useWhen:
      'Genuinely actionable, checkable items (a graduation criteria list, a launch checklist).',
    avoidWhen: 'Informational items with nothing to actually check off — use `unorderedList`.',
  },
  fileAttachment: {
    useWhen: 'A real, supplied downloadable reference file.',
    avoidWhen: 'No file was actually supplied — never fabricate a download link.',
  },
  metrics: {
    useWhen:
      'Real, sourced numbers explicitly supplied in context. Every metric must carry a genuine `source`.',
    avoidWhen:
      'No real number was supplied. Never invent a plausible-sounding statistic or a vague source like "internal data" to satisfy the required field — omit the block entirely instead.',
  },
  timeline: {
    useWhen:
      "A genuine sequence of dated events supplied or clearly inferable from context (e.g. a Lab's milestones).",
    avoidWhen: 'Fabricating dates or events not present in context.',
  },
  technologyStack: {
    useWhen:
      "Referencing the entry's actual tagged technologies (supplied in context as resolved names).",
    avoidWhen: 'Inventing technologies not present in the supplied technology list.',
  },
  links: {
    useWhen: 'Real, supplied related-resource URLs.',
    avoidWhen:
      'No URL was supplied — never fabricate one, including plausible-looking internal HubZero URLs.',
  },
  references: {
    useWhen: 'Citing a real, supplied source for a specific claim made in the prose just above it.',
    avoidWhen:
      'No real source exists — an unsupported claim should be softened in the prose itself, not given a fake citation.',
  },
};

export function getBlockUsageGuidance(type: BlockType): BlockUsageGuidance {
  return BLOCK_USAGE_GUIDANCE[type];
}

/** A compact one-line-per-type table — cheap enough to include in every request regardless of action. */
export function renderBlockGuidanceTable(): string {
  const rows = BLOCK_CATALOG_FLAT.map((entry) => {
    const guidance = BLOCK_USAGE_GUIDANCE[entry.type];
    return `- \`${entry.type}\`: use when ${guidance.useWhen} Avoid when ${guidance.avoidWhen}`;
  });
  return `## Block catalog — when to use each\n${rows.join('\n')}`;
}

/**
 * Visual rhythm guidance — how blocks combine, not just what each one is
 * individually. Included for whole-document generation, where structure
 * across an entire piece actually matters (a single new block doesn't need
 * a rhythm lecture).
 */
export const VISUAL_RHYTHM_GUIDANCE = `## Visual rhythm
A good technical document alternates block types rather than running many
paragraphs in a row: heading → paragraph(s) → a concrete example (code, table,
or callout) → paragraph interpreting it → next heading. Avoid three or more
consecutive paragraph blocks with nothing else between them — that is the
single most common way generated content reads as monotonous. Not every
section needs a non-prose block, but a document of any real length should
have visual variety across its full length, not just at the top.`;
