import type { ContentGenerationProvider } from './provider';
import { GeminiProvider } from './providers/gemini-provider';

/**
 * The one place a concrete provider is chosen (PLANNING.md §32). Adding a
 * second provider (OpenAI, Anthropic, a local model) means implementing
 * `ContentGenerationProvider` under `providers/` and adding a branch here —
 * never touching the editor, the server actions, or the Editorial System
 * that feeds every provider the same way. Multi-model routing later (e.g.
 * a lighter model for per-block transforms, a stronger one for whole-
 * document generation) is a change confined to this function's body.
 */
let cachedProvider: ContentGenerationProvider | undefined;

export function getContentGenerationProvider(): ContentGenerationProvider {
  if (!cachedProvider) {
    cachedProvider = new GeminiProvider();
  }
  return cachedProvider;
}
