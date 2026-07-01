"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

import { useInView } from "@/lib/use-in-view";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(callback: () => void) {
  const mql = window.matchMedia(reducedMotionQuery);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(reducedMotionQuery).matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

/** Shared by `CircuitMotif` and `CircuitSignatureMark` — the reveal-flip and
 * reduced-motion detection are identical, only the linework differs. */
function useCircuitReveal() {
  const [revealed, setRevealed] = useState(false);
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  // Flips once, synchronously, right after the initial (undrawn) paint
  // commits — the standard React pattern for triggering a CSS transition off
  // its resting state. Deliberately not deferred through requestAnimationFrame:
  // rAF callbacks are throttled/withheld entirely in backgrounded or
  // non-visible tabs, which made the reveal never fire during testing here.
  // A direct setState in this effect is the only reliable trigger.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mount flag for a CSS entrance transition, not state synchronization
    setRevealed(true);
  }, []);

  return { revealed, reducedMotion, drawn: revealed || reducedMotion };
}

/**
 * The homepage's one recurring visual motif (ARCHITECTURE/15_HOMEPAGE_DESIGN.md
 * §1) — schematic linework drawn from HubZero's software+hardware subject
 * matter, not decoration for its own sake. Its primary, prominent appearance
 * is the hero; it appears exactly one more time, later, inside "How We Work"
 * as a connective line between steps — not as a repeating section divider.
 *
 * Round 3 redesign: pure right-angle PCB tracery reads as generic
 * "tech pattern," indistinguishable from any dev-tools/fintech site's stock
 * circuit-board decoration. The traces now mix in 45° diagonal segments and
 * resolve into one solid filled triangle — deliberately quoting the actual
 * HubZero mark's angular hexagon-and-triangle geometry (`public/brand/icon.png`)
 * rather than inventing an unrelated linework style. That solid triangle is
 * the one intentional "signature" moment: crop just that corner and it
 * should still read as HubZero, not as generic circuitry.
 *
 * Draw-in uses plain CSS transitions on stroke-dashoffset/opacity (like the
 * mobile nav drawer in globals.css), not the `motion` library's SVG
 * `pathLength`/circle-opacity animation — that path reliably stayed stuck at
 * its initial value in this Next 16 (Turbopack) + React 19 + motion/react
 * combination, while plain CSS transitions on inline styles do not.
 */
export function CircuitMotif({ className }: { className?: string }) {
  const { revealed, reducedMotion } = useCircuitReveal();

  const traces = [
    "M 40 0 L 40 100 L 120 180",
    "M 120 180 L 120 270",
    "M 120 270 L 40 350 L 40 460",
    "M 0 210 L 90 210 L 170 290",
    "M 170 290 L 170 400 L 250 480",
    "M 250 480 L 320 480",
    "M 60 40 L 140 40 L 140 20",
  ];

  const nodes = [
    { cx: 40, cy: 100, r: 3 },
    { cx: 120, cy: 180, r: 4 },
    { cx: 40, cy: 350, r: 3 },
    { cx: 90, cy: 210, r: 3 },
    { cx: 170, cy: 290, r: 4 },
    { cx: 170, cy: 400, r: 3 },
    { cx: 140, cy: 40, r: 3 },
  ];

  // The one solid, filled shape on the page outside the brand-gradient text —
  // a small right-pointing triangle quoting the inner facet of the actual
  // HubZero mark. Everything else here is stroke-only linework; this is
  // deliberately not, so it reads as a stamp/signature rather than another
  // trace segment.
  const signatureTriangle = "M 320 469 L 340 480 L 320 491 Z";

  // Generously longer than any trace segment here so the dash covers the
  // whole path regardless of its individual length.
  const dashLength = 800;
  const drawDuration = reducedMotion ? 0 : 1.6;
  const nodeDelay = reducedMotion ? 0 : 1.5;
  const triangleDelay = reducedMotion ? 0 : 2.2;

  return (
    <svg
      viewBox="0 0 360 520"
      fill="none"
      aria-hidden="true"
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <g className="text-accent" stroke="currentColor" strokeWidth="1.5" opacity="0.65">
        {traces.map((d, i) => (
          <path
            key={d}
            d={d}
            style={{
              strokeDasharray: dashLength,
              strokeDashoffset: revealed || reducedMotion ? 0 : dashLength,
              transition: `stroke-dashoffset ${drawDuration}s cubic-bezier(0.16,1,0.3,1) ${reducedMotion ? 0 : 0.15 + i * 0.12}s`,
            }}
          />
        ))}
      </g>
      <g className="text-accent" fill="currentColor">
        {nodes.map((n, i) => (
          <circle
            key={`${n.cx}-${n.cy}`}
            cx={n.cx}
            cy={n.cy}
            r={n.r}
            style={{
              opacity: revealed || reducedMotion ? 0.7 : 0,
              transition: `opacity 0.3s cubic-bezier(0.16,1,0.3,1) ${reducedMotion ? 0 : nodeDelay + i * 0.06}s`,
            }}
          />
        ))}
      </g>
      {/* The signature: last to appear, solid (not stroked), full opacity —
          a deliberate stamp rather than another trace. */}
      <path
        d={signatureTriangle}
        className="text-accent"
        fill="currentColor"
        style={{
          opacity: revealed || reducedMotion ? 1 : 0,
          transform: revealed || reducedMotion ? "scale(1)" : "scale(0.5)",
          transformOrigin: "330px 480px",
          transition: `opacity 0.4s cubic-bezier(0.16,1,0.3,1) ${triangleDelay}s, transform 0.4s cubic-bezier(0.16,1,0.3,1) ${triangleDelay}s`,
        }}
      />
    </svg>
  );
}

