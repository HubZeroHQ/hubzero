'use client';

import { useSyncExternalStore } from 'react';
import { useEditorRegistry } from './context';
import type { EditorGuardSnapshot } from './types';

const EMPTY_SNAPSHOT: EditorGuardSnapshot = {
  editors: [],
  pendingIntent: null,
  resolving: false,
  resolveError: null,
};

function emptySnapshot(): EditorGuardSnapshot {
  return EMPTY_SNAPSHOT;
}

function noopSubscribe(): () => void {
  return () => {};
}

/**
 * Subscribes a component to the guard's state. Deliberately used by exactly
 * two components (the sticky save bar and the leave dialog) so that
 * per-keystroke dirty updates never reach the rest of the shell — see the
 * rationale on `EditorRegistry`.
 *
 * The server snapshot is the empty one: the guard is a browser-only concern,
 * and returning a stable constant keeps `useSyncExternalStore` from
 * complaining about a changing server value during hydration.
 */
export function useEditorGuardState(): EditorGuardSnapshot {
  const registry = useEditorRegistry();
  return useSyncExternalStore(
    registry ? registry.subscribe : noopSubscribe,
    registry ? registry.getSnapshot : emptySnapshot,
    emptySnapshot,
  );
}
