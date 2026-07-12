"use client";

import { useLayoutEffect, useState } from "react";

import { FirstRun } from "@/components/marketing/homepage/first-run";
import { Link } from "@/components/ui/link";
import { primaryCta } from "@/config/nav";

/**
 * Homepage opening (`CREATIVE_DIRECTION.md` §13.1): First Run plays first
 * (or resolves instantly — see that component), then this reveals the
 * direct, non-clever statement `ARCHITECTURE/00_FOUNDER_APPROVAL.md` §5
 * specifies, plus one clear sentence establishing who HubZero is for.
 * `revealed` defaults to `true` so server-rendered markup (and any visitor
 * without JS) shows the headline immediately — the layout effect below
 * only ever hides it for the brief window a first-time-this-session visitor
 * actually watches the mark perform.
 */
export function Hero() {
  const [revealed, setRevealed] = useState(true);

  useLayoutEffect(() => {
    const alreadyPlayed = sessionStorage.getItem("hz-first-run-played") === "1";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // sessionStorage/matchMedia only exist client-side — this one-time check
    // can't move into the lazy useState initializer without breaking SSR.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!alreadyPlayed && !reduced) setRevealed(false);
  }, []);

  return (
    <section className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <FirstRun onComplete={() => setRevealed(true)} />
      <div
        className="max-w-3xl transition-opacity duration-500 ease-out"
        style={{ opacity: revealed ? 1 : 0 }}
      >
        <h1 className="text-display text-text font-semibold text-balance">
          Building technology that solves real problems.
        </h1>
        <p className="text-body text-text-muted mx-auto mt-6 max-w-xl text-balance">
          HubZero is a small, founder-led engineering studio building software and hardware for
          businesses that need both — one team, taken from an unfamiliar problem to a shipped,
          maintained system.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href={primaryCta.href}
            className="bg-accent text-accent-foreground text-body rounded-full px-6 py-3 font-medium no-underline hover:no-underline hover:opacity-90"
          >
            {primaryCta.label}
          </Link>
          <Link
            href="/work"
            tone="muted"
            className="text-body font-medium no-underline hover:no-underline"
          >
            See the work
          </Link>
        </div>
      </div>
    </section>
  );
}
