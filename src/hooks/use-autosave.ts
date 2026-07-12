"use client";

import { useEffect, useRef, useState } from "react";

export type AutosaveStatus = "idle" | "saving" | "saved" | "error";

/**
 * Debounced-by-interval autosave (`ARCHITECTURE/19_CMS_FOUNDATION.md` §6) —
 * calls `save(value)` every `intervalMs` with whatever the caller's latest
 * value is, and exposes a `"saved" | "saving" | "error"` indicator per
 * `12_ADMIN_PANEL_SPECIFICATION.md` §4's "visible 'saved' indicator"
 * requirement. Autosave only ever persists field values — it never
 * publishes and never submits for review, because `save` is always bound to
 * `autosaveDraft`, not `update`/`publish`.
 */
export function useAutosave<T>(
  value: T,
  save: (value: T) => Promise<{ status: "saved" | "error" }>,
  options: { intervalMs?: number; enabled?: boolean } = {},
): AutosaveStatus {
  const { intervalMs = 30_000, enabled = true } = options;
  const [status, setStatus] = useState<AutosaveStatus>("idle");
  const latestValue = useRef(value);

  useEffect(() => {
    latestValue.current = value;
  }, [value]);

  useEffect(() => {
    if (!enabled) return;

    const timer = setInterval(() => {
      setStatus("saving");
      save(latestValue.current)
        .then((result) => setStatus(result.status))
        .catch(() => setStatus("error"));
    }, intervalMs);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, intervalMs]);

  return status;
}
