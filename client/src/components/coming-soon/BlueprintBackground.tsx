'use client';

import { motion, useReducedMotion } from 'framer-motion';

// Orthogonal "circuit trace" paths, hand-placed toward the edges of a
// 1440x900 viewBox so the centered hero copy stays clear of the linework.
const TRACES: { d: string; nodes: [number, number][]; delay: number }[] = [
  {
    d: 'M -20 180 L 220 180 L 220 60 L 480 60 L 480 140 L 620 140',
    nodes: [[220, 180], [220, 60], [480, 60], [480, 140], [620, 140]],
    delay: 0,
  },
  {
    d: 'M 1460 220 L 1180 220 L 1180 40 L 940 40 L 940 120',
    nodes: [[1180, 220], [1180, 40], [940, 40], [940, 120]],
    delay: 0.4,
  },
  {
    d: 'M -20 720 L 160 720 L 160 860 L 420 860',
    nodes: [[160, 720], [160, 860]],
    delay: 0.8,
  },
  {
    d: 'M 1460 700 L 1240 700 L 1240 820 L 1000 820 L 1000 760 L 880 760',
    nodes: [[1240, 700], [1240, 820], [1000, 820], [1000, 760], [880, 760]],
    delay: 1.1,
  },
  {
    d: 'M 40 460 L 40 340 L 200 340',
    nodes: [[40, 340], [200, 340]],
    delay: 1.5,
  },
];

export default function BlueprintBackground() {
  const reduceMotion = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {/* Graph-paper grid, static and inexpensive */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Vignette so traces fade before reaching the copy */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,var(--bg)_78%)]" />

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        {TRACES.map((trace, i) => (
          <g key={i}>
            <motion.path
              d={trace.d}
              stroke="var(--glow-grad-1)"
              strokeWidth={1.5}
              strokeLinecap="square"
              strokeLinejoin="miter"
              opacity={0.35}
              initial={reduceMotion ? { pathLength: 1 } : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { duration: 2.6, delay: trace.delay, ease: 'easeInOut' }
              }
            />
            {trace.nodes.map(([cx, cy], j) => (
              <motion.circle
                key={j}
                cx={cx}
                cy={cy}
                r={3}
                fill="var(--accent)"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.9, 0.5] }}
                transition={
                  reduceMotion
                    ? { duration: 0, delay: 0 }
                    : {
                        duration: 1.8,
                        delay: trace.delay + 1.4 + j * 0.15,
                        ease: 'easeOut',
                      }
                }
                style={{ filter: 'drop-shadow(0 0 4px var(--accent))' }}
              />
            ))}
          </g>
        ))}
      </svg>
    </div>
  );
}
