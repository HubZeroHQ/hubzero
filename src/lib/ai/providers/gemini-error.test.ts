import { describe, expect, it } from 'vitest';
import { classifyGeminiError } from './gemini-error';

/** Mirrors the shape `@google/genai`'s `ApiError` actually throws (`throwErrorIfNotOK`): `name: 'ApiError'`, an HTTP `status`, and a `message` that is itself a JSON-stringified `{ error: {...} }` body. */
function apiError(status: number, body: { code?: number; status?: string; message: string }) {
  return Object.assign(new Error(JSON.stringify({ error: body })), { name: 'ApiError', status });
}

describe('classifyGeminiError', () => {
  it('classifies 401/UNAUTHENTICATED as authentication', () => {
    const result = classifyGeminiError(
      apiError(401, { code: 401, status: 'UNAUTHENTICATED', message: 'API key not valid.' }),
    );
    expect(result.category).toBe('authentication');
    expect(result.httpStatus).toBe(401);
    expect(result.providerMessage).toBe('API key not valid.');
  });

  it('classifies 403/PERMISSION_DENIED as authentication', () => {
    const result = classifyGeminiError(
      apiError(403, { code: 403, status: 'PERMISSION_DENIED', message: 'Permission denied.' }),
    );
    expect(result.category).toBe('authentication');
  });

  it('classifies 429/RESOURCE_EXHAUSTED with "quota" wording as quota', () => {
    const result = classifyGeminiError(
      apiError(429, {
        code: 429,
        status: 'RESOURCE_EXHAUSTED',
        message: 'Resource has been exhausted (e.g. check quota).',
      }),
    );
    expect(result.category).toBe('quota');
  });

  it('classifies 429/RESOURCE_EXHAUSTED with plain rate wording as rate-limit', () => {
    const result = classifyGeminiError(
      apiError(429, {
        code: 429,
        status: 'RESOURCE_EXHAUSTED',
        message: 'Too many requests per minute.',
      }),
    );
    expect(result.category).toBe('rate-limit');
  });

  it('classifies 400/INVALID_ARGUMENT with token wording as request-too-large', () => {
    const result = classifyGeminiError(
      apiError(400, {
        code: 400,
        status: 'INVALID_ARGUMENT',
        message: 'The input token count (1234567) exceeds the maximum number of tokens allowed.',
      }),
    );
    expect(result.category).toBe('request-too-large');
  });

  it('classifies 400/INVALID_ARGUMENT with generic wording as invalid-request', () => {
    const result = classifyGeminiError(
      apiError(400, {
        code: 400,
        status: 'INVALID_ARGUMENT',
        message: 'Invalid value for field "temperature".',
      }),
    );
    expect(result.category).toBe('invalid-request');
  });

  it('classifies 413 as request-too-large', () => {
    const result = classifyGeminiError(apiError(413, { message: 'Payload too large.' }));
    expect(result.category).toBe('request-too-large');
  });

  it('classifies 404/NOT_FOUND (e.g. a deprecated model name) as invalid-request', () => {
    const result = classifyGeminiError(
      apiError(404, {
        code: 404,
        status: 'NOT_FOUND',
        message: 'This model models/gemini-2.5-flash is no longer available to new users.',
      }),
    );
    expect(result.category).toBe('invalid-request');
    expect(result.httpStatus).toBe(404);
  });

  it('classifies 500/INTERNAL as provider-internal', () => {
    const result = classifyGeminiError(
      apiError(500, { code: 500, status: 'INTERNAL', message: 'Internal error encountered.' }),
    );
    expect(result.category).toBe('provider-internal');
  });

  it('classifies 503/UNAVAILABLE as provider-internal', () => {
    const result = classifyGeminiError(
      apiError(503, { code: 503, status: 'UNAVAILABLE', message: 'The model is overloaded.' }),
    );
    expect(result.category).toBe('provider-internal');
  });

  it('classifies a SyntaxError as json-parse', () => {
    const result = classifyGeminiError(new SyntaxError('Unexpected token < in JSON'));
    expect(result.category).toBe('json-parse');
  });

  it('classifies a streaming-related plain Error as streaming', () => {
    const result = classifyGeminiError(
      new Error('Incomplete JSON segment at the end of the stream'),
    );
    expect(result.category).toBe('streaming');
  });

  it('classifies a network-related plain Error as network', () => {
    const result = classifyGeminiError(new Error('fetch failed'));
    expect(result.category).toBe('network');
  });

  it('classifies an unrecognized plain Error as unknown', () => {
    const result = classifyGeminiError(new Error('something odd happened'));
    expect(result.category).toBe('unknown');
    expect(result.providerMessage).toBe('something odd happened');
  });

  it('classifies a non-Error thrown value as unknown', () => {
    const result = classifyGeminiError('a plain string was thrown');
    expect(result.category).toBe('unknown');
    expect(result.providerMessage).toBeUndefined();
  });

  it('falls back gracefully when ApiError.message is not JSON', () => {
    const err = Object.assign(new Error('plain text error body'), {
      name: 'ApiError',
      status: 400,
    });
    const result = classifyGeminiError(err);
    expect(result.httpStatus).toBe(400);
    expect(result.providerMessage).toBe('plain text error body');
    expect(result.category).toBe('invalid-request');
  });
});
