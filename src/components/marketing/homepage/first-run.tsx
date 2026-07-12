"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

import {
  MARK_CHEVRON_PATH,
  MARK_LEFT_PATH,
  MARK_TRIANGLE_PATH,
  MARK_VIEWBOX,
} from "@/components/brand/mark-geometry";
import { ease } from "@/lib/motion";

const SESSION_KEY = "hz-first-run-played";
const MARK_SIZE = 96;

type Phase = "hold" | "present" | "apart" | "tension" | "lock" | "fire" | "travel" | "done";

/**
 * First Run (`CREATIVE_DIRECTION.md` §13.1) — the homepage's opening two
 * seconds, storyboarded frame by frame there. A fixed, full-viewport
 * overlay: the mark appears, comes apart at its own real seams, holds
 * under tension, locks, fires once (the only moment Signal is allowed to
 * announce something happening), then genuinely travels — real measured
 * screen distance, not a fade — into the floating nav's actual on-screen
 * position (`#hz-nav-mark-anchor`, rendered by `navbar.tsx`), at which
 * point this overlay clears and `onComplete` reveals the real headline
 * underneath.
 *
 * Session-scoped (§5.3): plays once per browser session, resolves near-
 * instantly on every later load in the same session. Reduced-motion
 * visitors get the fully-resolved state immediately, per §5.2 — no shorter
 * version of the same animation, no motion at all.
 */
export function FirstRun({ onComplete }: { onComplete: () => void }) {
  const shouldReduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("hold");
  const [skip, setSkip] = useState<boolean | null>(null);
  const [travel, setTravel] = useState<{ x: number; y: number; scale: number } | null>(null);
  const markRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const alreadyPlayed = sessionStorage.getItem(SESSION_KEY) === "1";
    // sessionStorage/matchMedia only exist client-side, so this one-time
    // "should the sequence play at all" decision can't be made in a lazy
    // useState initializer without breaking SSR — an effect is the correct
    // place for it, not derived render logic.
    if (alreadyPlayed || shouldReduceMotion) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSkip(true);
      onComplete();
      return;
    }

    setSkip(false);
    sessionStorage.setItem(SESSION_KEY, "1");

    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));

    at(300, () => setPhase("present"));
    at(500, () => setPhase("apart"));
    at(780, () => setPhase("tension"));
    at(960, () => setPhase("lock"));
    at(1120, () => setPhase("fire"));
    at(1280, () => {
      const anchor = document.getElementById("hz-nav-mark-anchor");
      const mark = markRef.current;
      if (anchor && mark) {
        const target = anchor.getBoundingClientRect();
        const current = mark.getBoundingClientRect();
        const targetSize = target.width * 0.5; // the anchor button's mark is ~50% of the button
        setTravel({
          x: target.left + target.width / 2 - (current.left + current.width / 2),
          y: target.top + target.height / 2 - (current.top + current.height / 2),
          scale: targetSize / current.width,
        });
      }
      setPhase("travel");
    });
    at(1650, () => {
      setPhase("done");
      onComplete();
    });

    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once on mount only
  }, []);

  if (skip === null || skip === true || phase === "done") return null;

  const apart = phase === "apart" || phase === "tension";
  const pieceTransition = {
    duration: phase === "lock" || phase === "fire" ? 0.16 : 0.28,
    ease: ease.out,
  };

  return (
    <div
      className="bg-bg pointer-events-none fixed inset-0 z-[1300] flex items-center justify-center"
      style={{
        opacity: phase === "travel" ? 0 : 1,
        transition: phase === "travel" ? "opacity 350ms ease-out" : undefined,
      }}
      aria-hidden="true"
    >
      <motion.div
        ref={markRef}
        animate={{
          opacity: phase === "hold" ? 0 : 1,
          scale: phase === "hold" ? 0.96 : phase === "travel" && travel ? travel.scale : 1,
          x: phase === "travel" && travel ? travel.x : 0,
          y: phase === "travel" && travel ? travel.y : 0,
        }}
        transition={{
          opacity: { duration: 0.15, ease: ease.out },
          scale:
            phase === "travel"
              ? { duration: 0.35, ease: ease.inOut }
              : { duration: 0.15, ease: ease.out },
          x: { duration: 0.35, ease: ease.inOut },
          y: { duration: 0.35, ease: ease.inOut },
        }}
        style={{ width: MARK_SIZE, height: MARK_SIZE }}
      >
        <svg viewBox={MARK_VIEWBOX} width={MARK_SIZE} height={MARK_SIZE}>
          <motion.path
            d={MARK_LEFT_PATH}
            fillRule="evenodd"
            fill="var(--color-text)"
            animate={{ x: apart ? -9 : 0, rotate: apart ? -3 : 0 }}
            transition={pieceTransition}
            style={{ transformOrigin: "50px 50px" }}
          />
          <motion.g
            animate={{ x: apart ? 9 : 0, rotate: apart ? 3 : 0 }}
            transition={pieceTransition}
            style={{ transformOrigin: "50px 50px" }}
          >
            <motion.path
              d={MARK_TRIANGLE_PATH}
              animate={{ fill: phase === "fire" ? "var(--color-accent)" : "var(--color-text)" }}
              transition={{ duration: 0.12 }}
            />
            <path d={MARK_CHEVRON_PATH} fill="var(--color-text)" />
          </motion.g>
        </svg>
      </motion.div>
    </div>
  );
}
