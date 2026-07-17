import { GoogleGenAI } from '@google/genai';
import type { Block } from '@/lib/documents/blocks';
import { serverEnv } from '@/lib/env';
import { buildPrompt } from '../editorial';
import {
  AiEmptyResponseError,
  AiMalformedResponseError,
  AiProviderError,
  AiTimeoutError,
} from '../errors';
import type { ContentGenerationProvider } from '../provider';
import { BLOCKS_RESPONSE_SCHEMA, TEXT_RESPONSE_SCHEMA } from '../response-schema';
import type {
  BlockGenerationResult,
  GenerationImageInput,
  GenerationRequest,
  GenerationResultFor,
  TextGenerationResult,
} from '../types';

/** Fast, cheap, and JSON-structured-output-capable — the right default for authoring assistance rather than a heavier reasoning model. */
const DEFAULT_MODEL = 'gemini-2.5-flash';

/** Keeps a single reference image request from stalling generation or blowing past a reasonable payload size. */
const MAX_IMAGE_INPUTS = 4;
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const IMAGE_FETCH_TIMEOUT_MS = 8_000;

let cachedClient: GoogleGenAI | undefined;

function getClient(): GoogleGenAI {
  if (cachedClient) {
    return cachedClient;
  }
  const apiKey = serverEnv().GEMINI_API_KEY;
  if (!apiKey) {
    throw new AiProviderError(
      'GEMINI_API_KEY is not configured — AI generation is unavailable until it is set.',
    );
  }
  cachedClient = new GoogleGenAI({ apiKey });
  return cachedClient;
}

/**
 * Best-effort image fetch for multimodal context (PLANNING.md §31 — "the AI
 * determines where reference images logically belong"). A failed fetch never
 * fails the whole generation: the model still receives the image's
 * description as text context (`prompt-builder.ts`), just without the pixels
 * themselves. Images already live in Cloudinary (§26.10) and are fetched
 * fresh per request — never cached or persisted here.
 */
async function fetchImagePart(
  image: GenerationImageInput,
): Promise<{ inlineData: { mimeType: string; data: string } } | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), IMAGE_FETCH_TIMEOUT_MS);
    try {
      const response = await fetch(image.url, { signal: controller.signal });
      if (!response.ok) return null;
      const contentType = response.headers.get('content-type') ?? 'image/jpeg';
      if (!contentType.startsWith('image/')) return null;
      const buffer = await response.arrayBuffer();
      if (buffer.byteLength > MAX_IMAGE_BYTES) return null;
      return {
        inlineData: { mimeType: contentType, data: Buffer.from(buffer).toString('base64') },
      };
    } finally {
      clearTimeout(timeout);
    }
  } catch {
    return null;
  }
}

/**
 * Translates to and from Gemini's actual request/response shape internally
 * — nothing Gemini-specific (request format, content-part structure, safety
 * settings) ever crosses the `ContentGenerationProvider` boundary
 * (PLANNING.md §32). The Editorial System (`editorial/prompt-builder.ts`)
 * supplies the system instruction and user prompt; this class only handles
 * the wire format, structured-output configuration, and translating a
 * successful or failed API call into HubZero's own result/error vocabulary.
 * Structural JSON validity is checked here (can we even parse a `blocks`
 * array out of it); per-block schema validation against `blockSchema`
 * happens one layer up, in `service.ts`.
 */
export class GeminiProvider implements ContentGenerationProvider {
  readonly name = 'gemini';

  async generate<R extends GenerationRequest>(request: R): Promise<GenerationResultFor<R>> {
    const { systemInstruction, userPrompt } = buildPrompt(request);
    const isBlocksAction = request.action !== 'transform-selection';

    const imageParts =
      request.action === 'document'
        ? (
            await Promise.all(
              request.images.slice(0, MAX_IMAGE_INPUTS).map((image) => fetchImagePart(image)),
            )
          ).filter((part): part is NonNullable<typeof part> => part !== null)
        : [];

    let responseText: string | undefined;
    const timeoutMs = serverEnv().AI_PROVIDER_TIMEOUT_MS;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const client = getClient();
      const response = await client.models.generateContent({
        model: DEFAULT_MODEL,
        contents: [
          {
            role: 'user',
            parts: [{ text: userPrompt }, ...imageParts],
          },
        ],
        config: {
          abortSignal: controller.signal,
          httpOptions: { timeout: timeoutMs },
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: isBlocksAction ? BLOCKS_RESPONSE_SCHEMA : TEXT_RESPONSE_SCHEMA,
          temperature: 0.7,
        },
      });
      responseText = response.text;
    } catch (error) {
      if (controller.signal.aborted) {
        throw new AiTimeoutError();
      }
      throw new AiProviderError('The Gemini API request failed.', error);
    } finally {
      clearTimeout(timeout);
    }

    if (!responseText || responseText.trim().length === 0) {
      throw new AiEmptyResponseError();
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      throw new AiMalformedResponseError('The AI response was not valid JSON.');
    }

    if (!isBlocksAction) {
      const text = (parsed as { text?: unknown }).text;
      if (typeof text !== 'string' || text.trim().length === 0) {
        throw new AiEmptyResponseError();
      }
      const result: TextGenerationResult = { kind: 'text', text };
      return result as GenerationResultFor<R>;
    }

    const blocks = (parsed as { blocks?: unknown }).blocks;
    const containsPlaceholders = (parsed as { containsPlaceholders?: unknown })
      .containsPlaceholders;
    if (!Array.isArray(blocks)) {
      throw new AiMalformedResponseError('The AI response did not contain a "blocks" array.');
    }

    const result: BlockGenerationResult = {
      kind: 'blocks',
      blocks: blocks as Block[],
      containsPlaceholders: containsPlaceholders === true,
    };
    return result as GenerationResultFor<R>;
  }
}
