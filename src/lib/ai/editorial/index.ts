/**
 * The Editorial System's public surface — everything outside this folder
 * (the provider, the service layer, tests) imports prompt-building
 * capability from here, never by reaching into individual guidance files
 * directly. Keeping one barrel is what makes "prompts maintainable
 * independently from the UI" (PLANNING.md §32) an enforceable rule rather
 * than a convention: a prompt change is a change inside `editorial/`, full
 * stop.
 */
export {
  getBlockUsageGuidance,
  renderBlockGuidanceTable,
  VISUAL_RHYTHM_GUIDANCE,
} from './block-guidance';
export {
  getCollectionGuidance,
  renderCollectionGuidance,
  type CollectionGuidance,
} from './collection-guidance';
export { FEW_SHOT_EXAMPLES } from './few-shot-examples';
export {
  getBlockInstructions,
  getInstructionGuidance,
  INSTRUCTION_GUIDANCE,
  SELECTION_INSTRUCTIONS,
  type InstructionGuidance,
} from './instructions';
export { MASTER_PROMPT } from './master-prompt';
export { buildPrompt, type BuiltPrompt } from './prompt-builder';
