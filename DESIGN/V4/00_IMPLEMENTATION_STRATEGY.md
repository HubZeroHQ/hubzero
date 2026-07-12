# DESIGN/V4 — Monochrome Implementation Strategy

> **Status: Governing — 2026-07-12.** Adopted per direct instruction, continuing from `docs/design-reviews/STRATEGIC_PRODUCT_REVIEW_V4.md` (PR #35) and treating `.hubzero` (HubZero Core) as governing philosophy throughout. This document is the concrete, implementable strategy that review's §4 pointed at but did not fully specify — it exists to be built from directly, not re-interpreted per page.
>
> **What this supersedes in `DESIGN/V3`:** `04_COLOR.md`, `11_COLOR_PHILOSOPHY_AMENDMENT.md` (the seven-stop Brand Blue derivation), and `08_MOTION_SYSTEM.md`'s three-library baseline scope. **What it extends:** `13_BRAND_SYSTEM.md`, now that real canonical assets exist and most of its "gap" is closed. **What it leaves untouched:** `02_VISUAL_LANGUAGE.md`'s geometry (trace-path, drafting-sheet composition), `03_TYPOGRAPHY.md`, `05_LAYOUT_SYSTEM.md`, `06_COMPONENT_LANGUAGE.md`'s non-color decisions, `07_IMAGERY.md`, `09_PAGE_ARCHETYPES.md` (re-tiered by capacity per the prior review, not rewritten), `12_ACCESSIBILITY.md`, `14_VISUAL_TOKENS.md`'s spacing/grid/radius/stroke work, and `15_DIAGRAM_SYSTEM.md`. None of that was ever a function of hue or of how many motion libraries the site uses.

---

## 1. Governing hierarchy

`.hubzero` (HubZero Core) → this document → `DESIGN/V3` where this document doesn't override it. Where a specific instruction below conflicts with a `DESIGN/V3` document, this document wins and states why. Where this document is silent, `DESIGN/V3` still applies.

---

## 2. Brand identity — monochrome, mark-led

The company has delivered its canonical mark: `assets/hubzero-logo-black.png` / `hubzero-logo-white.png` (the H/Z hexagonal monogram, flat, zero chroma) and `assets/hubzero-app-icon.png`. These are real, decided brand assets, not placeholders — nothing about the mark's geometry is open for reinterpretation here.

**The new falsifiable gate, added alongside `DESIGN/V3/01_VISION.md` §8's Recognition Test:**

> **The Grayscale Test.** Desaturate any page to pure grayscale. Does it still read, unmistakably, as HubZero — through composition, typography, geometry, and the mark alone? If a page only reads as "HubZero" because of a color, it has failed this test regardless of how it scores on any other measure.

Every page ships against this test the same way it ships against the Uniqueness and Recognition tests — per page, not once at the end.

**Two registers, retained from `13_BRAND_SYSTEM.md` §1 invariant 2, simplified:** canonical (flat, the two real PNGs, used everywhere in product chrome) and expressive (a future richer treatment, if one is ever produced, reserved for a hero/launch moment) — both monochrome now, since the delivered mark itself carries no color in either register. `13_BRAND_SYSTEM.md`'s canonical/expressive distinction survives; its assumption that the expressive register is inherently _colored_ does not.

**Wordmark:** "Hub" in Geist Sans, "Zero" in IBM Plex Serif, both set in the ink text color — no accent color on either half. Distinction between the two halves is carried by typeface alone, which is sufficient and was always the more interesting idea than color-coding half a two-syllable name.

---

## 3. Color system — Ink, plus one restrained Signal

**The rule, stated once:** the brand is monochrome. A single narrow **Signal** color may exist for functional system roles — interaction, focus, progress, diagrams, live state — and nowhere else. It is never a section wash, a background fill, a decorative texture tint, or a headline treatment. If removing the Signal color from a page would change what the page _communicates_ (not just its mood), the Signal color has been used correctly. If a page merely looks less finished without it, it was being used as brand decoration and the design under it wasn't strong enough on its own.

### 3.1 Ink (the neutral base)

Two hue-neutral registers, both effectively zero chroma (not "a faint lean," genuinely neutral — the honesty `DESIGN/V3/04_COLOR.md` §2 gestured at with "under 0.02 chroma," taken to its actual conclusion):

- **Graphite** (dark mode default) — a true near-black, the color of pencil lead and machined graphite, not a hue family.
- **Vellum** (light mode) — a warm, low-chroma off-white closer to real drafting/tracing paper than a stark digital white.

Token names are unchanged from the current implementation (`--color-bg`, `--color-bg-dark`, `--color-bg-light`, `--color-text`, `--color-text-muted`, `--color-border`, `--color-border-muted`, `--color-highlight`) — every existing `bg-*`/`text-*`/`border-*` call site keeps working; only the values (now genuinely neutral OKLCH stops) change. See `src/app/globals.css` for the exact values.

### 3.2 Signal (the one functional color)

One color, one job description, used identically across both themes for its base fill value (unchanged-across-themes is deliberately kept from the prior system, since a signal that shifts hue between themes stops being a reliable learned cue). Distinct from the retired Brand Blue hue — this is a genuinely new decision, not the old brand color relabeled, so a repeat visitor never reads it as "they kept their blue, just quieter." A moderate cyan-leaning blue, closer to a terminal cursor or an instrument-panel indicator light than to a corporate SaaS accent — chosen for the same reason the retired blue was defensible on safety grounds (`DESIGN/V3/11_COLOR_PHILOSOPHY_AMENDMENT.md` §5: blue-family hues sit far from the red–green confusion axis, the most common forms of color-vision deficiency) without inheriting blue's specific brand history.

**Where it may appear:**

- The primary interactive affordance (one CTA's fill or link color per page's primary conversion path).
- Focus rings (unchanged from the current implementation).
- Progress/live-state indicators (a status dot, a "demo is live" marker).
- Diagram and schematic linework (`DESIGN/V3/15_DIAGRAM_SYSTEM.md`'s both tiers) — diagrams and interaction now share one signal color rather than two separate hues (previously Brand Blue vs. Ice Blue), a deliberate simplification: one thing to learn, one thing to maintain, and diagrams already read as "technical content" through line convention and the drafting-sheet vocabulary, not through a second hue nobody could explain the difference for.

**Where it must never appear:** section backgrounds, decorative texture (hairline/dot-grid panel treatments move to ink — see the homepage component changes below), a headline fill or gradient, a hover state's _only_ signal (motion/weight/underline still carry that), body copy emphasis.

Retired in full: the seven-stop Brand Blue ramp, Electric Sky, Ice Blue, Pale Cyan, Neutral Silver, and `--brand-gradient`. Status colors (danger/warning/success/info) are untouched — narrow functional exceptions, orthogonal to the brand question, already correctly scoped in `DESIGN/V3/04_COLOR.md` §4.

**Verification owed, not yet performed:** the specific OKLCH stops shipped in this pass are directional and reasoned, following `DESIGN/V3/04_COLOR.md`'s own convention of shipping directional values pending real calibration — a full automated WCAG 2.1 AA contrast pass and CVD simulation against the actual rendered output is still required before these are treated as final, exactly as `DESIGN/V3/12_ACCESSIBILITY.md` already required for the palette it's replacing.

---

## 4. Typography — unchanged

Geist Sans, Geist Mono, IBM Plex Serif (upright by default) — none of this was ever a function of color. No change from `DESIGN/V3/03_TYPOGRAPHY.md`.

---

## 5. Composition — technical editorial, not magazine editorial

`DESIGN/V3/01_VISION.md` §7's "editorial engineering" idea is kept, re-pointed at a different reference set. The prior framing borrowed its pacing instinct from art-directed magazine photo essays (`00_EXPLORATION.md` §8's "Editorial Systems" direction, Kinfolk-adjacent). That produced real value (the whitespace-as-pacing device, the figure/caption discipline) but also the specific failure `docs/design-reviews/MARKETING_SITE_REVIEW_V1.md` caught: an "unexpected whitespace pause" technique used so often it stopped meaning anything, because a magazine's rhythm is built to be lingered in, and a technical evaluator reading a site to decide whether to hire an engineering team is not reading the way a magazine reader is.

**The reference set moves from magazines and agency sites to real engineering products and documentation** — a well-designed API reference, a component datasheet, a clean CLI tool's output, an instrument panel, a terminal. Concretely, this changes:

- **Whitespace is functional before it is atmospheric.** A pause exists to separate two genuinely different pieces of information, the way a datasheet's section break does — not primarily to create a "moment." `DESIGN/V3/02_VISUAL_LANGUAGE.md` §4's emphasis-whitespace budget (at most two per page) is kept, but the default posture tightens: when in doubt, a datasheet's spacing is closer to correct than a magazine spread's.
- **Density is earned, not avoided.** A metrics block, a spec comparison, a real technical decision walked through in full — these are allowed to be dense, because density read as precision is the goal, not density avoided for the sake of looking calm. `DESIGN/V3/05_LAYOUT_SYSTEM.md` §9's dense/quiet distinction already says this; this section just names the reference point it should be checked against (a real datasheet, not a magazine's negative space).
- **The drafting-sheet and trace-path geometric vocabulary is unchanged and, if anything, more load-bearing now** — it was never a magazine device, it was already the "real engineering document" reference point `DESIGN/V3/02_VISUAL_LANGUAGE.md` §1 built from. This is the one part of the prior system that was already pointed at the right target.
- **Pull-quotes and serif emphasis moments are held to a stricter bar.** A magazine reaches for a pull-quote to create a breathing moment. A technical document reaches for emphasis only when a single sentence is genuinely the thing to remember. Keep `DESIGN/V3/03_TYPOGRAPHY.md` §3's one-per-page budget; apply it more skeptically — the default answer to "does this page need a pull-quote" is no.

