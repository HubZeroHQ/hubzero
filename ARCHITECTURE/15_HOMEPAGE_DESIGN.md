# 15 — Homepage Design Architecture

> **Status: Founder Approval Pending — drafted 2026-07-01, awaiting sign-off before implementation begins.**

> **This document overrides `07_DESIGN_SYSTEM.md` §5's component vocabulary** (`GlassCard`, `GradientButton`, `SectionGrid`, `TagPill`) for the homepage and, by extension, any future page built in the same visual language. Per explicit founder instruction (2026-07-01, Phase 3 kickoff): *"One additional design directive overrides all previous implementation guidance... Assume the previous website failed as a design exercise... the new website should be visually unrecognizable from the previous version."* §5's glassmorphism/gradient-button/card-grid vocabulary was written as "keep the legacy signature in moderation" — that premise is rejected outright for Phase 3.
>
> What is **not** overridden, because it is neutral infrastructure rather than "legacy look": the OKLCH dark-first color tokens, the one-accent-color rule, the type-scale numbers, the spacing scale, and the motion timing values (200–400ms, ease-out, 8–16px) from `07_DESIGN_SYSTEM.md` §1–4 and §6. A number doesn't make something look templated; a blurred glass card does.

## 0. Why this document exists

Phase 3 (public pages) starts with the homepage, built as one complete, pre-approved architecture rather than section-by-section improvisation — per explicit founder direction: *"Phase 3 is where HubZero either succeeds or fails... Design the complete Homepage first... Only after the entire page architecture is approved should implementation begin."* This document is that architecture. It supplies the *how* on top of the *what* already locked in `06_PAGE_SPECIFICATIONS.md`'s Home section and the content facts in `00_FOUNDER_APPROVAL.md` / `01_PRODUCT_VISION.md` / `02_BRAND_STRATEGY.md` — none of which are being renegotiated here, only their visual and structural execution.

## 1. Design plan (token additions for the homepage)

**Color** — no change to the palette (dark OKLCH base, one electric-blue accent, the blue→violet→gold `--brand-gradient` token). Stricter usage than before: the gradient appears in **exactly one place** on the entire page — a text-fill on one line of the hero headline. No gradient buttons, no gradient borders, no gradient section backgrounds.

**Type** — the one deliberate aesthetic risk, and the actual mechanism that makes this page unrecognizable as a SaaS template: a **display serif** joins the existing Geist Sans/Mono pair, used only at hero/section-opener scale.
- Display: **Instrument Serif** (one weight, has a genuine italic cut) — headlines only, 56–96px. Recurring signature device: one word per major headline is set in the italic cut, echoing an editorial pull-quote emphasis — never a full sentence, never body copy.
- Body/UI: Geist Sans (unchanged).
- Technical/meta: Geist Mono (unchanged) — case-study stack names, dates, credibility-strip facts, step numbers.

Three roles, not one typeface doing everything — that's the actual difference between "editorial" and "SaaS," not a stylistic flourish.

**Layout signature** — HubZero builds both software and electronics; the page's one recurring visual motif is a **thin-line schematic/circuit-trace pattern** (low-opacity, single-accent-color linework), drawn from the subject matter rather than decorative for its own sake. It appears once, prominently, in the hero — and "draws itself" on load (§7) — with muted echoes as section-divider hairlines elsewhere. This is the signature element referenced by the frontend-design process: if you saw it without the logo, you'd know it was HubZero.

**Explicitly rejected for this page:** glassmorphism cards, gradient-filled buttons, a 3-card (or 2-card) generic grid for "What We Do," a browser-chrome mockup screenshot for the case study, stock photography, abstract hero illustrations, icon-grid-with-vague-claims, testimonial carousels, decorative blur orbs. (Most of these were already banned by `07_DESIGN_SYSTEM.md` §7 — the additions here are glassmorphism and gradient buttons specifically, which §5 had preserved.)

## 2. Information hierarchy

Six narrative beats, each answering exactly one question. The credibility strip is a transitional beat, not a full section — a thin band doesn't compete with the sections around it for attention.

