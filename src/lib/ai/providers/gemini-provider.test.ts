import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DocumentGenerationRequest, SelectionTransformRequest } from '../types';

const generateContentMock = vi.fn();

vi.mock('@google/genai', () => ({
  GoogleGenAI: class {
    models = { generateContent: generateContentMock };
  },
  Type: {
    OBJECT: 'OBJECT',
    STRING: 'STRING',
    ARRAY: 'ARRAY',
    BOOLEAN: 'BOOLEAN',
    NUMBER: 'NUMBER',
    INTEGER: 'INTEGER',
  },
}));

vi.mock('@/lib/env', () => ({
  serverEnv: () => ({ GEMINI_API_KEY: 'test-api-key', AI_PROVIDER_TIMEOUT_MS: 30_000 }),
}));

const { GeminiProvider } = await import('./gemini-provider');
const { AiEmptyResponseError, AiInvalidRequestError, AiMalformedResponseError, AiProviderError } =
  await import('../errors');

const documentRequest: DocumentGenerationRequest = {
  action: 'document',
  entry: { ownerType: 'Note', role: 'body', title: 'Test' },
  contentType: 'journal entry',
  images: [],
};

const selectionRequest: SelectionTransformRequest = {
  action: 'transform-selection',
  entry: { ownerType: 'Note', role: 'body', title: 'Test' },
  selectedText: 'original',
  instruction: 'rewrite',
};

