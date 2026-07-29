import type { GenerationRequest, GenerationResultFor } from './types';

/**
 * The Studio talks to language models only through this interface — never
 * through a provider's native request/response shapes (PLANNING.md §32).
 * Swapping providers means implementing this interface; zero changes to the
 * editor, the server actions that call it, or the block schema it targets.
 *
 * A single generic method rather than one method per action: the return
 * type is still precisely narrowed per call (`GenerationResultFor<R>`), so
 * a caller passing a `SelectionTransformRequest` gets `TextGenerationResult`
 * back without an `as` cast, while a `DocumentGenerationRequest` caller gets
 * `BlockGenerationResult` — without the interface repeating four near-
 * identical method signatures.
 *
 * The service layer (`service.ts`), not the model, validates every result
 * against `blockSchema` (§25, §31) before it ever reaches the editor — a
 * misbehaving or malformed provider response fails safely there, not here.
 */
export interface ContentGenerationProvider {
  readonly name: string;
  generate<R extends GenerationRequest>(request: R): Promise<GenerationResultFor<R>>;
}