| Order | Beat | Question it answers | Why here, not elsewhere |
|---|---|---|---|
| 1 | **Hero** | "Who are you?" | Must land in the first viewport, full stop |
| 2 | **Credibility strip** (thin band, not a section) | "...and are you real?" | A few honest facts, immediately, before asking for more attention |
| 3 | **What We Do** | "What do you actually do?" | Names both disciplines explicitly — CSE+ECE becomes concrete here, per the founder-approved hero amendment that moved this claim out of the headline |
| 4 | **Featured Case Study** | "Can you actually deliver?" | The trust climax — real, specific, verifiable. This *is* the proof, not a stats grid |
| 5 | **How We Work** | "What happens if I hire you — and after?" | Objection-handling, placed deliberately right before the ask, ending on the accountability differentiator |
| 6 | **CTA Close** | "How do I start?" | Bookends the hero — echoes its scale and typographic treatment |

This deliberately reorders `06_PAGE_SPECIFICATIONS.md`'s original Home bullet order (which put a stats block before "What We Do," and "How We Work" before the case study). Reasoning: a stats block that isn't a real, deep proof point shouldn't occupy a full narrative beat — it's a footnote to the hero, not its own chapter. And process-before-proof asks someone to trust the method before they've seen it produce a result; proof-before-process shows the result, then explains why it will happen again for the visitor, right when they're deciding whether to click. The six *content* blocks specified in `06` are all still present — only their grouping and order changed.

## 3. Visual rhythm

No two adjacent sections share a composition:

```
Hero            — full-bleed, asymmetric, left-weighted, near-full-viewport
Credibility     — full-width, thin, single running line (not a section at all)
What We Do      — two large UNEQUAL panels (not matching cards), different textures per panel
Case Study      — full-bleed, image-dominant, most vertical space on the page
How We Work     — compact vertical stepped list, offset right
CTA Close       — centered, symmetric — the one symmetric moment on the page
```

Ending on a centered/symmetric composition after five asymmetric beats gives the page a resolved "full stop" — tension, then release.

## 4. Spacing strategy

Section height is proportional to narrative weight, not a uniform padding value repeated six times (uniform rhythm is what makes a page read as "stacked sections"):
- Hero: ~90dvh — a real statement, not a compressed banner.
- Credibility strip: compact, ~80–120px — a breath, not a chapter.
- What We Do: generous, two-panel spread with real air between the panels.
- Case Study: the tallest section on the page — the trust climax earns the most space.
- How We Work: intentionally compact and fast — a confident, quick beat, not a lingering one.
- CTA Close: generous again, mirroring the hero.

