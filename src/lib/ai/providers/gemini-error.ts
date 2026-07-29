/**
 * Classifies whatever the `@google/genai` SDK throws into a specific failure
 * mode, so the provider boundary (`gemini-provider.ts`) can log something
 * actionable instead of a bare `Error: fetch failed`. The SDK's `ApiError`
 * (see `node_modules/@google/genai/dist/node/index.mjs`, `throwErrorIfNotOK`)
 * carries the HTTP status plus a `message` that is itself a JSON-stringified
 * Google API error body — `{ error: { code, message, status } }` — so most of
 * the real signal is one `JSON.parse` away, but never surfaced past the
 * generic `AiProviderError` today.
 */

type ProviderErrorCategory =
  | 'request-too-large'
  | 'timeout'
  | 'rate-limit'
  | 'authentication'
  | 'quota'
  | 'invalid-request'
  | 'provider-internal'
  | 'json-parse'
  | 'streaming'
  | 'network'
  | 'unknown';

export interface ClassifiedProviderError {
  category: ProviderErrorCategory;
  httpStatus?: number;
  errorCode?: string | number;
  errorStatus?: string;
  providerMessage?: string;
}

interface GoogleApiErrorBody {
  code?: number;
  status?: string;
  message?: string;
}

/** `ApiError.message` is a JSON-stringified `{ error: {...} }` body (see `throwErrorIfNotOK`) — not always, so this degrades to `undefined` rather than throwing. */
function parseGoogleApiErrorBody(message: string): GoogleApiErrorBody | undefined {
  try {
    const parsed: unknown = JSON.parse(message);
    if (parsed && typeof parsed === 'object' && 'error' in parsed) {
      const err = (parsed as { error: unknown }).error;
      if (err && typeof err === 'object') {
        return err as GoogleApiErrorBody;
      }
    }
  } catch {
    // Not a JSON body — the raw message is all we have.
  }
  return undefined;
}

const REQUEST_TOO_LARGE_PATTERN =
  /token|context length|context window|too long|too large|exceeds the maximum|payload size|request size|request entity too large/i;
const QUOTA_PATTERN = /quota/i;

function isGeminiApiError(
  error: unknown,
): error is { name: string; status?: number; message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    (error as { name: unknown }).name === 'ApiError'
  );
}

export function classifyGeminiError(error: unknown): ClassifiedProviderError {
  if (isGeminiApiError(error)) {
    const body = parseGoogleApiErrorBody(error.message);
    const providerMessage = body?.message ?? error.message;
    const httpStatus = error.status;
    const errorStatus = body?.status;
    const errorCode = body?.code ?? httpStatus;

    let category: ProviderErrorCategory = 'unknown';
    if (
      httpStatus === 401 ||
      httpStatus === 403 ||
      errorStatus === 'UNAUTHENTICATED' ||
      errorStatus === 'PERMISSION_DENIED'
    ) {
      category = 'authentication';
    } else if (httpStatus === 429 || errorStatus === 'RESOURCE_EXHAUSTED') {
      category = providerMessage && QUOTA_PATTERN.test(providerMessage) ? 'quota' : 'rate-limit';
    } else if (httpStatus === 413) {
      category = 'request-too-large';
    } else if (httpStatus === 404 || errorStatus === 'NOT_FOUND') {
      // Most commonly a deprecated/misconfigured model name rather than a
      // caller mistake, but it's still a bad request from the API's
      // perspective — surfaced distinctly via `errorStatus`/`providerMessage`
      // in the logs for whoever investigates.
      category = 'invalid-request';
    } else if (httpStatus === 400 || errorStatus === 'INVALID_ARGUMENT') {
      category =
        providerMessage && REQUEST_TOO_LARGE_PATTERN.test(providerMessage)
          ? 'request-too-large'
          : 'invalid-request';
    } else if (
      (httpStatus !== undefined && httpStatus >= 500) ||
      errorStatus === 'INTERNAL' ||
      errorStatus === 'UNAVAILABLE'
    ) {
      category = 'provider-internal';
    }

    return { category, httpStatus, errorCode, errorStatus, providerMessage };
  }

  if (error instanceof SyntaxError) {
    return { category: 'json-parse', providerMessage: error.message };
  }

  if (error instanceof Error) {
    if (/stream/i.test(error.message)) {
      return { category: 'streaming', providerMessage: error.message };
    }
    if (/fetch failed|ECONNRESET|ENOTFOUND|EAI_AGAIN|network/i.test(error.message)) {
      return { category: 'network', providerMessage: error.message };
    }
    return { category: 'unknown', providerMessage: error.message };
  }

  return { category: 'unknown' };
}
