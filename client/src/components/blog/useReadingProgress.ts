"use client";

import { useEffect, useState } from "react";

/**
 * Calculates scroll progress for the element with the given ID.
 */
export function useReadingProgress(targetId: string): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;

    const handleScroll = () => {
      const elementTop = target.offsetTop;
      const elementHeight = target.offsetHeight;
      const viewportHeight =
        window.innerHeight || document.documentElement.clientHeight;

      const scrollY = window.scrollY;

      // How much we *can* scroll through this element
      const totalScrollable = Math.max(elementHeight - viewportHeight, 0);

      if (totalScrollable === 0) {
        // Element fits in viewport or is tiny, treat as fully "read"
        setProgress(100);
        return;
      }

      // How far we've scrolled relative to element start
      const current = scrollY - elementTop;

      const raw = (current / totalScrollable) * 100;

      // Clamp and lightly snap to 100 near the bottom
      const clamped = Math.min(100, Math.max(0, raw));
      const snapped = clamped > 99 ? 100 : clamped;

      setProgress(snapped);
    };

    handleScroll(); // run once on mount
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [targetId]);

  return progress;
}