---

## 6. Motion — smallest architecture that still achieves flagship quality

**Two tiers, not three, and the second tier is a named, scoped exception rather than a default:**

1. **Motion (motion.dev) — the default for everything.** State transitions, hover/focus, page/layout transitions, one-shot scroll reveals, SVG line-drawing, spring-based counters. This already covers the jobs `DESIGN/V3/08_MOTION_SYSTEM.md` split across Motion _and_ Anime.js — Motion's `pathLength` animation and spring physics do both without a third dependency, third bundle cost, or third timing vocabulary. **Anime.js is retired from the dependency tree entirely** — grep-verified zero real usage anywhere in the codebase before removal, not removed speculatively.
2. **GSAP (ScrollTrigger) — one named, justified exception: multi-element, scroll-scrubbed diagram build-order sequencing.** `src/components/marketing/diagram/sequenced-diagram.tsx` is the real, working, isolated case that genuinely needs this — tying several elements' reveal progress directly to scroll position, in a defined build order, is outside what Motion's simpler scroll primitives do cleanly. This is kept, not because "GSAP is a good library" in the abstract, but because one specific, already-built, well-scoped component demonstrably needs it and nothing else does. Per `.hubzero/principles.md` — "Evaluate Dependencies, Don't Default Against Them" — the correct response to a real, demonstrated need is to keep the dependency scoped to that need, not to remove it on principle or to let it spread to jobs Motion already covers.

