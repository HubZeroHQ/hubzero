import type { Block } from '@/lib/documents/blocks';
import type {
  AdjacentBlockContext,
  BlockGenerationRequest,
  BlockTransformRequest,
  DocumentGenerationRequest,
  DocumentOutlineHeading,
  EditorialOptions,
  GenerationEntryMetadata,
  GenerationRequest,
  SelectionTransformRequest,
} from '../types';
import { renderBlockGuidanceTable, VISUAL_RHYTHM_GUIDANCE } from './block-guidance';
import { renderCollectionGuidance } from './collection-guidance';
import { FEW_SHOT_EXAMPLES } from './few-shot-examples';
import { getInstructionGuidance } from './instructions';
import { MASTER_PROMPT } from './master-prompt';

/**
 * The Editorial System's assembly point — every generation request becomes
 * exactly one `{ systemInstruction, userPrompt }` pair here, built from the
 * shared master prompt plus whichever layers the request's `action` actually
 * needs. This is the one place prompt text is composed; UI components and
 * server actions never construct prompt strings themselves (PLANNING.md
 * §32's "prompts maintainable independently from the UI").
 */
export interface BuiltPrompt {
  systemInstruction: string;
  userPrompt: string;
}

const RESPONSE_CONTRACT_BLOCKS = `## Response format
Return a JSON object matching the supplied response schema exactly:
{ "blocks": Block[], "containsPlaceholders": boolean }
Set "containsPlaceholders" to true only if at least one returned block is an
explicit placeholder the author must resolve before publishing (e.g. an image
block description without a real supplied image). Every block must include a
unique "id" (a short string you generate, e.g. "b1", "b2").`;

const RESPONSE_CONTRACT_TEXT = `## Response format
Return a JSON object matching the supplied response schema exactly: { "text": string }.
Return only the transformed text itself — no surrounding quotes, no explanation, no markdown fences.`;

function renderEntryContext(
  entry: GenerationEntryMetadata,
  outline?: DocumentOutlineHeading[],
): string {
  const lines = [
    `## Entry context`,
    `Collection: ${entry.ownerType}`,
    `Document role: ${entry.role}`,
    `Title: ${entry.title}`,
  ];
  if (entry.referenceId) lines.push(`Reference ID: ${entry.referenceId}`);
  if (entry.summary) lines.push(`Summary: ${entry.summary}`);
  if (entry.technologies && entry.technologies.length > 0) {
    lines.push(`Technologies: ${entry.technologies.join(', ')}`);
  }
  if (entry.relatedEntries && entry.relatedEntries.length > 0) {
    lines.push(
      `Related entries: ${entry.relatedEntries.map((related) => `${related.ownerType} — ${related.title}`).join('; ')}`,
    );
  }
  if (outline && outline.length > 0) {
    lines.push(
      `Existing document outline:\n${outline.map((heading) => `${'  '.repeat(heading.level - 2)}- ${heading.text}`).join('\n')}`,
    );
  } else {
    lines.push('Existing document outline: (document is currently empty)');
  }
  return lines.join('\n');
}

function renderEditorialOptions(options: EditorialOptions): string {
  const lines: string[] = ['## Editorial direction'];
  if (options.purpose) lines.push(`Purpose: ${options.purpose}`);
  if (options.audience) lines.push(`Audience: ${options.audience}`);
  if (options.technicalDepth) lines.push(`Technical depth: ${options.technicalDepth}`);
  if (options.length) lines.push(`Target length: ${options.length}`);
  if (options.tone) lines.push(`Tone: ${options.tone}`);
  if (options.writingStyle) lines.push(`Writing style notes: ${options.writingStyle}`);
  if (options.additionalInstructions)
    lines.push(`Additional instructions: ${options.additionalInstructions}`);
  return lines.length > 1 ? lines.join('\n') : '';
}

function renderAdjacentContext(adjacent?: AdjacentBlockContext): string {
  if (!adjacent || (!adjacent.previous && !adjacent.next)) {
    return '';
  }
  const lines = ['## Surrounding content'];
  if (adjacent.previous)
    lines.push(`Immediately before (${adjacent.previous.type}): "${adjacent.previous.text}"`);
  if (adjacent.next)
    lines.push(`Immediately after (${adjacent.next.type}): "${adjacent.next.text}"`);
  return lines.join('\n');
}

function renderBlockForContext(block: Block): string {
  return JSON.stringify(block);
}

function buildDocumentSystemInstruction(request: DocumentGenerationRequest): string {
  return [
    MASTER_PROMPT,
    renderCollectionGuidance(request.entry.ownerType, request.entry.role),
    renderBlockGuidanceTable(),
    VISUAL_RHYTHM_GUIDANCE,
    FEW_SHOT_EXAMPLES,
    RESPONSE_CONTRACT_BLOCKS,
  ].join('\n\n');
}

