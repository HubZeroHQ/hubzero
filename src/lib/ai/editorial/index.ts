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
  getBlockInstructions,
  getInstructionGuidance,
  SELECTION_INSTRUCTIONS,
} from './instructions';
export { buildPrompt } from './prompt-builder';
