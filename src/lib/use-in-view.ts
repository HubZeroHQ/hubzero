"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fires once when the element first crosses into the viewport, then
 * disconnects — every below-fold reveal on the homepage (ARCHITECTURE/
 * 15_HOMEPAGE_DESIGN.md §8: "plain CSS, one-shot reveals only") is a
 * transition driven off this boolean, not a mount-time flag. Mount-time
 * reveal (see circuit-motif.tsx's `useCircuitReveal`) is correct for the
 * hero because it's visible at load; anything below the fold needs the
 * scroll-triggered version instead, or the transition finishes off-screen
 * before the visitor ever sees it.
 */
export function useInView<T extends HTMLElement>(rootMargin = "0px 0px -10% 0px") {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || inView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0.15 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [inView, rootMargin]);

  return { ref, inView };
}
