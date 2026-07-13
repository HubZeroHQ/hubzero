import type { GenerationRequest, GenerationResult } from './types';

/**
 * The Studio talks to language models only through this interface — never
 * through a provider's native request/response shapes (PLANNING.md §32).
 * Swapping providers means implementing this interface; zero changes to
 * the editor or the block schema it targets. The service layer, not the
 * model, validates every result against `blockSchema` (§25, §31) before it
 * ever reaches the editor.
 */
export interface ContentGenerationProvider {
  readonly name: string;
  generate(request: GenerationRequest): Promise<GenerationResult>;
}
