import type { ClassifiedProviderError } from './providers/gemini-error';

/**
 * Server-only logging for the AI generation pipeline. Nothing here is ever
 * returned to a client — `generate-content-actions.ts` still hands the
 * caller whatever `describeAiError` produces. This is the diagnostic trail
 * an operator reads in server logs to tell "Gemini returned 429" apart from
 * "the request payload was too large" apart from "the network died",
 * none of which `describeAiError`'s single generic provider message can
 * distinguish on its own.
 */

/** Rough chars-per-token ratio for English prose — good enough to flag "this is clearly too big," not an exact count. Real tokenization varies by model and content. */
const CHARS_PER_TOKEN_ESTIMATE = 4;

function estimateTokens(chars: number): number {
  return Math.ceil(chars / CHARS_PER_TOKEN_ESTIMATE);
}

export interface GenerationRequestMetrics {
  action: string;
  systemInstructionChars: number;
  userPromptChars: number;
  extractedDocumentChars: number;
  extractedDocumentCount: number;
  imageCount: number;
  imageDroppedCount: number;
  imageBase64Bytes: number;
  totalChars: number;
  estimatedTokens: number;
  estimatedRequestBytes: number;
}

export function buildGenerationRequestMetrics(input: {
  action: string;
  systemInstruction: string;
  userPrompt: string;
  extractedDocumentText?: string[];
  imageCount: number;
  imageDroppedCount: number;
  imageBase64Bytes: number;
}): GenerationRequestMetrics {
  const systemInstructionChars = input.systemInstruction.length;
  const userPromptChars = input.userPrompt.length;
  const extractedDocumentChars = (input.extractedDocumentText ?? []).reduce(
    (sum, text) => sum + text.length,
    0,
  );
  const totalChars = systemInstructionChars + userPromptChars;

  return {
    action: input.action,
    systemInstructionChars,
    userPromptChars,
    extractedDocumentChars,
    extractedDocumentCount: input.extractedDocumentText?.length ?? 0,
    imageCount: input.imageCount,
    imageDroppedCount: input.imageDroppedCount,
    imageBase64Bytes: input.imageBase64Bytes,
    totalChars,
    estimatedTokens: estimateTokens(totalChars),
    // Text is sent as UTF-8 (~1 byte/char for ASCII prompt text) alongside the
    // already-base64 image bytes — approximate, not a wire-accurate count.
    estimatedRequestBytes: totalChars + input.imageBase64Bytes,
  };
}

export function logGenerationRequestMetrics(metrics: GenerationRequestMetrics): void {
  console.info('[ai:gemini] request size', metrics);
}

export function logImagesDropped(context: {
  action: string;
  droppedCount: number;
  includedCount: number;
  budgetBytes: number;
}): void {
  console.warn(
    `[ai:gemini] dropped ${context.droppedCount} reference image(s) to stay within the ${context.budgetBytes}-byte inline request budget`,
    { action: context.action, includedCount: context.includedCount },
  );
}

/**
 * The one place a provider failure is actually logged with enough detail to
 * debug — provider name, HTTP status, error code/status, provider message,
 * and (for real `Error` instances) a stack trace. Never called with
 * information that should reach the end user; `describeAiError` (`errors.ts`)
 * remains the only translator from a thrown error to user-facing copy.
 */
export function logProviderFailure(
  context: {
    provider: string;
    action: string;
    metrics?: GenerationRequestMetrics;
  } & ClassifiedProviderError,
  rawError: unknown,
): void {
  console.error('[ai:gemini] provider request failed', {
    provider: context.provider,
    action: context.action,
    category: context.category,
    httpStatus: context.httpStatus,
    errorCode: context.errorCode,
    errorStatus: context.errorStatus,
    providerMessage: context.providerMessage,
    metrics: context.metrics,
  });
  if (rawError instanceof Error) {
    console.error(rawError.stack ?? rawError.message);
  } else {
    console.error('[ai:gemini] non-Error value thrown by provider:', rawError);
  }
}
