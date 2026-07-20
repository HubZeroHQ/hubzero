import type { BlockType } from '@/lib/documents/blocks';
import type { BlockInstruction, TransformInstruction } from '../types';

/**
 * The single source of truth for what each transform instruction actually
 * means — one prompt fragment per instruction, shared by the per-block AI
 * menu and the text-selection toolbar (`types.ts`'s `TransformInstruction`).
 * Neither UI surface hardcodes its own copy of "what does 'condense' mean" —
 * both read from here, so the two surfaces can never drift into subtly
 * different behavior for the same verb.
 */
export interface InstructionGuidance {
  /** Human label — the per-block menu and selection toolbar may still show a different *word* for the same instruction (§9's "Expand"/"Lengthen"), but always the same underlying prompt fragment. */
  label: string;
  description: string;
}

export const INSTRUCTION_GUIDANCE: Record<BlockInstruction, InstructionGuidance> = {
  rewrite: {
    label: 'Rewrite',
    description:
      'Rewrite this content with the same meaning and roughly the same length, improving clarity and precision.',
  },
  improve: {
    label: 'Improve',
    description:
      'Improve word choice, precision, and flow without changing the core meaning or length substantially.',
  },
  expand: {
    label: 'Expand',
    description:
      'Expand this content with additional relevant detail, examples, or reasoning. Do not pad with filler or restate the same point twice.',
  },
  condense: {
    label: 'Condense',
    description:
      'Condense this content to its essential point, cutting redundancy while preserving meaning and any load-bearing specifics.',
  },
  continue: {
    label: 'Continue writing',
    description:
      'Continue directly from where this content leaves off, matching its voice, technical depth, and level of detail. Do not repeat what has already been said.',
  },
  simplify: {
    label: 'Simplify',
    description:
      'Simplify the language and structure for a broader audience without losing technical accuracy.',
  },
  moreTechnical: {
    label: 'Make more technical',
    description:
      'Increase technical precision and depth — assume a more expert reader and use exact terminology.',
  },
  easierToUnderstand: {
    label: 'Make easier to understand',
    description:
      'Rewrite for a reader with less context, explaining concepts inline where needed rather than assuming prior knowledge.',
  },
  fixGrammar: {
    label: 'Fix grammar',
    description:
      'Correct grammar, spelling, and punctuation only. Do not change meaning, tone, structure, or word choice beyond what correctness requires.',
  },
  improveFlow: {
    label: 'Improve flow',
    description:
      'Improve sentence-to-sentence and paragraph-to-paragraph transitions without changing the substance.',
  },
  summarize: {
    label: 'Summarize',
    description: 'Summarize the essential point in significantly fewer words than the original.',
  },
  translate: {
    label: 'Translate',
    description:
      'Translate this content faithfully into the requested target language, preserving technical terms where translating them would lose precision.',
  },
  generateAlternatives: {
    label: 'Generate alternatives',
    description:
      'Produce 2–3 meaningfully different alternative versions of this content for the author to choose between — not trivial rewordings of each other.',
  },
  generateHeading: {
    label: 'Generate heading',
    description:
      'Write a precise, descriptive heading for the section this block introduces — a literal description of the content, not a clever title.',
  },
  generateCaption: {
    label: 'Generate caption',
    description:
      'Write a caption that names the engineering decision, tradeoff, or constraint this image demonstrates in context — not a plain visual description of what\'s on screen. "Product page." is a failure; "the separate component tree used instead of a single responsive layout" is the target. Never assert something about the image\'s content that isn\'t visible in the description supplied, and never invent a decision the surrounding document doesn\'t actually support.',
  },
  explainCode: {
    label: 'Explain code',
    description:
      "Write a clear explanation of what this code does and why, for an engineer reading it for the first time. Reference the code's actual structure, not a generic description.",
  },
  documentApi: {
    label: 'Document API',
    description:
      'Write reference documentation for this code: parameters, return value, and any notable behavior or edge cases actually visible in the code.',
  },
};

/**
 * Which instructions the per-block AI menu shows for a given block type
 * (CMS_PRODUCT_DESIGN.md §5/task brief: "available actions should depend on
 * the selected block type"). Blocks with no text content to transform
 * (divider, technologyStack, metrics, timeline, links, references,
 * fileAttachment) intentionally have no entry — the menu shows nothing for
 * them rather than a set of actions that don't apply.
 */
const TEXT_TRANSFORMS: BlockInstruction[] = [
  'rewrite',
  'improve',
  'expand',
  'condense',
  'continue',
  'simplify',
  'moreTechnical',
  'easierToUnderstand',
  'fixGrammar',
  'improveFlow',
  'summarize',
  'generateAlternatives',
];

const BLOCK_TYPE_INSTRUCTIONS: Partial<Record<BlockType, BlockInstruction[]>> = {
  paragraph: TEXT_TRANSFORMS,
  richText: TEXT_TRANSFORMS,
  markdown: TEXT_TRANSFORMS,
  quote: ['rewrite', 'improve', 'condense', 'fixGrammar', 'generateAlternatives'],
  callout: ['rewrite', 'improve', 'condense', 'fixGrammar', 'generateAlternatives'],
  heading: ['rewrite', 'generateHeading', 'generateAlternatives', 'fixGrammar'],
  code: ['explainCode', 'documentApi'],
  image: ['generateCaption'],
  imageGallery: ['generateCaption'],
  orderedList: ['rewrite', 'expand', 'condense', 'simplify', 'fixGrammar'],
  unorderedList: ['rewrite', 'expand', 'condense', 'simplify', 'fixGrammar'],
  checklist: ['rewrite', 'expand', 'condense', 'fixGrammar'],
};

export function getBlockInstructions(type: BlockType): BlockInstruction[] {
  return BLOCK_TYPE_INSTRUCTIONS[type] ?? [];
}

/** The selection toolbar's fixed action set — a subset of `TransformInstruction`, with its own labels for a couple of instructions that read more naturally on inline text than on a whole block. */
export const SELECTION_INSTRUCTIONS: Array<{ instruction: TransformInstruction; label: string }> = [
  { instruction: 'rewrite', label: 'Rewrite' },
  { instruction: 'improve', label: 'Improve' },
  { instruction: 'condense', label: 'Shorten' },
  { instruction: 'expand', label: 'Lengthen' },
  { instruction: 'moreTechnical', label: 'More technical' },
  { instruction: 'simplify', label: 'Simplify' },
  { instruction: 'summarize', label: 'Summarize' },
  { instruction: 'continue', label: 'Continue' },
  { instruction: 'translate', label: 'Translate' },
];

export function getInstructionGuidance(instruction: BlockInstruction): InstructionGuidance {
  return INSTRUCTION_GUIDANCE[instruction];
}
