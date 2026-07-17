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
  serverEnv: () => ({ GEMINI_API_KEY: 'test-api-key' }),
}));

const { GeminiProvider } = await import('./gemini-provider');
const { AiEmptyResponseError, AiMalformedResponseError, AiProviderError } =
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
