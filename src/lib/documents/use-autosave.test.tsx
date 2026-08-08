// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Block } from './blocks';
import { useAutosave, type AutosaveActionResult } from './use-autosave';

const blocks = (text: string): Block[] => [{ id: 'paragraph', type: 'paragraph', data: { text } }];

describe('useAutosave', () => {
  it('reports an edit through the synchronous live reference before React rerenders', () => {
    const initial = blocks('initial');
    const edited = blocks('typed before render');
    const liveBlocksRef = { current: initial };
    const { result } = renderHook(() =>
      useAutosave({
        blocks: initial,
        onSave: vi.fn(async () => ({})),
        delayMs: 60_000,
        liveBlocksRef,
      }),
    );

    liveBlocksRef.current = edited;

    expect(result.current.isDirtyNow()).toBe(true);
  });

  it('drains edits made during an in-flight save before resolving saveNow', async () => {
    let finishFirst!: (result: AutosaveActionResult) => void;
    const onSave = vi
      .fn<(value: Block[]) => Promise<AutosaveActionResult>>()
      .mockImplementationOnce(
        () =>
          new Promise<AutosaveActionResult>((resolve) => {
            finishFirst = resolve;
          }),
      )
      .mockResolvedValue({});

    const initial = blocks('initial');
    const firstEdit = blocks('first edit');
    const newestEdit = blocks('newest edit');
    const { result, rerender } = renderHook(
      ({ value }) => useAutosave({ blocks: value, onSave, delayMs: 60_000 }),
      { initialProps: { value: initial } },
    );

    rerender({ value: firstEdit });

    let firstFlush!: Promise<boolean>;
    act(() => {
      firstFlush = result.current.saveNow();
    });
    await act(async () => {
      await Promise.resolve();
    });

    rerender({ value: newestEdit });
    let roleSwitchFlush!: Promise<boolean>;
    act(() => {
      roleSwitchFlush = result.current.saveNow();
    });

    await act(async () => {
      finishFirst({});
      await expect(Promise.all([firstFlush, roleSwitchFlush])).resolves.toEqual([true, true]);
    });

    expect(onSave).toHaveBeenCalledTimes(2);
    expect(onSave.mock.calls[0]?.[0]).toBe(firstEdit);
    expect(onSave.mock.calls[1]?.[0]).toBe(newestEdit);
    expect(result.current.isDirty).toBe(false);
    expect(result.current.status).toBe('saved');
  });

  it('keeps failed work dirty and reports the failure', async () => {
    const onSave = vi.fn(async () => ({ error: 'Database unavailable.' }));
    const initial = blocks('initial');
    const edited = blocks('not yet persisted');
    const { result, rerender } = renderHook(
      ({ value }) => useAutosave({ blocks: value, onSave, delayMs: 60_000 }),
      { initialProps: { value: initial } },
    );

    rerender({ value: edited });
    await act(async () => {
      await expect(result.current.saveNow()).resolves.toBe(false);
    });

    expect(result.current.isDirty).toBe(true);
    expect(result.current.isDirtyNow()).toBe(true);
    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe('Database unavailable.');
  });

  it('does not send an invalid document or mark it saved', async () => {
    const onSave = vi.fn(async () => ({}));
    const initial = blocks('initial');
    const invalid: Block[] = [{ id: 'heading', type: 'heading', data: { level: 2, text: '' } }];
    const { result, rerender } = renderHook(
      ({ value }) => useAutosave({ blocks: value, onSave, delayMs: 60_000 }),
      { initialProps: { value: initial } },
    );

    rerender({ value: invalid });
    await act(async () => {
      await expect(result.current.saveNow()).resolves.toBe(false);
    });

    expect(onSave).not.toHaveBeenCalled();
    expect(result.current.status).toBe('invalid');
    expect(result.current.isDirty).toBe(true);
  });
});
