import { useCallback, useEffect, useRef, useState } from 'react';
import type { Block } from './blocks';
import { validateDocument } from './validation';

/**
 * Debounced autosave over the same `onSave` server action the manual Save
 * control already calls (`document-actions.ts`'s `createDocumentSaveAction`
 * — no separate autosave endpoint). Reference (not deep) equality against
 * the last-saved blocks array is enough to detect dirtiness, since every
 * mutation in `block-ops.ts` returns a new array/object rather than
 * mutating in place.
 *
 * An invalid document (a required field emptied mid-edit) is deliberately
 * never autosaved — `documentRepository`'s Zod parse would reject it
 * anyway, and silently discarding the author's in-progress edit on a failed
 * autosave would be worse than just waiting, so the status surfaces
 * "invalid" and retries on the next change once the document parses again.
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
}: {
  blocks: Block[];
  onSave: (blocks: Block[]) => Promise<AutosaveActionResult>;
  delayMs?: number;
}) {
  const [status, setStatus] = useState<AutosaveStatus>('idle');
  const [error, setError] = useState<string | undefined>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string> | undefined>();
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const lastSavedBlocksRef = useRef(blocks);
  const blocksRef = useRef(blocks);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const savingRef = useRef(false);

  blocksRef.current = blocks;

  const performSave = useCallback(async () => {
    if (savingRef.current) {
      return;
    }
    const target = blocksRef.current;
    if (target === lastSavedBlocksRef.current) {
      return;
    }

    if (!validateDocument(target).valid) {
      setStatus('invalid');
      return;
    }

    savingRef.current = true;
    setStatus('saving');
    setError(undefined);
    setFieldErrors(undefined);
    try {
      const result = await onSave(target);
      if (result.error) {
        setStatus('error');
        setError(result.error);
        setFieldErrors(result.fieldErrors);
        return;
      }
      lastSavedBlocksRef.current = target;
      setStatus('saved');
      setLastSavedAt(new Date());
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Could not save the document.');
    } finally {
      savingRef.current = false;
    }
  }, [onSave]);

  useEffect(() => {
    if (blocks === lastSavedBlocksRef.current) {
      return;
    }
    setStatus((prev) => (prev === 'saving' ? prev : 'dirty'));
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      void performSave();
    }, delayMs);
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [blocks, delayMs, performSave]);

  /** Bypasses the debounce — used by the header's Save button and `Ctrl/Cmd+S`. */
  const saveNow = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    await performSave();
  }, [performSave]);

  return {
    status,
    error,
    fieldErrors,
    lastSavedAt,
    isDirty: blocks !== lastSavedBlocksRef.current,
    saveNow,
  };
}