**Every animation must still pass `DESIGN/V3/08_MOTION_SYSTEM.md` §6 principle 1** — what did a viewer understand because of it that a static frame wouldn't have shown — unchanged. Decorative motion (the closed list in §8 of that document: letter-by-letter text reveals, parallax, autoplay loops, cursor-following effects, gratuitous 3D transforms, motion whose only justification is "feels more premium") is excluded exactly as before; nothing about a smaller library count loosens that bar, and a smaller surface area for motion to exist on makes it easier to hold the line, not harder.

`DESIGN/V3/16_SIGNATURE_MOMENTS.md`'s five named moments are retained conceptually, launch-tiered per the prior review (§4.4 of `STRATEGIC_PRODUCT_REVIEW_V4.md`): The Trace-In and The Confirmation ship first; The Build Sequence ships wherever a page has a real diagram worth sequencing (using the existing `SequencedDiagram` component, unchanged); The Section Cut and The Live Handoff are deferred until Tier 1 pages are stable.

---

## 7. Mobile — first-class, not a breakpoint

Per `.hubzero/design/mobile-experience.md`: composition may change per breakpoint; architecture (what exists, and in what order) does not. Concretely, for every page built under this strategy:

- Design the handheld composition alongside the desktop one, not after it. A component is not "done" because it doesn't overflow at 375px — it's done when its hierarchy was considered at that width on its own terms.
- The homepage's existing hero already does this correctly (`CircuitSignatureMark` swapping in below `lg`, the credibility strip recomposing into a vertical list rather than wrapping) — treat that as the reference pattern for "recompose, don't shrink," not an isolated exception.
- Primary actions stay within comfortable thumb reach on handheld layouts; nothing depends on `:hover` to reveal information a touch user has no other way to reach.

