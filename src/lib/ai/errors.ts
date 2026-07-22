/**
 * Typed failure modes for AI generation, kept distinct so
 * `lib/studio/actions/ai.ts` can surface a specific, honest message rather
 * than a single generic "something went wrong" for every case (empty
 * response, malformed JSON, upstream outage, and a client-side rate limit
 * are different problems with different fixes for the author).
 */

class AiGenerationError extends Error {}

export class AiInvalidRequestError extends AiGenerationError {
  constructor(message = 'The AI request was invalid or too large.') {
    super(message);
    this.name = 'AiInvalidRequestError';
  }
}

export class AiTimeoutError extends AiGenerationError {
  constructor(message = 'The AI request timed out.') {
    super(message);
    this.name = 'AiTimeoutError';
  }
}

/** The provider itself failed — network error, non-2xx response, SDK exception. Never exposes the provider's raw error shape past this boundary. */
export class AiProviderError extends AiGenerationError {
  constructor(
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'AiProviderError';
  }
}

/** The provider returned a response that doesn't parse as JSON, or that fails `blockSchema`/text-shape validation — rejected, never silently coerced (§31). */
export class AiMalformedResponseError extends AiGenerationError {
  constructor(
    message: string,
    readonly issues: string[] = [],
  ) {
    super(message);
    this.name = 'AiMalformedResponseError';
  }
}

/** The provider returned a technically-valid but empty result (no blocks, blank text). */
export class AiEmptyResponseError extends AiGenerationError {
  constructor(message = 'The AI returned an empty response. Try again or add more context.') {
    super(message);
    this.name = 'AiEmptyResponseError';
  }
}

/** A caller exceeded the per-user request budget (`rate-limit.ts`). */
export class AiRateLimitError extends AiGenerationError {
  constructor(
    message: string,
    readonly retryAfterMs: number,
  ) {
    super(message);
    this.name = 'AiRateLimitError';
  }
}

/** Converts any thrown value into a plain, user-facing message — the one place server actions translate an AI failure into copy an author reads. */
export function describeAiError(error: unknown): string {
  if (error instanceof AiInvalidRequestError) {
    return error.message;
  }
  if (error instanceof AiTimeoutError) {
    return 'The AI request took too long, so it was cancelled. Nothing was changed. Try again with less context.';
  }
  if (error instanceof AiRateLimitError) {
    const seconds = Math.ceil(error.retryAfterMs / 1000);
    return `You're generating content too quickly. Try again in about ${seconds}s.`;
  }
  if (error instanceof AiEmptyResponseError) {
    return error.message;
  }
  if (error instanceof AiMalformedResponseError) {
    return 'The AI response didn’t match the expected format, so nothing was inserted. Try again or narrow your request.';
  }
  if (error instanceof AiProviderError) {
    return 'The AI provider couldn’t complete this request. Try again in a moment.';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Something went wrong generating content.';
}
