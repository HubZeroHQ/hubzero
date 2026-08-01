'use client';

import { createContext, useContext } from 'react';
import type { EditorRegistry } from './editor-registry';

/**
 * Holds the registry *instance*, never any of its changing state — the value
 * put on this context is referentially stable for the lifetime of the
 * Studio shell, so a consumer reading it never re-renders because some
 * unrelated editor became dirty. Anything that needs to *render* dirty state
 * subscribes to the registry itself (`useEditorGuardState`).
 */
export const EditorGuardContext = createContext<EditorRegistry | null>(null);

/**
 * Returns the registry, or `null` outside the Studio shell. Nullable on
 * purpose: `EditorForm` and the guarded router are usable in isolation (a
 * test harness, a future standalone editor route) and degrade to
 * unguarded-but-working rather than throwing.
 */
export function useEditorRegistry(): EditorRegistry | null {
  return useContext(EditorGuardContext);
}
