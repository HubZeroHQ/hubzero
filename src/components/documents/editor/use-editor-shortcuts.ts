import { useEffect, useRef, type RefObject } from 'react';

/**
 * Editor-scoped keyboard shortcuts (CMS_PRODUCT_DESIGN.md §2: `Alt+↑`/`Alt+↓`
 * reorders the focused block; `Ctrl/Cmd+S`, `Ctrl/Cmd+Z`, and
 * `Ctrl/Cmd+Shift+Z`/`Ctrl+Y` are the industry-standard save/undo/redo a
 * real editor needs to "naturally support" undo/redo, per the Phase 4
 * brief). Deliberately separate from the global Studio shortcut hook
 * (`lib/studio/use-keyboard-shortcuts.ts`) — that hook ignores keydowns
 * inside form fields entirely, but these need to keep working *while
 * typing* in a block's textarea or the Tiptap rich text surface, so the
 * listener is attached to the editor's own container and never checks
 * `isTypingTarget`.
 *
 * Callbacks are read from a ref rather than the effect's dependency array,
 * so the listener attaches once instead of re-subscribing on every
 * keystroke-driven re-render (the block canvas re-renders constantly while
 * typing).
 */
export function useEditorShortcuts({
  containerRef,
  onUndo,
  onRedo,
  onSave,
  onMoveSelectedUp,
  onMoveSelectedDown,
}: {
  containerRef: RefObject<HTMLElement | null>;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onMoveSelectedUp: () => void;
  onMoveSelectedDown: () => void;
}): void {
  const callbacksRef = useRef({ onUndo, onRedo, onSave, onMoveSelectedUp, onMoveSelectedDown });
  callbacksRef.current = { onUndo, onRedo, onSave, onMoveSelectedUp, onMoveSelectedDown };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      const meta = event.metaKey || event.ctrlKey;
      const key = event.key.toLowerCase();
      const callbacks = callbacksRef.current;

      if (event.altKey && event.key === 'ArrowUp') {
        event.preventDefault();
        callbacks.onMoveSelectedUp();
        return;
      }
      if (event.altKey && event.key === 'ArrowDown') {
        event.preventDefault();
        callbacks.onMoveSelectedDown();
        return;
      }
      if (meta && key === 's') {
        event.preventDefault();
        callbacks.onSave();
        return;
      }
      if (meta && key === 'z' && event.shiftKey) {
        event.preventDefault();
        callbacks.onRedo();
        return;
      }
      if (meta && key === 'z') {
        event.preventDefault();
        callbacks.onUndo();
        return;
      }
      if (meta && key === 'y') {
        event.preventDefault();
        callbacks.onRedo();
      }
    }

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [containerRef]);
}
