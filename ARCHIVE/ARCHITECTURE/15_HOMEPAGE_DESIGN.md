> **⚠️ ARCHIVED — historical reference only, not implementation guidance.** This document described the public marketing website under the design direction that was reset. It is preserved for historical context. Do not use it to guide the new design (see `DESIGN/NEXT`). See `ARCHIVE/README.md`.

# 15 — Homepage Design Architecture

> **Status: Founder Approval Pending (Round 2) — architecture approved in principle 2026-07-01; this revision incorporates founder design-directive feedback given the same day, before any component is written. Implementation still has not started.**

> **This document overrides `07_DESIGN_SYSTEM.md` §5's component vocabulary** (`GlassCard`, `GradientButton`, `SectionGrid`, `TagPill`) for the homepage and, by extension, any future page built in the same visual language. Per explicit founder instruction (2026-07-01, Phase 3 kickoff): *"Assume the previous website failed as a design exercise... the new website should be visually unrecognizable from the previous version."* §5's glassmorphism/gradient-button/card-grid vocabulary was written as "keep the legacy signature in moderation" — that premise is rejected outright for Phase 3.
>
> What is **not** overridden, because it is neutral infrastructure rather than "legacy look": the OKLCH dark-first color tokens, the one-accent-color rule, the type-scale numbers, the spacing scale, and the motion timing values (200–400ms, ease-out, 8–16px) from `07_DESIGN_SYSTEM.md` §1–4 and §6.

## 0. Why this document exists, and why it has a Round 2

Phase 3 (public pages) starts with the homepage, built as one complete, pre-approved architecture rather than section-by-section improvisation. Round 1 of this document was approved *in principle* — the beat order, the case study, the CTA, the token usage all hold. But the founder flagged that the underlying mental model was still an **agency site model** (Hero → Services → Case Study → Process → CTA) wearing an editorial skin, rather than an actual **editorial model**. Round 2 does not change *what* the page says — it changes *how the document itself is organized*, so the distinction can't get lost again during implementation:

- The word "section" is being retired from this document's working vocabulary wherever it implies a self-contained block. §2 is renamed **Narrative arc**, not "information hierarchy," and describes transitions explicitly, not just content per beat.
- A hard "hero height = 90dvh" number is removed (§4 rewritten as impact-driven, not viewport-driven).
- A new §8a, **Memorable moments**, names at least three specific, non-section moments the visitor should recall.
- A new §9a, **Emotional arc**, describes the feeling of scrolling the page, not just its content order.
- A new §12, **Uniqueness test**, is now a mandatory per-beat gate applied *after* each beat is designed, before it's considered done.

None of this renegotiates the content facts already locked in `06_PAGE_SPECIFICATIONS.md`, `00_FOUNDER_APPROVAL.md`, `01_PRODUCT_VISION.md`, or `02_BRAND_STRATEGY.md` — only the visual, structural, and emotional execution.

## 1. Design plan (token additions for the homepage)

**Color** — no change to the palette (dark OKLCH base, one electric-blue accent, the blue→violet→gold `--brand-gradient` token). The gradient appears in **exactly one place** on the entire page — a text-fill on one line of the hero headline. No gradient buttons, no gradient borders, no gradient section backgrounds.

**Type — pacing, not decoration.** Instrument Serif joins the existing Geist Sans/Mono pair, but Round 2 tightens its role considerably. Round 1 permitted the serif "at hero/section-opener scale" broadly — on reflection, that's exactly the overuse the founder flagged: if every beat opens with a serif line, the serif stops being a slow-down cue and becomes a stylistic default, which is indistinguishable from decoration.

Round 2 rule: **the serif appears at a small, named set of moments where the reader should genuinely slow down** — not once per beat automatically.
- Display: **Instrument Serif** (one weight, genuine italic cut). Confirmed uses: the hero headline (one word italicized), and the case-study's single pull-line (§9, "Featured Case Study"). Everywhere else defaults to Geist Sans unless a specific moment earns the slow-down (see §8a).
- Body/UI: **Geist Sans** — the clarity workhorse. This carries the page. If in doubt, a line is Geist Sans.
- Technical/meta: **Geist Mono** — reserved for actual technical precision or metadata: stack names, dates, credibility-strip facts, step numbers. Never used decoratively for "tech vibes."

Typography is the primary visual identity of this page — not the circuit motif, not color. Every other decision in this document should be checked against whether it's competing with type for that role.