describe('GeminiProvider', () => {
  beforeEach(() => {
    generateContentMock.mockReset();
  });

  it('parses a valid JSON blocks response into a BlockGenerationResult', async () => {
    generateContentMock.mockResolvedValue({
      text: JSON.stringify({
        blocks: [{ id: 'b1', type: 'paragraph', data: { text: 'Hello.' } }],
        containsPlaceholders: false,
      }),
    });

    const provider = new GeminiProvider();
    const result = await provider.generate(documentRequest);

    expect(result.kind).toBe('blocks');
    if (result.kind === 'blocks') {
      expect(result.blocks).toHaveLength(1);
      expect(result.containsPlaceholders).toBe(false);
    }
  });

  it('parses a valid JSON text response into a TextGenerationResult', async () => {
    generateContentMock.mockResolvedValue({ text: JSON.stringify({ text: 'Rewritten.' }) });

    const provider = new GeminiProvider();
    const result = await provider.generate(selectionRequest);

    expect(result.kind).toBe('text');
    if (result.kind === 'text') {
      expect(result.text).toBe('Rewritten.');
    }
  });

  it('throws AiMalformedResponseError when the response is not valid JSON', async () => {
    generateContentMock.mockResolvedValue({ text: 'not json at all' });
    const provider = new GeminiProvider();
    await expect(provider.generate(documentRequest)).rejects.toBeInstanceOf(
      AiMalformedResponseError,
    );
  });

  it('throws AiMalformedResponseError when the JSON has no "blocks" array for a blocks action', async () => {
    generateContentMock.mockResolvedValue({ text: JSON.stringify({ oops: true }) });
    const provider = new GeminiProvider();
    await expect(provider.generate(documentRequest)).rejects.toBeInstanceOf(
      AiMalformedResponseError,
    );
  });

  it('throws AiEmptyResponseError when the model returns no text at all', async () => {
    generateContentMock.mockResolvedValue({ text: undefined });
    const provider = new GeminiProvider();
    await expect(provider.generate(documentRequest)).rejects.toBeInstanceOf(AiEmptyResponseError);
  });

  it('wraps a thrown SDK error in AiProviderError rather than leaking it directly', async () => {
    generateContentMock.mockRejectedValue(new Error('network exploded'));
    const provider = new GeminiProvider();
    await expect(provider.generate(documentRequest)).rejects.toBeInstanceOf(AiProviderError);
  });

  it('logs the classified provider error server-side without changing the thrown error', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const sdkError = Object.assign(
      new Error(
        JSON.stringify({
          error: { code: 429, status: 'RESOURCE_EXHAUSTED', message: 'Too many requests.' },
        }),
      ),
      {
        name: 'ApiError',
        status: 429,
      },
    );
    generateContentMock.mockRejectedValue(sdkError);
    const provider = new GeminiProvider();

    await expect(provider.generate(documentRequest)).rejects.toBeInstanceOf(AiProviderError);

    const loggedCalls = errorSpy.mock.calls.map((call) => JSON.stringify(call));
    expect(loggedCalls.some((call) => call.includes('rate-limit') && call.includes('429'))).toBe(
      true,
    );
    errorSpy.mockRestore();
  });

  it('throws AiInvalidRequestError instead of a generic provider error when Gemini reports the request is too large', async () => {
    const sdkError = Object.assign(
      new Error(
        JSON.stringify({
          error: {
            code: 400,
            status: 'INVALID_ARGUMENT',
            message: 'The input token count exceeds the maximum number of tokens allowed.',
          },
        }),
      ),
      { name: 'ApiError', status: 400 },
    );
    generateContentMock.mockRejectedValue(sdkError);
    const provider = new GeminiProvider();
    await expect(provider.generate(documentRequest)).rejects.toBeInstanceOf(AiInvalidRequestError);
  });

  it('drops reference images beyond the combined inline-payload budget rather than sending an oversized request', async () => {
    // Each image is ~5MB raw (under the per-image 4MB cap would be rejected, so use ~3MB each);
    // three of them comfortably exceeds the 12MB combined base64 budget.
    const threeMegabytes = 3 * 1024 * 1024;
    const fetchMock = vi.fn().mockImplementation(async () => ({
      ok: true,
      headers: { get: () => 'image/jpeg' },
      arrayBuffer: async () => new ArrayBuffer(threeMegabytes),
    }));
    vi.stubGlobal('fetch', fetchMock);

    generateContentMock.mockResolvedValue({
      text: JSON.stringify({ blocks: [], containsPlaceholders: false }),
    });
    const provider = new GeminiProvider();
    const requestWithImages = {
      ...documentRequest,
      images: [
        { mediaId: '1', url: 'https://example.com/1.jpg' },
        { mediaId: '2', url: 'https://example.com/2.jpg' },
        { mediaId: '3', url: 'https://example.com/3.jpg' },
        { mediaId: '4', url: 'https://example.com/4.jpg' },
      ],
    };

    await provider.generate(requestWithImages);

    const call = generateContentMock.mock.calls[0]![0];
    const imageParts = call.contents[0].parts.filter(
      (part: unknown) => (part as { inlineData?: unknown }).inlineData,
    );
    // 3MB raw -> ~4MB base64 per image; the 12MB budget fits 3, not all 4.
    expect(imageParts.length).toBeLessThan(4);
    vi.unstubAllGlobals();
  });

  it('passes a configurable timeout and cancellation signal to the SDK', async () => {
    generateContentMock.mockResolvedValue({ text: JSON.stringify({ text: 'Done.' }) });
    await new GeminiProvider().generate(selectionRequest);

    const config = generateContentMock.mock.calls[0]![0].config;
    expect(config.httpOptions.timeout).toBe(30_000);
    expect(config.abortSignal).toBeInstanceOf(AbortSignal);
  });

  it('passes systemInstruction and the structured response schema to the underlying SDK call', async () => {
    generateContentMock.mockResolvedValue({
      text: JSON.stringify({ blocks: [], containsPlaceholders: false }),
    });
    const provider = new GeminiProvider();
    await provider.generate(documentRequest);

    expect(generateContentMock).toHaveBeenCalledTimes(1);
    const call = generateContentMock.mock.calls[0]![0];
    expect(call.config.responseMimeType).toBe('application/json');
    expect(call.config.systemInstruction).toContain('HubZero');
    expect(call.config.responseSchema).toBeDefined();
  });
});
