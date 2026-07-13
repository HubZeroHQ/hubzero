import { describe, expect, it } from 'vitest';
import { createDefaultBlock } from './block-ops';
import { createHistoryState, historyReducer } from './use-document-history';

const a = createDefaultBlock('divider', 'a');
const b = createDefaultBlock('divider', 'b');
const c = createDefaultBlock('divider', 'c');

describe('historyReducer', () => {
  it('undo restores the previous present and redo restores what was undone', () => {
    let state = createHistoryState([a]);
    state = historyReducer(state, { type: 'commit', blocks: [a, b], now: 0 });
    state = historyReducer(state, { type: 'commit', blocks: [a, b, c], now: 1000 });

    state = historyReducer(state, { type: 'undo' });
    expect(state.present).toEqual([a, b]);

    state = historyReducer(state, { type: 'undo' });
    expect(state.present).toEqual([a]);

    state = historyReducer(state, { type: 'redo' });
    expect(state.present).toEqual([a, b]);
  });

  it('undo/redo are no-ops at the stack boundaries', () => {
    const state = createHistoryState([a]);
    expect(historyReducer(state, { type: 'undo' })).toBe(state);

    const withOneCommit = historyReducer(state, { type: 'commit', blocks: [a, b], now: 0 });
    expect(historyReducer(withOneCommit, { type: 'redo' })).toBe(withOneCommit);
  });

  it('a new commit clears the redo stack', () => {
    let state = createHistoryState([a]);
    state = historyReducer(state, { type: 'commit', blocks: [a, b], now: 0 });
    state = historyReducer(state, { type: 'undo' });
    expect(state.future).toHaveLength(1);

    state = historyReducer(state, { type: 'commit', blocks: [a, c], now: 1000 });
    expect(state.future).toHaveLength(0);
  });

  it('coalesces same-key commits within the coalesce window into one undo step', () => {
    let state = createHistoryState([a]);
    state = historyReducer(state, {
      type: 'commit',
      blocks: [{ ...a }],
      coalesceKey: 'field:a',
      now: 0,
    });
    // Same key, well within the 800ms window — should not push a new past entry.
    state = historyReducer(state, {
      type: 'commit',
      blocks: [{ ...a }],
      coalesceKey: 'field:a',
      now: 100,
    });
    expect(state.past).toHaveLength(1); // just the initial present pushed once

    // Same key, but outside the coalesce window — pushes a new entry.
    state = historyReducer(state, {
      type: 'commit',
      blocks: [{ ...a }],
      coalesceKey: 'field:a',
      now: 5000,
    });
    expect(state.past).toHaveLength(2);
  });

  it('a different coalesce key always pushes a new entry even within the window', () => {
    let state = createHistoryState([a]);
    state = historyReducer(state, {
      type: 'commit',
      blocks: [b],
      coalesceKey: 'field:a',
      now: 0,
    });
    state = historyReducer(state, {
      type: 'commit',
      blocks: [c],
      coalesceKey: 'field:b',
      now: 50,
    });
    expect(state.past).toHaveLength(2);
  });
});