**Layout signature — circuit traces must earn their place.** HubZero builds both software and electronics; the recurring visual motif is a thin-line schematic/circuit-trace pattern, low-opacity, single-accent-color. Round 2 adds an explicit test (also see §12): **if removing the motif leaves the composition equally strong, it wasn't contributing — cut it. If adding it makes a beat feel like a generic tech-company website, it's doing too much — reduce it.**

Applying that test to Round 1's spec: the motif's hero appearance (drawing itself in, occupying the negative space beside the headline, doubling as literal subject-matter reference) passes — remove it and the hero loses its one non-typographic identity marker. Its Round 1 use as "muted echoes as section-divider hairlines elsewhere" does **not** clearly pass — a hairline that shows up at every transition risks becoming wallpaper, the exact "tech decoration" failure mode. Round 2 restricts it to two appearances total: the hero (primary, prominent) and one integrated appearance inside "How We Work" or the case study, where a schematic-style line can double as an actual connective/annotation device (see §9). No blanket dividers.

**Explicitly rejected for this page:** glassmorphism cards, gradient-filled buttons, a 3-card (or 2-card) generic grid for "What We Do," a browser-chrome mockup screenshot for the case study, stock photography, abstract hero illustrations, icon-grid-with-vague-claims, testimonial carousels, decorative blur orbs, hard visual rules/dividers between beats (new in Round 2 — see §3).

## 2. Narrative arc (not "information hierarchy")

Six narrative beats. Round 1 called this "information hierarchy" and specified beats as if they were sections with boundaries. Round 2 keeps the beats and their order — that reasoning held up — but reframes the document around the **transitions between beats being designed with the same intent as the beats themselves**. A visitor should be able to describe the page as one continuous read, not recall six chunks.

| Order | Beat | Question it answers | How it flows out of the previous beat |
|---|---|---|---|
| 1 | **Hero** | "Who are you?" | — (opening line) |
| 2 | **Credibility strip** (thin running line, not a block) | "...and are you real?" | The hero's motion sequence resolves directly into this line ticking in — no scroll-stop, no visual seam; it reads as the hero's last breath, not a new element |
| 3 | **What We Do** | "What do you actually do?" | The credibility strip's mention of "two disciplines" is picked up and made concrete here — the transition is a callback, not a topic change |
| 4 | **Featured Case Study** | "Can you actually deliver?" | "What We Do" ends mid-thought on the Software panel's link-out; the case study opens as if answering "here's what that looks like," not as a new page section |
| 5 | **How We Work** | "What happens if I hire you — and after?" | The case study's closing "Read the full case study →" beat is immediately followed, in the same visual breath, by the process list — proof, then "and here's how we'd do that for you," not a hard cut |
| 6 | **CTA Close** | "How do I start?" | Bookends the hero directly — same scale, same typographic treatment, so the page reads as arriving back where it started, changed |

Reasoning for the beat order is unchanged from Round 1: a stats block that isn't a real, deep proof point is a footnote to the hero, not its own chapter; proof-before-process shows the result before asking for trust in the method. What changed is that **each row's right-hand column is now a design requirement**, not commentary — implementation must treat the seam between beats as a deliberate compositional decision (see §3), not a spacer div.

## 3. Visual rhythm and transitions

No two adjacent beats share a composition — but Round 2 requires that adjacent beats also share no **hard boundary**. Concretely: no full-width rule lines, no abrupt background-color blocks, no "container ends, new container begins" whitespace gap that reads as a seam. Instead, each transition uses one continuous device — a persisting element that carries across the seam (the circuit motif tapering into the next beat's opening line; a heading that starts before the previous beat's content has fully cleared the viewport; the vertical rhythm compressing rather than resetting).

```
Hero            — full-bleed, asymmetric, left-weighted; height set by content (§4), not a vh target
   ↳ tapers directly into —
Credibility     — full-width, thin, single running line (not a block); no top/bottom rule
   ↳ the "two disciplines" phrase is the hinge into —
What We Do      — two large UNEQUAL panels (not matching cards), different textures per panel
   ↳ the Software panel's link-out becomes the opening frame of —
Case Study      — full-bleed, image-dominant, most vertical space on the page, minimal interface
   ↳ closing case-study line flows straight into —
How We Work     — compact vertical stepped list, offset right; the second circuit-motif appearance lives here as a connective line between steps, not decoration
   ↳ resolves into —
CTA Close       — centered, symmetric — the one symmetric moment on the page, the arrival
```