Content width varies with purpose: hero and CTA break to a wider/asymmetric measure; the case study runs closer to full-bleed for the image; body-copy-heavy moments (How We Work) stay inside the tighter reading measure (`--content-prose`). Full sections keep the existing 96–128px vertical-padding floor from `07_DESIGN_SYSTEM.md` §3; the credibility strip is exempt by design (it isn't a section).

## 5. CTA strategy

One phrase, exactly two places: **"Start a project"**, worded identically in the hero and at the close — the same action keeps the same name everywhere. One secondary, lower-commitment action — **"See our work"** — appears only in the hero, per `06_PAGE_SPECIFICATIONS.md` §9a's resolution (exploratory action is secondary, contact is primary). No other buttons compete visually: Services panels and the case study link out via plain in-content links/arrows, not button chrome, so the accent-filled pill is reserved entirely for the one action that matters and its visual weight always maps to actual priority.

## 6. Trust-building sequence

Claim → small honest facts → named capability → hard evidence → risk reduction → ask:
1. Hero states the claim directly — no hedging, no slogan (per `00_FOUNDER_APPROVAL.md` §5 hero register).
2. Credibility strip backs it with 2–3 *real* facts only — founded 2024, two disciplines under one team, selective by design. Nothing unverifiable, per the standing ban on inflated stats (`01_PRODUCT_VISION.md` §9).
3. What We Do makes the differentiator concrete and nameable.
4. The case study is the actual evidence: Bhatkal Time Luxe, a real client, MERN + Imgix, built Apr–May 2025 (~6 weeks), real specifics (advanced product filtering, Imgix-optimized image delivery). Per `00_FOUNDER_APPROVAL.md` §2, this one real case study is sufficient to launch on.
5. How We Work removes the last-mile doubt (what happens, how communication works, what happens after launch) right before the ask.
6. The ask.

## 7. Motion strategy

One **orchestrated** moment, then near-silence:
- On load: the hero's circuit-trace linework draws itself in once, then the headline and subhead sequence in, then the credibility strip ticks in last. This is the one place Framer Motion is justified for this page — sequencing/staggering several independent elements is exactly its job, versus brittle hand-chained CSS delays. This is the "demonstrated need" `07_DESIGN_SYSTEM.md` §4 and the Phase 2B guidance both require before reaching for it.
- Below the fold: plain CSS, one-shot reveals only (8–16px travel, 200–400ms, ease-out), matching the existing `lib/motion.ts` contract — no scroll-triggered animation repeated on every section.
- The case study's timeline/stack can tick in once as it enters view — motion with an actual informational job, not decoration.
- No parallax, no autoplay loops, no scroll-jacking. `prefers-reduced-motion` disables all of the above via the existing global CSS rule (`globals.css`, already forces `animation-duration`/`transition-duration` to near-zero — see Phase 2B).

## 8. Conversion strategy

The page is built to make one action (contact) feel like the obvious next step rather than a leap: every section reduces a specific kind of doubt (real? capable? proven? safe to commit to?) in the order a skeptical buyer actually has them, the CTA never competes with itself, and nothing on the page makes a claim it can't back with a specific, named fact — per `02_BRAND_STRATEGY.md` §2's "could a competitor's website say this exact sentence and be equally true?" test.

## 9. Section-by-section detail (for implementation)

**Hero.** Asymmetric, left-weighted headline set in Instrument Serif (one word italicized) with the gradient text-fill on one line, generous negative space to the right occupied only by the circuit-trace motif — no stock imagery, no illustration. Subhead in Geist Sans, one sentence. Primary CTA "Start a project" (solid accent pill, no gradient fill), secondary "See our work" as a plain text link.

**Credibility strip.** A single running line of Geist Mono text, facts separated by a small glyph (not a card, not an icon-stat grid) — e.g. founding year, the two-discipline claim, the selectivity claim.

**What We Do.** Two large, unequal-width panels (Software Engineering wider, Hardware & Embedded offset) with genuinely different visual texture per panel (e.g. a faint code-metaphor texture vs. a faint schematic texture) rather than an identical card template repeated twice. Each panel links to its own service page as an in-content link, not a button.

**Featured Case Study.** Bhatkal Time Luxe. The existing screenshot (`client/public/projectscreenshots/ecommerce-thumbnail.png`) is a four-panel collage and should **not** be embedded as-is — that reads as a generic portfolio thumbnail dump. Implementation should curate/crop a single confident detail (the product-detail-page panel is the cleanest single composition) for a large, full-bleed or asymmetric image treatment, paired with real specifics set in Geist Mono (stack, timeline) and a short problem → approach → result narrative in Geist Sans. Ends with a plain "Read the full case study →" link, not a button.

**How We Work.** Three real steps, numbered (legitimate here — it's an actual sequence, not decorative numbering), set as a compact vertical list offset to one side. Step 3 explicitly carries the accountability/maintenance differentiator, since it's the load-bearing trust point per `02_BRAND_STRATEGY.md` §6.

**CTA Close.** Centered, symmetric, mirrors the hero's typographic scale — a callback/bookend to the opening line rather than a boxed banner. "Start a project," worded identically to the hero.

## 10. Open items before/at implementation

- Instrument Serif needs to be added via `next/font/google` alongside the existing Geist Sans/Mono in `src/app/layout.tsx`.
- The case-study visual needs a curated crop of the existing screenshot (or a newly captured one) rather than the raw four-panel collage.
- The exact 2–3 credibility-strip facts need final wording sign-off (proposed: "Founded 2024" / "Software and hardware engineering, one team" / "Selective by design").

## 11. On this document's location

This file was drafted inside the `hubzero-v2-phase1` git worktree (`.claude/worktrees/hubzero-v2-phase1/ARCHITECTURE/`), not the main checkout's `ARCHITECTURE/` folder, because the session was sandboxed to the worktree and the main checkout's `ARCHITECTURE/` directory is untracked by git (never committed to any branch), so the two locations don't automatically reconcile. **This copy should be moved/merged into the canonical `ARCHITECTURE/` folder at the repo root** — say the word and this can be done directly (it only requires leaving the worktree isolation for a documentation-only step, not a code change).
