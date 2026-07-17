import { describe, expect, it } from 'vitest';
import type { Block } from '@/lib/documents/blocks';
import { AiEmptyResponseError, AiMalformedResponseError, AiRateLimitError } from './errors';
import { resetRateLimitForTests } from './rate-limit';
import { generateWithProvider } from './service';
import type {
  BlockGenerationResult,
  DocumentGenerationRequest,
  GenerationRequest,
  GenerationResultFor,
  SelectionTransformRequest,
  TextGenerationResult,
} from './types';

const baseEntry: DocumentGenerationRequest['entry'] = {
  ownerType: 'Note',
  role: 'body',
  title: 'Test note',
};

function fakeProvider(result: BlockGenerationResult | TextGenerationResult) {
  return {
    name: 'fake',
    generate: async <R extends GenerationRequest>(): Promise<GenerationResultFor<R>> =>
      result as GenerationResultFor<R>,
  };
}

const documentRequest: DocumentGenerationRequest = {
  action: 'document',
  entry: baseEntry,
  contentType: 'engineering journal entry',
  images: [],
};

const selectionRequest: SelectionTransformRequest = {
  action: 'transform-selection',
  entry: baseEntry,
  selectedText: 'the original text',
  instruction: 'rewrite',
};

describe('generateWithProvider', () => {
  it('returns validated blocks with freshly assigned ids, discarding whatever id the model supplied', async () => {
    resetRateLimitForTests('user-1');
    const modelBlock = { id: 'not-unique', type: 'paragraph', data: { text: 'Hello.' } } as Block;
    const provider = fakeProvider({
      kind: 'blocks',
      blocks: [modelBlock],
      containsPlaceholders: false,
    });

    const result = await generateWithProvider(provider, documentRequest, 'user-1');

    expect(result.kind).toBe('blocks');
    expect(result.blocks).toHaveLength(1);
    expect(result.blocks[0]!.id).not.toBe('not-unique');
    expect(result.blocks[0]).toMatchObject({ type: 'paragraph', data: { text: 'Hello.' } });
  });

  it('rejects the entire result when any returned block is invalid', async () => {
    resetRateLimitForTests('user-2');
    const valid = { id: 'a', type: 'paragraph', data: { text: 'Real content.' } };
    const invalid = { id: 'b', type: 'paragraph', data: { text: 123 } }; // wrong type for `text`
    const provider = fakeProvider({
      kind: 'blocks',
      blocks: [valid, invalid] as unknown as Block[],
      containsPlaceholders: false,
    });

    await expect(generateWithProvider(provider, documentRequest, 'user-2')).rejects.toBeInstanceOf(
      AiMalformedResponseError,
    );
  });

  it('throws AiMalformedResponseError when every returned block is invalid', async () => {
    resetRateLimitForTests('user-3');
    const invalid = { id: 'a', type: 'paragraph', data: { text: 123 } };
    const provider = fakeProvider({
      kind: 'blocks',
      blocks: [invalid] as unknown as Block[],
      containsPlaceholders: false,
    });

    await expect(generateWithProvider(provider, documentRequest, 'user-3')).rejects.toBeInstanceOf(
      AiMalformedResponseError,
    );
  });

  it('throws AiEmptyResponseError when the provider returns zero blocks', async () => {
    resetRateLimitForTests('user-4');
    const provider = fakeProvider({ kind: 'blocks', blocks: [], containsPlaceholders: false });

    await expect(generateWithProvider(provider, documentRequest, 'user-4')).rejects.toBeInstanceOf(
      AiEmptyResponseError,
    );
  });

  it('throws AiEmptyResponseError for a blank text result', async () => {
    resetRateLimitForTests('user-5');
    const provider = fakeProvider({ kind: 'text', text: '   ' });

    await expect(generateWithProvider(provider, selectionRequest, 'user-5')).rejects.toBeInstanceOf(
      AiEmptyResponseError,
    );
  });

  it('returns trimmed text for a valid selection transform', async () => {
    resetRateLimitForTests('user-6');
    const provider = fakeProvider({ kind: 'text', text: '  Rewritten text.  ' });

    const result = await generateWithProvider(provider, selectionRequest, 'user-6');
    expect(result.kind).toBe('text');
    expect(result.text).toBe('Rewritten text.');
  });

  it('throws AiRateLimitError once the per-user budget is exceeded', async () => {
    resetRateLimitForTests('user-7');
    const provider = fakeProvider({
      kind: 'blocks',
      blocks: [{ id: 'a', type: 'paragraph', data: { text: 'x' } }] as Block[],
      containsPlaceholders: false,
    });

    for (let i = 0; i < 8; i += 1) {
      await generateWithProvider(provider, documentRequest, 'user-7');
    }

    await expect(generateWithProvider(provider, documentRequest, 'user-7')).rejects.toBeInstanceOf(
      AiRateLimitError,
    );
  });
});