Ending on a centered/symmetric composition after five asymmetric beats gives the page a resolved "full stop" — tension, then release (see §9a for the emotional read of this same shape).

## 4. Hero sizing — impact-driven, not viewport-driven

Round 1 specified "~90dvh" for the hero. That number is removed. The founder's direction is explicit: forget viewport percentages, design the hero around its content, and let the correct height be whatever the visual impact and narrative pacing actually require — which could land under 60dvh or past 100dvh depending on how the final headline, negative space, and circuit motif compose together.

What stays fixed instead of a height number: the hero must not be compressed to fit a target, and must not be padded out to fill one either. In practice this means the hero's height is a *downstream result* of: how many lines the final headline copy needs at the chosen type scale, how much negative space the circuit motif needs to read as intentional rather than cramped, and where the credibility-strip handoff naturally wants to occur. Implementation should build the hero content first at its natural size, then check the resulting height against the rest of the page's rhythm — not the reverse.

## 5. Spacing strategy

Beat "height" (a soft concept now, per §3–4 — not a padding value) is proportional to narrative weight, not a uniform value repeated six times:
- Hero: sized by content and impact (§4) — a real statement, not a compressed banner, and not artificially stretched.
- Credibility strip: compact — a breath, not a chapter.
- What We Do: generous, two-panel spread with real air between the panels.
- Case Study: the tallest beat on the page — the trust climax earns the most space, generous whitespace throughout, minimal interface chrome.
- How We Work: intentionally compact and fast — a confident, quick beat, not a lingering one.
- CTA Close: generous again, mirroring the hero.

Content width varies with purpose: hero and CTA break to a wider/asymmetric measure; the case study runs closer to full-bleed for the image; body-copy-heavy moments (How We Work) stay inside the tighter reading measure (`--content-prose`). Vertical rhythm between beats compresses or expands at the transition itself (§3) rather than resetting to a fixed padding floor at every boundary — the 96–128px floor from `07_DESIGN_SYSTEM.md` §3 is a minimum, not the default, and is deliberately broken at the tapered transitions.

## 6. CTA strategy

Exactly one phrase, used everywhere the primary action appears: **"Start a project."** Never rephrased, never restated as "Get in touch," "Let's talk," "Get started," or any variant, in the hero or at the close — same wording, same visual weight (solid accent pill, no gradient fill), both times. One secondary, lower-commitment action — **"See our work"** — appears only in the hero. No other buttons compete visually: Services panels and the case study link out via plain in-content links/arrows, not button chrome. This consistency is a trust signal in its own right (per founder direction: consistency increases trust) — it should hold as a hard constraint through implementation and into any other page built later, not just this document.

## 7. Trust-building sequence

Claim → small honest facts → named capability → hard evidence → risk reduction → ask:
1. Hero states the claim directly — no hedging, no slogan (per `00_FOUNDER_APPROVAL.md` §5 hero register).
2. Credibility strip backs it with 2–3 *real* facts only — founded 2024, two disciplines under one team, selective by design. Nothing unverifiable, per the standing ban on inflated stats (`01_PRODUCT_VISION.md` §9).
3. What We Do makes the differentiator concrete and nameable.
4. The case study is the actual evidence: Bhatkal Time Luxe, a real client, MERN + Imgix, built Apr–May 2025 (~6 weeks), real specifics (advanced product filtering, Imgix-optimized image delivery). Per `00_FOUNDER_APPROVAL.md` §2, this one real case study is sufficient to launch on.
5. How We Work removes the last-mile doubt (what happens, how communication works, what happens after launch) right before the ask.
6. The ask.

## 8. Motion strategy — inevitable, not surprising

One **orchestrated** moment, then near-silence — Round 1's philosophy was correct; Round 2 tightens the *intent* behind it. Motion here should feel like the obvious, expected consequence of scrolling, not a surprise the visitor notices before the content. The test: if someone were asked afterward "what animated on this page?", the honest answer should be "I'm not sure, I was reading" — not a specific animation they can describe.

- On load: the hero's circuit-trace linework draws itself in once, then the headline and subhead sequence in, then the credibility strip ticks in last, continuing directly off the hero sequence rather than starting its own. Framer Motion is justified here specifically because sequencing/staggering several dependent elements is its job, not because motion itself is a goal.
- Below the fold: plain CSS, one-shot reveals only (8–16px travel, 200–400ms, ease-out), matching `lib/motion.ts` — reinforcing hierarchy and reading order, never drawing attention to itself.
- The case study's timeline/stack can tick in once as it enters view — motion with an actual informational job.
- No parallax, no autoplay loops, no scroll-jacking, no motion added to make a beat "feel more premium" — that's decoration wearing motion's clothes. `prefers-reduced-motion` disables all of the above via the existing global CSS rule.

