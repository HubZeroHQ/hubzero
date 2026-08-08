'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { useEditorRegistry } from './context';
import type { EditorHandle } from './types';

/**
 * The minimal opt-in: hand the shell a description of your editor and it
 * gains navigation protection, unload protection, and (unless it opts out
 * via `showsSaveBar: false`) the shared sticky save bar — with no other
 * change to how the editor itself works.
 *
 * `save` and `discard` are invoked through a ref rather than published
 * directly, so an editor may pass fresh closures on every render without the
 * guard ever holding a stale one, and without a new function identity
 * counting as a state change worth re-rendering the guard's surface for.
 * That is what lets an existing editor (the Document Engine) join the system
 * by adding a single hook call to its body rather than restructuring its
 * state.
 */
export function useEditorRegistration(handle: EditorHandle): void {
  const registry = useEditorRegistry();

  const latestRef = useRef(handle);
  latestRef.current = handle;

  const idRef = useRef(handle.id);
  idRef.current = handle.id;

  const { id, label, isDirty, status, error, savesAutomatically, showsSaveBar, canDiscard } =
    handle;
  // Whether the editor offers a live probe is a property of the editor, not of
  // any given render, so it belongs in the dependency list rather than the
  // probe's identity (which changes every render by design).
  const hasLiveProbe = Boolean(handle.isDirtyNow);

  // Publishing has to happen before the editor can receive input. A passive
  // effect leaves a paint-to-effect window where the permanent beforeunload
  // listener is installed but has no document handle to probe yet.
  useLayoutEffect(() => {
    registry?.publish({
      id,
      label,
      isDirty,
      status,
      error,
      savesAutomatically,
      showsSaveBar,
      canDiscard,
      save: (options) => latestRef.current.save(options),
      discard: () => latestRef.current.discard(),
      // Routed through the ref like the callbacks above, so the guard always
      // probes the editor as it stands now rather than through a closure
      // captured when this effect last ran.
      isDirtyNow: hasLiveProbe ? () => latestRef.current.isDirtyNow!() : undefined,
    });
  }, [
    registry,
    id,
    label,
    isDirty,
    status,
    error,
    savesAutomatically,
    showsSaveBar,
    canDiscard,
    hasLiveProbe,
  ]);

  useEffect(() => {
    if (!registry) {
      return;
    }
    // Unregistering on unmount is what keeps a departed screen's editor from
    // blocking navigation forever.
    return () => registry.unregister(idRef.current);
  }, [registry]);
}
