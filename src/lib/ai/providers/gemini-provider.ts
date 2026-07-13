import type { ContentGenerationProvider } from '../provider';
import type { GenerationRequest, GenerationResult } from '../types';

/**
 * Translates to and from Gemini's actual request/response shape internally
 * — nothing Gemini-specific (request format, content-part structure, safety
 * settings) ever crosses the `ContentGenerationProvider` boundary
 * (PLANNING.md §32).
 *
 * Generation itself is intentionally not implemented yet — AI-assisted
 * content generation is Phase 13 (§38), layered on top of a stable Document
 * Engine. This class only establishes the seam the editor's future
 * "Generate Content" action will call into.
 */
export class GeminiProvider implements ContentGenerationProvider {
  readonly name = 'gemini';

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async generate(request: GenerationRequest): Promise<GenerationResult> {
    throw new Error(
      'GeminiProvider.generate() is not implemented yet — AI-assisted content generation ships in Phase 13.',
    );
  }
}
