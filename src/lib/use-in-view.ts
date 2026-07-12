"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fires once when the element first crosses into the viewport, then
 * disconnects — every below-fold `Reveal` (`components/marketing/reveal.tsx`)
 * is a plain-CSS, one-shot transition driven off this boolean, not a
 * mount-time flag. Content visible at load (the homepage hero) doesn't need
 * this — it's for sections a visitor reaches by scrolling, where a
 * mount-time transition would finish off-screen before they ever see it.
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