function buildDocumentUserPrompt(request: DocumentGenerationRequest): string {
  const sections = [
    renderEntryContext(request.entry, request.outline),
    renderEditorialOptions(request),
    `## Request\nGenerate a complete "${request.contentType}" document.`,
  ];
  if (request.freeformText) {
    sections.push(`## Author's notes\n${request.freeformText}`);
  }
  if (request.extractedDocumentText && request.extractedDocumentText.length > 0) {
    sections.push(
      `## Supplied reference material (extracted from uploaded files)\n${request.extractedDocumentText.join('\n\n---\n\n')}`,
    );
  }
  if (request.images.length > 0) {
    sections.push(
      `## Supplied reference images\n${request.images
        .map((image, index) => `${index + 1}. ${image.description ?? '(no description supplied)'}`)
        .join(
          '\n',
        )}\nPlace image blocks where they logically belong using these descriptions; do not fabricate images beyond what's listed here.`,
    );
  }
  return sections.filter(Boolean).join('\n\n');
}

function buildBlockSystemInstruction(request: BlockGenerationRequest): string {
  return [
    MASTER_PROMPT,
    renderCollectionGuidance(request.entry.ownerType, request.entry.role),
    renderBlockGuidanceTable(),
    RESPONSE_CONTRACT_BLOCKS,
  ].join('\n\n');
}

function buildBlockUserPrompt(request: BlockGenerationRequest): string {
  const sections = [
    renderEntryContext(request.entry, request.outline),
    renderEditorialOptions(request),
    renderAdjacentContext(request.adjacent),
    `## Request\nInsert one or more new blocks at this position.${
      request.suggestedBlockType
        ? ` The author suggested a "${request.suggestedBlockType}" block, but choose whatever block type(s) actually fit best.`
        : ''
    }\nInstruction: ${request.instruction}`,
  ];
  return sections.filter(Boolean).join('\n\n');
}

function buildTransformBlockSystemInstruction(request: BlockTransformRequest): string {
  const guidance = getInstructionGuidance(request.instruction);
  return [
    MASTER_PROMPT,
    renderCollectionGuidance(request.entry.ownerType, request.entry.role),
    `## Instruction: ${guidance.label}\n${guidance.description}`,
    RESPONSE_CONTRACT_BLOCKS,
  ].join('\n\n');
}

function buildTransformBlockUserPrompt(request: BlockTransformRequest): string {
  const isAlternatives = request.instruction === 'generateAlternatives';
  const sections = [
    renderEntryContext(request.entry, request.outline),
    renderAdjacentContext(request.adjacent),
    `## Block to transform\n${renderBlockForContext(request.block)}`,
    request.additionalInstructions
      ? `## Additional instructions\n${request.additionalInstructions}`
      : '',
    isAlternatives
      ? '## Request\nReturn 2–3 alternative versions of this block as separate entries in "blocks", each a complete, independently usable replacement. Do not include the original unchanged.'
      : '## Request\nReturn exactly one replacement block in "blocks" — the transformed version of the block above, keeping its "id" unchanged.',
  ];
  return sections.filter(Boolean).join('\n\n');
}

function buildSelectionSystemInstruction(request: SelectionTransformRequest): string {
  const guidance = getInstructionGuidance(request.instruction);
  return [
    MASTER_PROMPT,
    renderCollectionGuidance(request.entry.ownerType, request.entry.role),
    `## Instruction: ${guidance.label}\n${guidance.description}`,
    RESPONSE_CONTRACT_TEXT,
  ].join('\n\n');
}

function buildSelectionUserPrompt(request: SelectionTransformRequest): string {
  const sections = [
    renderEntryContext(request.entry, request.outline),
    request.instruction === 'translate' && request.targetLanguage
      ? `Target language: ${request.targetLanguage}`
      : '',
    request.surroundingText?.before
      ? `## Text immediately before the selection\n${request.surroundingText.before}`
      : '',
    `## Selected text to transform\n${request.selectedText}`,
    request.surroundingText?.after
      ? `## Text immediately after the selection\n${request.surroundingText.after}`
      : '',
  ];
  return sections.filter(Boolean).join('\n\n');
}

export function buildPrompt(request: GenerationRequest): BuiltPrompt {
  switch (request.action) {
    case 'document':
      return {
        systemInstruction: buildDocumentSystemInstruction(request),
        userPrompt: buildDocumentUserPrompt(request),
      };
    case 'block':
      return {
        systemInstruction: buildBlockSystemInstruction(request),
        userPrompt: buildBlockUserPrompt(request),
      };
    case 'transform-block':
      return {
        systemInstruction: buildTransformBlockSystemInstruction(request),
        userPrompt: buildTransformBlockUserPrompt(request),
      };
    case 'transform-selection':
      return {
        systemInstruction: buildSelectionSystemInstruction(request),
        userPrompt: buildSelectionUserPrompt(request),
      };
    default: {
      const exhaustive: never = request;
      throw new Error(`Unknown generation action: ${JSON.stringify(exhaustive)}`);
    }
  }
}
