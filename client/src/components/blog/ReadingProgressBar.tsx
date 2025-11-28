"use client";

import clsx from "clsx";

interface ReadingProgressBarProps {
  progress: number; // 0 - 100
}

export default function ReadingProgressBar({ progress }: ReadingProgressBarProps) {
  return (
    <div className="fixed left-0 right-0 top-0 z-50 h-1 bg-slate-900/90">
      <div
        className={clsx(
          "h-full origin-left transform bg-gradient-to-r from-sky-500 via-cyan-400 to-violet-500 transition-transform duration-150"
        )}
        style={{ transform: `scaleX(${Math.max(0, Math.min(progress, 100)) / 100})` }}
      />
    </div>
  );
}
