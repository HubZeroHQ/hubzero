"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Per-browser, per-user-device UI state (the command palette's recent
 * searches/recently viewed, Phase F) — deliberately `localStorage`, not a DB
 * model. This is "what did I just look at on this machine," not shared,
 * authoritative data another user or device needs to see, so it doesn't
 * warrant a collection, a Server Action, or a permission check.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // The state update is deferred into a microtask (mirroring `.then()`'s
    // "callback from an external system" shape `use-autosave.ts` already
    // uses for its timer) rather than called synchronously in the effect
    // body — reading `localStorage` itself must still happen client-side
    // post-mount, since it isn't available during server rendering.
    Promise.resolve().then(() => {
      try {
        const stored = window.localStorage.getItem(key);
        if (stored !== null) setValue(JSON.parse(stored) as T);
      } catch {
        // Corrupt/unavailable storage falls back to `initialValue` silently —
        // this is a convenience cache, never a source of truth worth erroring over.
      }
      setHydrated(true);
    });
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = next instanceof Function ? next(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          // Storage may be full/disabled (private browsing) — the in-memory
          // state still updates for the rest of this session.
        }
        return resolved;
      });
    },
    [key],
  );

  return [value, update, hydrated] as const;
}
