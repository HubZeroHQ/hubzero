import type { CSSProperties } from 'react';

/**
 * Builds an SVG path `d` string while tracking its true drawn length, so
 * every stroke can use its OWN stroke-dasharray/dashoffset — a reveal
 * proportional to that stroke's actual length, not one shared oversized
 * constant. Geometry only: no animation, no React.
 */
export class PathBuilder {
  d = '';
  length = 0;
  private x = 0;
  private y = 0;

  moveTo(x: number, y: number): this {
    this.d += `M ${x} ${y} `;
    this.x = x;
    this.y = y;
    return this;
  }

  h(x: number): this {
    this.length += Math.abs(x - this.x);
    this.d += `H ${x} `;
    this.x = x;
    return this;
  }

  v(y: number): this {
    this.length += Math.abs(y - this.y);
    this.d += `V ${y} `;
    this.y = y;
    return this;
  }

  lineTo(x: number, y: number): this {
    this.length += Math.hypot(x - this.x, y - this.y);
    this.d += `L ${x} ${y} `;
    this.x = x;
    this.y = y;
    return this;
  }

  curveTo(c1x: number, c1y: number, c2x: number, c2y: number, x: number, y: number): this {
    this.length +=
      Math.hypot(c1x - this.x, c1y - this.y) +
      Math.hypot(c2x - c1x, c2y - c1y) +
      Math.hypot(x - c2x, y - c2y);
    this.d += `C ${c1x} ${c1y}, ${c2x} ${c2y}, ${x} ${y} `;
    this.x = x;
    this.y = y;
    return this;
  }

  /** Horizontal-then-vertical move with a short 45° chamfer at the corner — a real PCB miter, not a sharp staircase turn. */
  hv(toX: number, toY: number, chamfer = 6): this {
    const dx = Math.sign(toX - this.x) || 1;
    const dy = Math.sign(toY - this.y) || 1;
    const c = Math.min(chamfer, Math.abs(toX - this.x) / 2, Math.abs(toY - this.y) / 2);
    if (c <= 0.01) {
      this.h(toX);
      this.v(toY);
      return this;
    }
    const cornerY = this.y;
    this.h(toX - dx * c);
    this.lineTo(toX, cornerY + dy * c);
    this.v(toY);
    return this;
  }
}

/** Deterministic pseudo-random float in [0, 1) — used only for the per-stroke motion stagger, never for geometry. */
function hash(i: number, salt: number): number {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/** Per-stroke stagger: distinct delay and duration so a set of strokes reveals like asynchronous signal propagation, not one synchronized flourish. */
function asyncDraw(seed: number): CSSProperties {
  const delay = Math.round(hash(seed, 91) * 460);
  const duration = Math.round(620 + hash(seed, 97) * 420);
  return {
    transitionDelay: `${delay}ms`,
    transitionDuration: `${duration}ms`,
    animationDelay: `${delay}ms`,
    animationDuration: `${duration}ms`,
  };
}

/**
 * A single SVG path that assembles itself in: stroke-dashoffset animates
 * from the path's own length down to 0. Whether that draw happens once on
 * mount (an `animation`) or on hover/focus (a `transition`) is decided by
 * the consuming stylesheet, not this component — it only supplies the
 * dasharray/offset and the per-stroke delay/duration, so both styling
 * contracts share one implementation. (See `.founder-motif-trace` in
 * globals.css for the mount-animation case and `.about-person-motif
 * .founder-motif-trace` for the hover-transition case.)
 *
 * Reduced motion needs no handling here: the global
 * `@media (prefers-reduced-motion: reduce)` rule in globals.css already
 * forces every animation/transition duration to ~0, which resolves any
 * consumer's stroke straight to its drawn state.
 *
 * The `founder-motif-trace` class name is still hardcoded rather than
 * exposed as a plain `className` prop — the founder motif system is its
 * only consumer today. Generalize the class name when a second consumer
 * (the evidence graph, Trace) actually exists, not before.
 */
export function AssembleStroke({
  builder,
  seed,
  className,
}: {
  builder: PathBuilder;
  seed: number;
  className?: string;
}) {
  const dash = Math.max(builder.length, 1) + 2;
  return (
    <path
      className={`founder-motif-trace ${className ?? ''}`.trim()}
      d={builder.d}
      strokeDasharray={dash}
      strokeDashoffset={dash}
      style={asyncDraw(seed)}
    />
  );
}
