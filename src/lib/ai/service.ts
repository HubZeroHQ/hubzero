import { blockSchema, type Block } from '@/lib/documents/blocks';
import { createBlockId } from '@/lib/documents/block-ops';
import { AiEmptyResponseError, AiMalformedResponseError, AiRateLimitError } from './errors';
import type { ContentGenerationProvider } from './provider';
import { aiRateLimiter, type AiRateLimiter } from './rate-limit';
import type {
  BlockGenerationResult,
  GenerationRequest,
  GenerationResultFor,
  TextGenerationResult,
} from './types';

/**
 * The AI service layer PLANNING.md §32 calls the enforcement point: every
 * `ContentGenerationProvider` response passes through here before a server
 * action ever returns it to the editor. Two responsibilities live here and
 * nowhere else:
 *
 * - **Rate limiting** — checked before the provider is ever called, so a
 *   burst of retries never turns into a burst of billed API calls.
 * - **Result validation** — every returned block is re-parsed against the
 *   real `blockSchema` (not the looser Gemini-dialect schema used only to
 *   steer generation, `response-schema.ts`). A block that fails validation
 *   rejects the entire provider result, so the editor never receives a
 *   silently incomplete draft (§31).
 */

function reviveBlocks(rawBlocks: unknown[]): { blocks: Block[]; rejectedCount: number } {
  const blocks: Block[] = [];
  let rejectedCount = 0;
  for (const raw of rawBlocks) {
    const result = blockSchema.safeParse(raw);
    if (result.success) {
      // A model-supplied id is never trusted for uniqueness — it has no
      // visibility into the rest of the document's existing block ids.
      blocks.push({ ...result.data, id: createBlockId() } as Block);
    } else {
      rejectedCount += 1;
    }
  }
  return { blocks, rejectedCount };
}

function validateBlockResult(result: BlockGenerationResult): BlockGenerationResult {
  if (result.blocks.length > 100 || JSON.stringify(result.blocks).length > 200_000) {
    throw new AiMalformedResponseError('The AI response exceeded the safe block-output limit.');
  }
  const { blocks, rejectedCount } = reviveBlocks(result.blocks as unknown[]);
  if (rejectedCount > 0) {
    throw new AiMalformedResponseError(
      `${rejectedCount} block(s) the AI returned did not match the Document Engine's schema.`,
    );
  }
  if (blocks.length === 0) {
    throw new AiEmptyResponseError();
  }
  return { kind: 'blocks', blocks, containsPlaceholders: result.containsPlaceholders };
}

function validateTextResult(result: TextGenerationResult): TextGenerationResult {
  const text = result.text.trim();
  if (text.length === 0) {
    throw new AiEmptyResponseError();
  }
  if (text.length > 100_000) {
    throw new AiMalformedResponseError('The AI response exceeded the safe text-output limit.');
  }
  return { kind: 'text', text };
}

/**
 * The single entry point every server action calls through
 * (`lib/studio/actions/ai.ts`) — never the provider directly. Keeping rate
 * limiting and validation here, rather than duplicated per action, means a
 * new generation surface (a future slash command, a future block action)
 * gets both for free just by calling this function.
 */
export async function generateWithProvider<R extends GenerationRequest>(
  provider: ContentGenerationProvider,
  request: R,
  userId: string,
  rateLimiter: AiRateLimiter = aiRateLimiter,
): Promise<GenerationResultFor<R>> {
  const rateLimit = await rateLimiter.consume(userId);
  if (!rateLimit.allowed) {
    throw new AiRateLimitError('Too many AI requests in a short window.', rateLimit.retryAfterMs);
  }

  const result = await provider.generate(request);
  const validated =
    result.kind === 'blocks' ? validateBlockResult(result) : validateTextResult(result);
  return validated as GenerationResultFor<R>;
}
