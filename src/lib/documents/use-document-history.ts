import { useCallback, useReducer } from 'react';
import type { Block } from './blocks';

/**
 * Undo/redo for the block canvas. The existing editor state was already a
 * single `Block[]` array updated by pure functions (`block-ops.ts`), which
 * is exactly the shape a past/present/future history stack needs — no
 * architectural change was required to "naturally support" undo/redo, only
 * routing every mutation through `commit` instead of `setState` directly.
 *
 * Structural edits (insert/remove/reorder/duplicate) always push a new
 * history entry immediately. Field edits (typing in a textarea) pass a
 * `coalesceKey` (typically the block id + field name) so a burst of
 * keystrokes within `COALESCE_WINDOW_MS` collapses into one undo step
 * instead of one per character — otherwise Ctrl+Z would feel like it does
 * nothing, undoing a single keystroke at a time.
 */

export const COALESCE_WINDOW_MS = 800;
const MAX_HISTORY_ENTRIES = 100;

export interface HistoryState {
  past: Block[][];
  present: Block[];
  future: Block[][];
  lastCoalesceKey: string | null;
  lastCommitAt: number;
}

export type HistoryAction =
  | { type: 'commit'; blocks: Block[]; coalesceKey?: string; now: number }
  | { type: 'undo' }
  | { type: 'redo' };

export function createHistoryState(initialBlocks: Block[]): HistoryState {
  return { past: [], present: initialBlocks, future: [], lastCoalesceKey: null, lastCommitAt: 0 };
}

export function historyReducer(state: HistoryState, action: HistoryAction): HistoryState {
  switch (action.type) {
    case 'commit': {
      const shouldCoalesce =
        action.coalesceKey !== undefined &&
        action.coalesceKey === state.lastCoalesceKey &&
        action.now - state.lastCommitAt < COALESCE_WINDOW_MS;

      if (shouldCoalesce) {
        return { ...state, present: action.blocks, lastCommitAt: action.now };
      }

      return {
        past: [...state.past, state.present].slice(-MAX_HISTORY_ENTRIES),
        present: action.blocks,
        future: [],
        lastCoalesceKey: action.coalesceKey ?? null,
        lastCommitAt: action.now,
      };
    }
    case 'undo': {
      if (state.past.length === 0) {
        return state;
      }
      const previous = state.past[state.past.length - 1]!;
      return {
        past: state.past.slice(0, -1),
        present: previous,
        future: [state.present, ...state.future],
        lastCoalesceKey: null,
        lastCommitAt: state.lastCommitAt,
      };
    }
    case 'redo': {
      if (state.future.length === 0) {
        return state;
      }
      const [next, ...rest] = state.future;
      return {
        past: [...state.past, state.present],
        present: next!,
        future: rest,
        lastCoalesceKey: null,
        lastCommitAt: state.lastCommitAt,
      };
    }
    default:
      return state;
  }
}

export function useDocumentHistory(initialBlocks: Block[]) {
  const [state, dispatch] = useReducer(historyReducer, initialBlocks, createHistoryState);

  const commit = useCallback((blocks: Block[], coalesceKey?: string) => {
    dispatch({ type: 'commit', blocks, coalesceKey, now: Date.now() });
  }, []);

  const undo = useCallback(() => dispatch({ type: 'undo' }), []);
  const redo = useCallback(() => dispatch({ type: 'redo' }), []);

  return {
    blocks: state.present,
    commit,
    undo,
    redo,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
  };
}
