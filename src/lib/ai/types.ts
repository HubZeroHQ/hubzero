import type { Block } from '@/lib/documents/blocks';
import type { DocumentRole, OwnerType } from '@/lib/documents/schema';

/**
 * HubZero's own vocabulary for AI generation requests/results
 * (PLANNING.md §32) — never a provider's native request/response shape.
 */

export interface GenerationEntryMetadata {
  ownerType: OwnerType;
  role: DocumentRole;
  title: string;
}

export interface GenerationImageInput {
  mediaId: string;
  url: string;
  description?: string;
}

export interface GenerationRequest {
  entry: GenerationEntryMetadata;
  /** Free-form text, notes, or pasted documentation supplied by the editor. */
  freeformText?: string;
  /** Text already extracted server-side from uploaded reference files (§31) — never persisted as Media. */
  extractedDocumentText?: string[];
  images: GenerationImageInput[];
  contentType: string;
  tone?: string;
}

export interface GenerationResult {
  blocks: Block[];
  /** True when the provider inserted at least one placeholder the author must resolve before publishing (§31). */
  containsPlaceholders: boolean;
}
