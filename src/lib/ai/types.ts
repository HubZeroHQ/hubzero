import type { Block, BlockType } from '@/lib/documents/blocks';
import type { DocumentRole, OwnerType } from '@/lib/documents/schema';

/**
 * HubZero's own vocabulary for AI generation requests/results (PLANNING.md
 * §32) — never a provider's native request/response shape. Every request
 * carries enough editorial context (collection, entry metadata, document
 * outline, adjacent content) for a provider to write like an editor who has
 * actually read the rest of the document, not a stateless text completion.
 *
 * Four request shapes cover every surface in the editor:
 * - `document` — the "Generate content" panel's whole-document generation.
 * - `block` — insert one or more new blocks at a position (slash commands,
 *   the insert menu's "Generate" entry).
 * - `transform-block` — rewrite/improve/expand/… an existing block in place
 *   (the per-block AI menu).
 * - `transform-selection` — rewrite/shorten/translate/… a plain-text
 *   selection inside a block's own text field (the selection toolbar).
 *
 * `document`/`block`/`transform-block` all resolve new or replacement
 * blocks and share `BlockGenerationResult`; `transform-selection` resolves
 * plain text and returns `TextGenerationResult` instead, since a selection
 * lives inside a block's field, not as a block of its own.
 */

export interface RelatedEntrySummary {
  ownerType: OwnerType;
  title: string;
}

export interface GenerationEntryMetadata {
  ownerType: OwnerType;
  role: DocumentRole;
  title: string;
  referenceId?: string;
  /** Short editorial summary/objective already on the owning record (Note.summary, Blueprint.shortDescription, Lab.objective, …). */
  summary?: string;
  /** Resolved technology labels — never raw taxonomy ids. */
  technologies?: string[];
  relatedEntries?: RelatedEntrySummary[];
}

export interface GenerationImageInput {
  mediaId: string;
  url: string;
  description?: string;
}

export interface DocumentOutlineHeading {
  level: 2 | 3 | 4;
  text: string;
}

/** A neighboring block, trimmed to plain text the model can read as context without being asked to re-emit it. */
export interface AdjacentBlockSummary {
  type: BlockType;
  text: string;
}

export interface AdjacentBlockContext {
  previous?: AdjacentBlockSummary;
  next?: AdjacentBlockSummary;
}

type TechnicalDepth = 'introductory' | 'practitioner' | 'expert';
type ContentLength = 'brief' | 'standard' | 'in-depth';
type ContentTone = 'neutral' | 'narrative' | 'direct' | 'analytical';

/** Shared editorial dials every generation surface reads the same way — never redefined per call site. */
export interface EditorialOptions {
  purpose?: string;
  audience?: string;
  technicalDepth?: TechnicalDepth;
  length?: ContentLength;
  tone?: ContentTone;
  writingStyle?: string;
  additionalInstructions?: string;
}

interface BaseGenerationRequest {
  entry: GenerationEntryMetadata;
  /** The document's existing heading structure, so new content lands as a coherent continuation rather than a duplicate section. */
  outline?: DocumentOutlineHeading[];
}

/** Whole-document generation — the "Generate content" panel's primary action. */
export interface DocumentGenerationRequest extends BaseGenerationRequest, EditorialOptions {
  action: 'document';
  contentType: string;
  freeformText?: string;
  /** Text already extracted server-side from uploaded reference files (§31) — never persisted as Media. */
  extractedDocumentText?: string[];
  images: GenerationImageInput[];
}

/** Insert one or more new blocks at a position — slash commands and the insert menu's "Generate" entry. */
export interface BlockGenerationRequest extends BaseGenerationRequest, EditorialOptions {
  action: 'block';
  /** A hint from the triggering command (e.g. `/table` → `'table'`) — advisory, the provider may choose a better-fitting type. */
  suggestedBlockType?: BlockType;
  instruction: string;
  adjacent?: AdjacentBlockContext;
}

/**
 * The shared verb vocabulary for both per-block and text-selection transforms
 * — one prompt fragment per instruction (`editorial/instructions.ts`), reused
 * by whichever surface triggers it, so "condense" never means something
 * subtly different depending on which button was clicked.
 */
export const TRANSFORM_INSTRUCTIONS = [
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
  'translate',
  'generateAlternatives',
] as const;
export type TransformInstruction = (typeof TRANSFORM_INSTRUCTIONS)[number];

/** Block-only instructions — produce content of a specific kind rather than transforming existing prose. */
export const BLOCK_ONLY_INSTRUCTIONS = [
  'generateHeading',
  'generateCaption',
  'explainCode',
  'documentApi',
] as const;
type BlockOnlyInstruction = (typeof BLOCK_ONLY_INSTRUCTIONS)[number];

export type BlockInstruction = TransformInstruction | BlockOnlyInstruction;

/** Transform an existing block in place — the per-block AI menu (rewrite/improve/expand/…). */
export interface BlockTransformRequest extends BaseGenerationRequest {
  action: 'transform-block';
  block: Block;
  instruction: BlockInstruction;
  additionalInstructions?: string;
  adjacent?: AdjacentBlockContext;
}

/** Transform a plain-text selection inside a block's own text field — the selection toolbar. */
export interface SelectionTransformRequest extends BaseGenerationRequest {
  action: 'transform-selection';
  selectedText: string;
  instruction: TransformInstruction;
  /** Required and only meaningful when `instruction === 'translate'`. */
  targetLanguage?: string;
  surroundingText?: { before?: string; after?: string };
}

export type GenerationRequest =
  | DocumentGenerationRequest
  | BlockGenerationRequest
  | BlockTransformRequest
  | SelectionTransformRequest;

export interface BlockGenerationResult {
  kind: 'blocks';
  blocks: Block[];
  /** True when at least one returned block is an explicit, author-must-resolve placeholder (§31) — e.g. an image block with no supplied reference image. */
  containsPlaceholders: boolean;
}

export interface TextGenerationResult {
  kind: 'text';
  text: string;
}

/** The result shape a given request resolves to — lets `ContentGenerationProvider.generate` return a precisely narrowed type per call site instead of a union every caller has to re-check. */
export type GenerationResultFor<R extends GenerationRequest> = R extends SelectionTransformRequest
  ? TextGenerationResult
  : BlockGenerationResult;