## 8a. Memorable moments (new in Round 2)

The founder's direction: the page should produce moments a visitor recalls, not a list of sections they scanned. These are not new beats — they are specific compositional decisions inside the beats already planned, called out explicitly so they don't get diluted into "just a nice hero" or "just a nice image" during implementation. At least three, named:

1. **A sentence that dominates the viewport** — the hero headline, at a scale where it is the only thing the eye can do (§1, §4). Not a headline-plus-supporting-visual composition where the eye has a choice — the line itself is the composition.
2. **A breathtaking full-width case-study image** — the single curated Bhatkal Time Luxe detail (§9), full-bleed, no browser chrome, no UI around it, enough surrounding whitespace that the image reads as a deliberate presentation rather than a screenshot dropped into a template.
3. **An unexpected amount of whitespace at the hinge between What We Do and the Case Study** — a deliberate pause (not a hard boundary, per §3 — a taper) that lets the case study's opening land with more weight than it would if it arrived immediately after a busy two-panel beat.
4. **A beautifully presented technical detail** — the case study's stack/timeline facts, set in Geist Mono, treated as a small, precise, confidently understated moment (a single line of real facts) rather than a stats-badge row.

These four exist to strengthen the beats they live inside — none of them is decoration added after the fact. If implementation finds a beat has no memorable moment in it, that is a signal the beat needs a stronger idea, not that a moment should be inserted artificially.

## 9. Beat-by-beat detail (for implementation)

**Hero.** Asymmetric, left-weighted headline set in Instrument Serif (one word italicized) with the gradient text-fill on one line, generous negative space to the right occupied only by the circuit-trace motif — no stock imagery, no illustration. Height is a downstream result of this content (§4), not a target. Subhead in Geist Sans, one sentence. Primary CTA "Start a project" (solid accent pill, no gradient fill), secondary "See our work" as a plain text link. This beat is Memorable Moment #1 (§8a).

**Credibility strip.** A single running line of Geist Mono text, facts separated by a small glyph (not a card, not an icon-stat grid) — e.g. founding year, the two-discipline claim, the selectivity claim. Ticks in as a direct continuation of the hero's motion sequence (§3, §8), not a separate reveal.

**What We Do.** Two large, unequal-width panels (Software Engineering wider, Hardware & Embedded offset) with genuinely different visual texture per panel (e.g. a faint code-metaphor texture vs. a faint schematic texture) rather than an identical card template repeated twice. Each panel links to its own service page as an in-content link, not a button. The Software panel's link-out is the visual hinge into the case study (§3).

