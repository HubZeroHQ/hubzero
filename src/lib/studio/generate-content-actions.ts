import { type OwnableEntry, requireEntryCapability } from '@/lib/auth/permissions';
import { describeAiError } from '@/lib/ai/errors';
import { getContentGenerationProvider } from '@/lib/ai/registry';
import { generateWithProvider } from '@/lib/ai/service';
import type {
  BlockInstruction,
  DocumentOutlineHeading,
  EditorialOptions,
  GenerationImageInput,
  TransformInstruction,
  AdjacentBlockContext,
} from '@/lib/ai/types';
import type { Block, BlockType } from '@/lib/documents/blocks';
import type { DocumentRole, OwnerType } from '@/lib/documents/schema';
import { mediaRepository } from '@/lib/db/repositories/media';
import { buildGenerationEntryMetadata } from './ai-context';

/**
 * Re-resolves each reference image against the real Media collection rather
 * than trusting the `url` a client submitted alongside its `mediaId` — the
 * server action boundary is a plain object over the wire, so a tampered
 * request could otherwise point the provider's server-side image fetch
 * (`gemini-provider.ts`'s `fetchImagePart`) at an arbitrary internal URL
 * (SSRF). Entries whose `mediaId` doesn't resolve to a real, still-existing
 * asset are silently dropped rather than trusted as-is.
 */
async function resolveTrustedImages(
  images: GenerationImageInput[],
): Promise<GenerationImageInput[]> {
  const resolved = await Promise.all(
    images.map(async (image): Promise<GenerationImageInput | null> => {
      const asset = await mediaRepository.findById(image.mediaId).catch(() => null);
      if (!asset) return null;
      return {
        mediaId: asset._id.toString(),
        url: asset.url,
        description: image.description ?? asset.altText,
      };
    }),
  );
  return resolved.filter((image): image is GenerationImageInput => image !== null);
}

/**
 * The "Generate content" action factories — the AI-generation counterpart to
 * `document-actions.ts`'s `createDocumentSaveAction`. Every collection that
 * owns a Document gets its four generation surfaces (whole-document, insert-
 * a-block, transform-a-block, transform-a-selection) by calling these four
 * factories once per owner+role, exactly like `saveNoteBodyAction` wraps
 * `createDocumentSaveAction` today — never a bespoke AI action per
 * collection.
 *
 * Each factory returns a single async function so it can be exported
 * directly from a collection's `'use server'` actions file (Next.js requires
 * every top-level export of such a file to itself be an async function, so
 * this module intentionally never bundles the four into one object).
 *
 * Authorization mirrors `createDocumentSaveAction` exactly: generating
 * content is gated by the same `requireEntryCapability` check as saving a
 * block, not a separate capability — an author can generate exactly where
 * they can already edit, no more.
 */

export type GenerateBlocksActionResult =
  { ok: true; blocks: Block[]; containsPlaceholders: boolean } | { ok: false; error: string };

export type GenerateTextActionResult = { ok: true; text: string } | { ok: false; error: string };

interface GenerateActionConfig<TOwner extends OwnableEntry> {
  ownerType: OwnerType;
  role: DocumentRole;
  findOwnerById: (id: string) => Promise<TOwner | null>;
}

async function authorize<TOwner extends OwnableEntry>(
  config: GenerateActionConfig<TOwner>,
  ownerId: string,
): Promise<string> {
  const owner = await config.findOwnerById(ownerId);
  if (!owner) {
    throw new Error('This entry no longer exists.');
  }
  const { userId } = await requireEntryCapability(owner);
  return userId;
}

export interface GenerateDocumentInput extends EditorialOptions {
  contentType: string;
  freeformText?: string;
  extractedDocumentText?: string[];
  images: GenerationImageInput[];
  outline?: DocumentOutlineHeading[];
}

export function createGenerateDocumentAction<TOwner extends OwnableEntry>(
  config: GenerateActionConfig<TOwner>,
) {
  return async function generateDocumentAction(
    ownerId: string,
    input: GenerateDocumentInput,
  ): Promise<GenerateBlocksActionResult> {
    try {
      const userId = await authorize(config, ownerId);
      const entry = await buildGenerationEntryMetadata(config.ownerType, ownerId, config.role);
      const images = await resolveTrustedImages(input.images);
      const result = await generateWithProvider(
        getContentGenerationProvider(),
        { action: 'document', entry, ...input, images },
        userId,
      );
      return { ok: true, blocks: result.blocks, containsPlaceholders: result.containsPlaceholders };
    } catch (error) {
      return { ok: false, error: describeAiError(error) };
    }
  };
}

export interface GenerateBlockInput extends EditorialOptions {
  instruction: string;
  suggestedBlockType?: BlockType;
  adjacent?: AdjacentBlockContext;
  outline?: DocumentOutlineHeading[];
}

export function createGenerateBlockAction<TOwner extends OwnableEntry>(
  config: GenerateActionConfig<TOwner>,
) {
  return async function generateBlockAction(
    ownerId: string,
    input: GenerateBlockInput,
  ): Promise<GenerateBlocksActionResult> {
    try {
      const userId = await authorize(config, ownerId);
      const entry = await buildGenerationEntryMetadata(config.ownerType, ownerId, config.role);
      const result = await generateWithProvider(
        getContentGenerationProvider(),
        { action: 'block', entry, ...input },
        userId,
      );
      return { ok: true, blocks: result.blocks, containsPlaceholders: result.containsPlaceholders };
    } catch (error) {
      return { ok: false, error: describeAiError(error) };
    }
  };
}

export interface TransformBlockInput {
  block: Block;
  instruction: BlockInstruction;
  additionalInstructions?: string;
  adjacent?: AdjacentBlockContext;
  outline?: DocumentOutlineHeading[];
}

export function createTransformBlockAction<TOwner extends OwnableEntry>(
  config: GenerateActionConfig<TOwner>,
) {
  return async function transformBlockAction(
    ownerId: string,
    input: TransformBlockInput,
  ): Promise<GenerateBlocksActionResult> {
    try {
      const userId = await authorize(config, ownerId);
      const entry = await buildGenerationEntryMetadata(config.ownerType, ownerId, config.role);
      const result = await generateWithProvider(
        getContentGenerationProvider(),
        { action: 'transform-block', entry, ...input },
        userId,
      );
      return { ok: true, blocks: result.blocks, containsPlaceholders: result.containsPlaceholders };
    } catch (error) {
      return { ok: false, error: describeAiError(error) };
    }
  };
}

export interface TransformSelectionInput {
  selectedText: string;
  instruction: TransformInstruction;
  targetLanguage?: string;
  surroundingText?: { before?: string; after?: string };
  outline?: DocumentOutlineHeading[];
}

export function createTransformSelectionAction<TOwner extends OwnableEntry>(
  config: GenerateActionConfig<TOwner>,
) {
  return async function transformSelectionAction(
    ownerId: string,
    input: TransformSelectionInput,
  ): Promise<GenerateTextActionResult> {
    try {
      const userId = await authorize(config, ownerId);
      const entry = await buildGenerationEntryMetadata(config.ownerType, ownerId, config.role);
      const result = await generateWithProvider(
        getContentGenerationProvider(),
        { action: 'transform-selection', entry, ...input },
        userId,
      );
      return { ok: true, text: result.text };
    } catch (error) {
      return { ok: false, error: describeAiError(error) };
    }
  };
}