---

## 8. Capacity discipline

Unchanged from `STRATEGIC_PRODUCT_REVIEW_V4.md` §4.3 — Tier 1 (Home, Services, Software, Hardware, Work index, Case Study) gets full bespoke investment; Tier 2 (Labs, Builds, Blueprints, Notes) shares a real component with a distinct register; Tier 3 (Team, Careers, Contact, About) is a deliberately named quiet family. This document doesn't revisit that tiering, only restates it so the color/motion simplifications above are read as part of the same capacity-realism decision, not a separate concern.

---

## 9. Asset production — real files, not generated ones

No image-generation tool is available in this environment, and it wouldn't be the correct tool for most of what's needed here regardless:

- **The canonical mark, favicon set, and app icons** are produced directly from the real delivered files (`assets/hubzero-logo-black.png`, `hubzero-logo-white.png`, `hubzero-app-icon.png`) via image processing (resizing/format conversion), never a hand-drawn or generated approximation of the real mark — reconstructing a guessed vector copy of an already-real asset would itself be a small fabrication, not a shortcut.
- **Wordmark lockups and social-card templates** are real code/SVG/Next.js `opengraph-image` routes composed from the type system and the canonical mark — systematic, deterministic outputs of the design system, exactly what `DESIGN/V3/07_IMAGERY.md` already prescribes over any generated or externally-authored graphic.
- **Founder portraits are not a generation task, on principle, not only on tooling grounds.** Synthesizing photorealistic likenesses of real, named people would conflict directly with the zero-fabrication policy `DESIGN/V3/07_IMAGERY.md` and `ARCHITECTURE/05_CONTENT_STRATEGY.md` already enforce for every other kind of content and imagery on this site. The fix for `public/team/*`'s inconsistency remains what both prior reviews already identified: a real, same-session (or consistently retouched) photography pass — still the single highest trust-per-effort item outstanding, and still a blocker for Team/About shipping in their current state.

---

## 10. What ships in this pass, what's deferred

**This pass:** brand asset wiring (canonical monochrome mark in all chrome, favicon/app-icon set regenerated from real source files), the Ink + Signal token realignment, the Anime.js removal and GSAP scoping, and the homepage's color/motion/composition updates under this strategy.

**Deferred, named rather than silently dropped:** Tier 1 interior pages (Services, Software, Hardware, Work, Case Study, About) migrating to the new tokens; Tier 2/3 pages; the diagram/imagery production backlog; real team photography. Each follows in its own scoped pass, per `docs/design-reviews/STRATEGIC_PRODUCT_REVIEW_V4.md` §5's phased roadmap — not attempted together, on the same capacity reasoning this whole document is built on.
