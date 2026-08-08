import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react';
import type { Block } from './blocks';
import { validateDocument } from './validation';

/**
 * Debounced autosave over the same `onSave` server action the manual Save
 * control calls. Reference equality against the last-saved block array is
 * sufficient because every document mutation returns a new array/object.
 *
 * Invalid documents are never sent to the repository. They remain dirty and
 * visible to the navigation guard until the author repairs or discards them.
 */
export type AutosaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'invalid' | 'error';

export interface AutosaveActionResult {
  error?: string;
  fieldErrors?: Record<string, string>;
}

const AUTOSAVE_DELAY_MS = 1500;

export function useAutosave({
  blocks,
  onSave,
  delayMs = AUTOSAVE_DELAY_MS,
  liveBlocksRef,
}: {
  blocks: Block[];
  onSave: (blocks: Block[]) => Promise<AutosaveActionResult>;
  delayMs?: number;
  /** A synchronous source for unload/navigation guards between React renders. */
  liveBlocksRef?: MutableRefObject<Block[]>;
}) {
  const [status, setStatus] = useState<AutosaveStatus>('idle');
  const [error, setError] = useState<string | undefined>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string> | undefined>();
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const lastSavedBlocksRef = useRef(blocks);
  const localBlocksRef = useRef(blocks);
  const blocksRef = liveBlocksRef ?? localBlocksRef;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const inFlightSaveRef = useRef<Promise<boolean> | null>(null);

  blocksRef.current = blocks;

  /** Persists one immutable snapshot. `saveNow` serializes access to it. */
  const persistSnapshot = useCallback(
    async (target: Block[]): Promise<boolean> => {
      if (!validateDocument(target).valid) {
        setStatus('invalid');
        return false;
      }

      setStatus('saving');
      setError(undefined);
      setFieldErrors(undefined);

      const request = (async () => {
        try {
          const result = await onSave(target);
          if (result.error) {
            setStatus('error');
            setError(result.error);
            setFieldErrors(result.fieldErrors);
            return false;
          }

          lastSavedBlocksRef.current = target;
          // Edits can land while this request is running. Never label that
          // newer state Saved merely because the older snapshot succeeded.
          setStatus(blocksRef.current === target ? 'saved' : 'dirty');
          setLastSavedAt(new Date());
          return true;
        } catch (saveError) {
          setStatus('error');
          setError(saveError instanceof Error ? saveError.message : 'Could not save the document.');
          return false;
        }
      })();

      inFlightSaveRef.current = request;
      try {
        return await request;
      } finally {
        if (inFlightSaveRef.current === request) {
          inFlightSaveRef.current = null;
        }
      }
    },
    [blocksRef, onSave],
  );

  /**
   * Resolves `true` only when the latest document state is persisted.
   *
   * Concurrent callers join the in-flight request. Once it lands, the loop
   * immediately persists any blocks changed during that request. Role
   * switches, route navigation, and manual saves therefore all wait for the
   * newest snapshot instead of dropping or rejecting a pending autosave.
   */
  const saveNow = useCallback(async (): Promise<boolean> => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }

    while (true) {
      const inFlight = inFlightSaveRef.current;
      if (inFlight) {
        if (!(await inFlight)) {
          return false;
        }
        continue;
      }

      const target = blocksRef.current;
      if (target === lastSavedBlocksRef.current) {
        return true;
      }
      if (!(await persistSnapshot(target))) {
        return false;
      }
    }
  }, [blocksRef, persistSnapshot]);

  useEffect(() => {
    if (blocks === lastSavedBlocksRef.current) {
      return;
    }

    setStatus((previous) => (previous === 'saving' ? previous : 'dirty'));
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      void saveNow();
    }, delayMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = undefined;
      }
    };
  }, [blocks, delayMs, saveNow]);

  const isDirtyNow = useCallback(
    () => blocksRef.current !== lastSavedBlocksRef.current,
    [blocksRef],
  );

  return {
    status,
    error,
    fieldErrors,
    lastSavedAt,
    isDirty: blocks !== lastSavedBlocksRef.current,
    isDirtyNow,
    /**
     * The last blocks known to be persisted — what Discard restores. The
     * initial prop cannot serve this role after one or more autosaves.
     */
    lastSavedBlocks: lastSavedBlocksRef.current,
    saveNow,
  };
}
