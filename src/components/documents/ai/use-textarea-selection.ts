'use client';

import { useState, type RefObject } from 'react';

export interface TextSelectionRange {
  start: number;
  end: number;
  text: string;
}

/**
 * Tracks the current non-empty text selection inside a plain `<textarea>` —
 * native form controls don't participate in `window.getSelection()`, so this
 * reads `selectionStart`/`selectionEnd` directly on the relevant DOM events
 * instead. Backing the selection-level AI toolbar (`SelectionToolbar.tsx`)
 * for the paragraph and markdown fields.
 */
export function useTextareaSelection(ref: RefObject<HTMLTextAreaElement | null>) {
  const [selection, setSelection] = useState<TextSelectionRange | null>(null);

  function updateSelection() {
    const node = ref.current;
    if (!node) {
      setSelection(null);
      return;
    }
    const { selectionStart, selectionEnd, value } = node;
    if (selectionStart === selectionEnd) {
      setSelection(null);
      return;
    }
    setSelection({
      start: selectionStart,
      end: selectionEnd,
      text: value.slice(selectionStart, selectionEnd),
    });
  }

  function clearSelection() {
    setSelection(null);
  }

  return { selection, updateSelection, clearSelection };
}