/**
 * The compact form of the signature for mobile/tablet: the solid triangle
 * plus its one short connecting trace, at a size meant to sit like a small
 * printed mark near the headline — not the full linework shrunk down. This
 * is what "recompose, don't just shrink" means for the motif specifically:
 * on a phone the full seven-trace pattern reads as noise, but the one
 * intentional shape still reads as a mark.
 */
export function CircuitSignatureMark({ className }: { className?: string }) {
  const { revealed, reducedMotion } = useCircuitReveal();
  const dashLength = 120;
  const drawDuration = reducedMotion ? 0 : 0.7;
  const triangleDelay = reducedMotion ? 0 : 0.6;

  return (
    <svg viewBox="0 0 100 40" fill="none" aria-hidden="true" className={className}>
      <path
        d="M 0 20 L 60 20"
        className="text-accent"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.65"
        style={{
          strokeDasharray: dashLength,
          strokeDashoffset: revealed || reducedMotion ? 0 : dashLength,
          transition: `stroke-dashoffset ${drawDuration}s cubic-bezier(0.16,1,0.3,1)`,
        }}
      />
      <path
        d="M 68 9 L 88 20 L 68 31 Z"
        className="text-accent"
        fill="currentColor"
        style={{
          opacity: revealed || reducedMotion ? 1 : 0,
          transform: revealed || reducedMotion ? "scale(1)" : "scale(0.5)",
          transformOrigin: "78px 20px",
          transition: `opacity 0.4s cubic-bezier(0.16,1,0.3,1) ${triangleDelay}s, transform 0.4s cubic-bezier(0.16,1,0.3,1) ${triangleDelay}s`,
        }}
      />
    </svg>
  );
}

/**
 * The motif's second and final appearance on the homepage
 * (ARCHITECTURE/15_HOMEPAGE_DESIGN.md §1/§9): a vertical trace running
 * behind "How We Work"'s three numbered steps, functioning as the thing
 * that actually connects them rather than a divider or repeated hero
 * illustration. Same stroke language and the same signature triangle
 * stamp as `CircuitMotif` (so it reads as one motif, not two), but its own
 * geometry — a tall connector, not the hero's diagonal composition —
 * because "second appearance of the motif" means the same visual identity,
 * not a literal copy-paste of an illustration built for different
 * negative space.
 *
 * Reveals on scroll into view rather than on mount: this beat is below
 * the fold, so a mount-time reveal (the hero's `useCircuitReveal`) would
 * finish drawing itself before anyone scrolls down to see it.
 */
export function CircuitConnector({ className }: { className?: string }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
  const drawn = inView || reducedMotion;

  const trace = "M 20 0 L 20 130 L 8 150 L 8 300 L 32 320 L 32 460 L 20 480 L 20 560";
  const nodes = [
    { cx: 20, cy: 12, r: 4 },
    { cx: 8, cy: 300, r: 4 },
    { cx: 20, cy: 560, r: 4 },
  ];
  const signatureTriangle = "M 20 578 L 34 588 L 20 598 Z";

  const dashLength = 900;
  const drawDuration = reducedMotion ? 0 : 1.4;
  const nodeDelay = reducedMotion ? 0 : 1.1;
  const triangleDelay = reducedMotion ? 0 : 1.6;

  return (
    <div ref={ref} className={className}>
      <svg
        viewBox="0 0 40 600"
        fill="none"
        aria-hidden="true"
        className="h-full w-full"
        preserveAspectRatio="none"
      >
        <path
          d={trace}
          className="text-accent"
          stroke="currentColor"
          strokeWidth="1.5"
          opacity="0.55"
          vectorEffect="non-scaling-stroke"
          style={{
            strokeDasharray: dashLength,
            strokeDashoffset: drawn ? 0 : dashLength,
            transition: `stroke-dashoffset ${drawDuration}s cubic-bezier(0.16,1,0.3,1)`,
          }}
        />
        <g className="text-accent" fill="currentColor">
          {nodes.map((n, i) => (
            <circle
              key={`${n.cx}-${n.cy}`}
              cx={n.cx}
              cy={n.cy}
              r={n.r}
              style={{
                opacity: drawn ? 0.7 : 0,
                transition: `opacity 0.3s cubic-bezier(0.16,1,0.3,1) ${nodeDelay + i * 0.15}s`,
              }}
            />
          ))}
        </g>
        <path
          d={signatureTriangle}
          className="text-accent"
          fill="currentColor"
          style={{
            opacity: drawn ? 1 : 0,
            transform: drawn ? "scale(1)" : "scale(0.5)",
            transformOrigin: "27px 588px",
            transition: `opacity 0.4s cubic-bezier(0.16,1,0.3,1) ${triangleDelay}s, transform 0.4s cubic-bezier(0.16,1,0.3,1) ${triangleDelay}s`,
          }}
        />
      </svg>
    </div>
  );
}