**Featured Case Study.** Bhatkal Time Luxe, treated as a magazine feature, not a portfolio card: large imagery, confident typography, minimal interface, generous whitespace. The existing screenshot (`client/public/projectscreenshots/ecommerce-thumbnail.png`) is a four-panel collage and must **not** be embedded as-is — implementation should curate/crop a single confident detail (the product-detail-page panel is the cleanest single composition) for a large, full-bleed or asymmetric image treatment (Memorable Moment #2). Pair with one Instrument Serif pull-line (the only non-hero use of the display serif on the page — a single confident editorial sentence about the work, not a headline restating the section), real specifics set in Geist Mono (stack, timeline — Memorable Moment #4), and a short problem → approach → result narrative in Geist Sans. Ends with a plain "Read the full case study →" link, not a button, flowing directly into How We Work.

**How We Work.** Three real steps, numbered (legitimate here — an actual sequence, not decorative numbering), set as a compact vertical list offset to one side. The circuit motif's second and final appearance (§1) lives here as a connective line running between the three steps — doubling as an actual connective/annotation device, not a divider. Step 3 explicitly carries the accountability/maintenance differentiator, the load-bearing trust point per `02_BRAND_STRATEGY.md` §6.

**CTA Close.** Centered, symmetric, mirrors the hero's typographic scale — a callback/bookend to the opening line rather than a boxed banner. "Start a project," worded identically to the hero. This is the "arrival" beat described in §9a.

## 9a. Emotional arc (new in Round 2)

The founder's direction is to design an experience with rhythm, not just content in the right order. Named, so implementation can check the page against it directly:

- **Hero → Credibility strip:** confidence, stated plainly, immediately grounded — no tension yet, just a clear opening statement.
- **Credibility strip → What We Do:** mild curiosity — "two disciplines" is named but not yet explained, pulling the reader forward.
- **What We Do → Case Study:** the unexpected whitespace pause (§8a #3) creates a small held breath before the page's biggest visual payoff — anticipation released into immersion.
- **Case Study:** the page's longest, most immersive beat — the reader should feel like they're looking at real work, not being sold to. This is deliberately the calmest, least button-driven moment on the page.
- **Case Study → How We Work:** confidence returning, briskly — the compact, fast pacing of this beat is a deliberate change of tempo after the slow immersion of the case study, mirroring how a confident team actually talks about process (quick, sure, no over-explaining).
- **How We Work → CTA Close:** resolution — the symmetric, centered close (the only symmetric composition on the page, per §3) reads as arriving somewhere, not stopping. The overall shape is tension/asymmetry building across five beats, resolved by one symmetric, generous final beat — the same shape as a well-edited magazine feature's closing page.

## 10. Conversion strategy

The page is built to make one action (contact) feel like the obvious next step rather than a leap: every beat reduces a specific kind of doubt (real? capable? proven? safe to commit to?) in the order a skeptical buyer actually has them, the CTA never competes with itself, and nothing on the page makes a claim it can't back with a specific, named fact — per `02_BRAND_STRATEGY.md` §2's "could a competitor's website say this exact sentence and be equally true?" test.

## 11. Open items before/at implementation

- Instrument Serif needs to be added via `next/font/google` alongside the existing Geist Sans/Mono in `src/app/layout.tsx`.
- The case-study visual needs a curated crop of the existing screenshot (or a newly captured one) rather than the raw four-panel collage.
- The exact 2–3 credibility-strip facts need final wording sign-off (proposed: "Founded 2024" / "Software and hardware engineering, one team" / "Selective by design").
- The case study's single Instrument Serif pull-line (§9) needs copy drafted and signed off — it is a new element versus Round 1 and doesn't yet have a candidate sentence.
- The exact taper/hinge transitions (§3) between beats are a design decision that will need to be seen in-browser to validate — a written spec can describe intent but not confirm the seam actually reads as continuous; flag this for visual QA once built, the same way the Phase 2A tailwind-merge bug was only caught by looking at the rendered page.

## 12. Uniqueness test (new in Round 2 — mandatory per-beat gate)

After each beat is designed (and again after the whole page is assembled), stop and ask: **could this beat appear on another agency's website simply by replacing the logo?** If yes, it has failed and must be redesigned before moving on — this is not a final-pass checklist item, it's a gate applied beat-by-beat during implementation, the same way `02_BRAND_STRATEGY.md` §2's competitor-sentence test is applied to copy.

Applying it now, in advance, to flag risk areas for implementation to watch:
- **Hero** — passes if the circuit motif and the specific headline copy are both present; a generic "big serif word + subhead + button" hero without HubZero's specific claim or motif would fail.
- **What We Do** — the highest-risk beat for genericness, since "two service panels" is itself a common agency pattern. It only passes because of the CSE+ECE unequal-panel asymmetry and differentiated per-panel texture (§9) — a symmetric two-card grid here would fail immediately.
- **Case Study** — passes on the strength of the real, specific project and curated image; would fail if the collage screenshot were used as-is (this is exactly why §9/§11 forbid it).
- **How We Work** — the numbered-steps pattern is common; it passes only via the circuit-motif connective line and the accountability-specific Step 3 content, not the numbering itself.
- **CTA Close** — passes because it's a typographic bookend of the hero rather than a boxed "Ready to get started?" banner, which is the generic version of this beat.

Final quality gate before implementation is considered complete, per founder direction — every one of these must be "yes":
- Does this still feel editorial rather than SaaS?
- Does this still feel timeless rather than trendy?
- Does this still feel premium rather than flashy?
- Does this still feel like one uninterrupted narrative rather than stacked sections?
- Would a potential client remember this experience tomorrow?
- Is every animation earning its place?
- Is every design decision helping build trust?
- Is this recognizably HubZero rather than recognizably AI-generated?

## 13. On this document's location

This file lives in a git worktree's `ARCHITECTURE/` folder, not the main checkout's, because the main checkout's `ARCHITECTURE/` directory is untracked by git (never committed to any branch) — the two locations don't automatically reconcile. **This copy should be moved/merged into the canonical `ARCHITECTURE/` folder at the repo root** once reviewed — this only requires a documentation-only copy step, not a code change.
