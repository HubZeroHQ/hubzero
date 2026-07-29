import type {
  GenerateBlockInput,
  GenerateBlocksActionResult,
  GenerateDocumentInput,
  GenerateTextActionResult,
  TransformBlockInput,
  TransformSelectionInput,
} from '@/lib/studio/generate-content-actions';

/**
 * What `BlockEditor` needs to turn on every AI surface (the "Generate
 * content" toolbar entry, per-block actions, the selection toolbar, and
 * slash commands) for one Document. A collection's edit page builds this
 * once by binding its four `generate-content-actions.ts` factories to the
 * current entry's id — the same `.bind(null, id)` pattern already used for
 * `onSave` (`saveNoteBodyAction.bind(null, id)`).
 *
 * Omitting this prop entirely hides every AI affordance from `BlockEditor` —
 * AI assistance stays strictly opt-in per call site (CMS_PRODUCT_DESIGN.md
 * §30: "the blank editor with a cursor is what an editor sees first").
 */
export interface BlockEditorAiConfig {
  /** A short, human-facing name for what's being written — e.g. "case study", "technical documentation", "engineering journal entry", "write-up". Seeds the generation panel's content-type field. */
  contentTypeLabel: string;
  generateDocument: (input: GenerateDocumentInput) => Promise<GenerateBlocksActionResult>;
  generateBlock: (input: GenerateBlockInput) => Promise<GenerateBlocksActionResult>;
  transformBlock: (input: TransformBlockInput) => Promise<GenerateBlocksActionResult>;
  transformSelection: (input: TransformSelectionInput) => Promise<GenerateTextActionResult>;
}
