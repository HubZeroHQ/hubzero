> **⚠️ ARCHIVED — historical reference only, not implementation guidance.** This document described the public marketing website under the design direction that was reset. It is preserved for historical context. Do not use it to guide the new design (see `DESIGN/NEXT`). See `ARCHIVE/README.md`.

# 08 — Motion System

> Assumes `02`–`07`. This document assigns exact ownership across three motion libraries — GSAP, Motion (motion.dev), and Anime.js — and defines the principles, budget, and hard exclusions that govern all three. It is written against the real motion contract already in production (`src/lib/motion.ts`'s `duration`/`ease`/`distance` tokens) so the three libraries share one vocabulary instead of three competing ones.
>
> **Amended.** §3's diagram-sequencing capability is named as this system's most distinctive signature but never committed to one flagship, worked example — `16_SIGNATURE_MOMENTS.md` §2 names the Labs/R&D data-flow diagram as that reference case and specifies it in full, alongside four other named, worked moments (§1, §3–5 of that document) built entirely from this document's existing ownership boundaries and budget. §6 principle 3's reduced-motion requirement is extended with concrete thresholds (flash-rate limits, scroll-scrub degradation) in `12_ACCESSIBILITY.md` §4.

## 1. Why three libraries, and why this isn't over-engineering

v2 currently uses exactly one motion library in practice (`motion`, the renamed Framer Motion, for the hero's load sequence only) plus plain CSS for everything else — a deliberately minimal footprint that was the right call for what v2 needed. v3's brief specifically calls for three libraries because Working Blueprint's expanded ambition (real scroll-driven diagram storytelling, real SVG trace-drawing across dozens of future diagrams, real UI-transition polish across a growing component set) genuinely exceeds what any single one of the three does best. **The risk this section exists to manage is not "three libraries" in the abstract — it's three libraries fighting each other or drifting onto inconsistent timing.** The fix is the same one v2 already applied to its own single library: one shared token contract (`lib/motion.ts`'s `duration`, `ease`, `distance` constants) that every library's calls are built from, so a GSAP tween, a Motion transition, and an Anime.js reveal all move at the same cadence even though three different engines are driving them.

## 2. Ownership boundaries

| Library                    | Owns                                                                                                                           | Does not touch                                                                                                                                             |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **GSAP** (+ ScrollTrigger) | Scroll storytelling, hero scenes, pinned sections, diagram sequencing, architecture-diagram animation                          | Ordinary UI state transitions (hover, focus, modal open/close) — never used for something Motion already does better                                       |
| **Motion** (motion.dev)    | UI transitions, page transitions, cards/panels entering and exiting, layout animation (shared-element transitions), navigation | Long-form scroll choreography spanning multiple viewport-heights — GSAP's job, not reproduced here even though Motion is technically capable of some of it |
| **Anime.js**               | SVG line-drawing (trace-path reveals, schematic linework drawing in), counters, small icon-level interactions                  | Any orchestration spanning more than one component at a time — that's GSAP's (multi-element sequencing) or Motion's (shared layout) job                    |

**The dividing principle, stated once so it doesn't need re-deriving per component:** GSAP owns _time_ (sequences that unfold across scroll position or a multi-second choreography), Motion owns _state_ (a UI element transitioning between two discrete states — visible/hidden, expanded/collapsed, this page/that page), and Anime.js owns _small, self-contained draws_ (a single SVG path or a single number, animated once, with no dependency on anything else on the page).

## 3. GSAP — scroll storytelling, hero scenes, pinned sections, diagrams

**Scroll storytelling:** a Work case study's "approach" section revealing its architecture diagram element by element as the reader scrolls past it; a Labs entry's timeline extending as the reader scrolls through it. This is GSAP/ScrollTrigger's specific strength (scrubbing an animation's progress directly to scroll position) and the one genuinely new capability v3 needs that v2's plain-CSS one-shot reveals can't provide.

**Hero scenes:** where a homepage or Blueprint hero benefits from a multi-step, precisely sequenced opening (a trace-path drawing in, then a headline resolving, then a credibility strip settling — the same shape v2's hero already has, just capable of more choreographic precision), GSAP's timeline API replaces the current hand-rolled `useEffect`-triggered stagger, which the existing code comments already flag as a workaround for a `motion/react` reveal-timing bug specific to the current Next/Turbopack/React combination — a genuine opportunity to remove a documented workaround, not just add a library.

**Pinned sections:** a rare, high-commitment device (pinning a diagram in place while surrounding text scrolls past it, revealing new annotations as it goes) — reserved for at most one true moment per page family (mirroring the same "memorable moments" budget logic `ARCHITECTURE/15_HOMEPAGE_DESIGN.md` §8a already established), never a default section behavior.

**Architecture-diagram animation:** a system diagram's connections drawing in, in a deliberate build order that mirrors how a reader should understand the system (inputs first, then processing, then outputs) — motion here has a real informational job (teaching sequence/dependency), which is exactly the bar `DESIGN/00_AI_DESIGN_GUIDE.md` §2 already sets for any motion at all.

## 4. Motion (motion.dev) — UI transitions, page transitions, cards, layouts, navigation

**UI transitions:** hover/focus/active state changes, form validation feedback, modal/dialog open-close — Motion's `AnimatePresence` and layout-animation primitives are the right tool for exactly this class of short, state-driven transition, and this is a direct continuation of its one current use (the hero) generalized to the rest of the interactive surface.

**Page transitions:** where a transition between two routes benefits from continuity (a case-study card's cover image appearing to become the detail page's hero image — a real shared-layout transition, not a generic fade), Motion's shared-layout-id mechanism is the correct tool and the only one of the three libraries built for this specific technique.

**Cards/layouts:** panel and list-item enter/exit animations (a filtered grid reflowing when a filter changes on Work/Labs/Blueprints index pages) — brief, state-driven, exactly Motion's strength.

**Navigation:** the mobile-nav drawer's open/close (currently plain CSS keyframes) migrates to Motion for cleaner interruption handling (a user re-tapping the menu button mid-animation), while keeping the exact same duration/easing values already defined in `lib/motion.ts` so the migration changes the implementation, not the felt timing.

## 5. Anime.js — SVG drawing, counters, icons, small interactions

**SVG drawing:** the trace-path and drafting-cyan linework described in `02_VISUAL_LANGUAGE.md` §1, §9–11 — a schematic's lines drawing in, a dimension line extending to its measurement and stopping. This is a direct, more capable replacement for v2's current hand-rolled `strokeDasharray`/`strokeDashoffset` CSS-transition workaround (itself a documented substitute for a `motion/react` SVG `pathLength` bug) — Anime.js's dedicated SVG line-drawing helpers are purpose-built for exactly this and remove another documented workaround.

**Counters:** a real, verifiable metric ticking up to its final value once, on view — mirroring v2's existing "metric counting up" example of motion with genuine informational value (`DESIGN/00_AI_DESIGN_GUIDE.md` §2), executed with Anime.js's numeric tweening rather than a custom `requestAnimationFrame` loop.

**Icons:** the custom, trace-geometry icon vocabulary from `02_VISUAL_LANGUAGE.md` §12 — a small state-change animation (a filter icon's line reconfiguring, a status indicator's node lighting up) at a scale and cost too small to justify GSAP or Motion's larger APIs.

**Small interactions:** a copy-to-clipboard button's brief confirmation, a form field's inline validation icon appearing — genuinely tiny, self-contained, one-shot animations.

## 6. Animation principles

1. **Every animation must survive being asked what a viewer understood because of it that a static frame wouldn't have shown** — carried forward unmodified from `DESIGN/00_AI_DESIGN_GUIDE.md` §2 and `ARCHITECTURE/15_HOMEPAGE_DESIGN.md` §8's shared test. This is the one principle every library's usage in §3–5 above is checked against; a GSAP scroll sequence that doesn't teach a real order of operations, a Motion transition that doesn't clarify a real state change, or an Anime.js draw-in with no real diagram behind it all fail identically.
2. **One shared timing vocabulary across all three libraries.** Every duration and easing curve used by GSAP, Motion, or Anime.js is drawn from the same `duration`/`ease` constants already defined in `lib/motion.ts` (extended with additional named steps as genuinely new needs arise — e.g., a longer `scrollSequence` duration category for GSAP's multi-second choreography, which v2's original three-value scale never needed to express). No library introduces its own bespoke timing values.
3. **`prefers-reduced-motion` is respected identically regardless of which library is driving a given animation** — the existing global CSS rule handles plain-CSS transitions; GSAP, Motion, and Anime.js each require their own explicit reduced-motion branch (GSAP: `gsap.matchMedia()`; Motion: `useReducedMotion()`, already used correctly in the current hero; Anime.js: a manual `matchMedia` check before initializing a draw), and reduced motion means an _instant_ resolved state, not merely a shorter animation — the same standard the current hero already correctly implements.
4. **Motion is additive, never load-bearing for comprehension.** Every animated sequence must degrade gracefully to its fully-resolved static state with zero information loss — a diagram must be fully legible with no animation at all, because motion is a teaching aid layered on top of real content, never a substitute for it.
5. **No library is used merely because it's available.** Before reaching for GSAP, Motion, or Anime.js for a given moment, name which of the three ownership boundaries in §2 the moment actually falls into. A moment that doesn't clearly belong to any of the three probably shouldn't be animated at all.

## 7. Animation budget

Per page: **at most one GSAP-driven scroll-storytelling or pinned-section sequence**, mirroring the existing homepage's "one orchestrated load sequence, then near-silence below the fold" discipline (`ARCHITECTURE/15_HOMEPAGE_DESIGN.md` §8) extended to scroll-driven motion rather than only load-driven motion. Motion-driven UI transitions have no strict numeric cap (they're short, state-driven, and genuinely needed throughout an interactive surface) but must each individually pass principle 1 above. Anime.js draws are capped at the number of real diagrams/counters actually present on the page — never added speculatively to a page that doesn't have real data or a real diagram to animate.

**The test that applies across the whole budget, unchanged from v2:** if a reader were asked afterward "what animated on this page?", the honest answer for a reader who was actually reading should be "I'm not sure" for everything except the one or two moments genuinely designed to be noticed.

## 8. Things we will never animate

- **Text characters or words animating in individually** (letter-by-letter or word-by-word reveal) — a decorative device with no informational job, already implicitly excluded by principle 1 and worth naming explicitly given how common it is in template-driven design.
- **Parallax scrolling for its own sake** — carried forward unmodified from `ARCHITECTURE/07_DESIGN_SYSTEM.md` §4's existing exclusion.
- **Autoplay decorative loops of any kind** (a looping background animation, an idle "breathing" effect on a static element) — nothing on a HubZero page moves without a reader's scroll or interaction triggering it, with the sole exception of the hero's one load sequence.
- **Scroll-jacking** (hijacking native scroll behavior to force a pace) — a reader's own scroll speed is never overridden, even during a GSAP pinned sequence, which should scrub with scroll position rather than take control of it.
- **Cursor-following or "magnetic" hover effects on buttons/links** — a currently-fashionable micro-interaction with no comprehension value, excluded on the same grounds as letter-by-letter text reveals.
- **Decorative particle systems, floating ambient shapes, or any "living background."** These are the motion-system equivalent of the decorative blur orbs `DESIGN/00_AI_DESIGN_GUIDE.md` §3.2 already excludes for static visuals, and the exclusion applies identically to their animated form.
- **Gratuitous 3D transforms** (cards flipping, tilting on hover for no informational reason) — a physical-feeling interaction with no real referent in Working Blueprint's material logic (nothing in real drafting or PCB work tilts or flips for attention).
- **Any animation whose sole stated purpose is "to feel more premium" or "to feel more alive."** This is the exact phrasing `DESIGN/00_AI_DESIGN_GUIDE.md` §2 already flags as the tell of decoration wearing motion's clothes, and it remains the fastest way to identify a motion request that should be declined outright rather than softened.
