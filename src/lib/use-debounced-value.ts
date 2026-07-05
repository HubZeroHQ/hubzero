import { useEffect, useState } from "react";

/** Delays reflecting a fast-changing value (e.g. a search box's `onChange`) until it's stopped changing for `delayMs` — shared by every incremental-search control (the reference picker, the media browse grid). */
export function useDebouncedValue<T>(value: T, delayMs = 200): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeout);
  }, [value, delayMs]);

  return debounced;
}
