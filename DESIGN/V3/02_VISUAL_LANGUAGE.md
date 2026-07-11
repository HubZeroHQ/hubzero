# 02 — Visual Language

> Assumes `01_VISION.md`'s Working Blueprint direction. This document defines the complete visual language — the vocabulary `03`–`08` apply to type, color, layout, components, imagery, and motion respectively.
>
> **Amended.** §12's iconography section is deliberately conceptual and has no bearing on implementation without a concrete icon set — `14_VISUAL_TOKENS.md` §6 specifies the actual minimum icon set, construction rule, and per-icon accessible names this section describes only in principle. §9's diagram conventions gain an authoring-mechanism answer this document never addressed — `15_DIAGRAM_SYSTEM.md` distinguishes CMS-editable editorial diagrams from hand-built engineering diagrams. §5, §9 gain accessibility requirements (legibility with color removed, real text alternatives) in `12_ACCESSIBILITY.md` §2–3.

## 1. Composition

HubZero v3 composition is built from two coexisting logics, each borrowed from a real document type rather than invented:

**Drafting-sheet logic** (from Blueprint) governs macro-structure: every page has an implicit title block (a compact zone carrying the page's identity — what this is, what pillar it belongs to, when it was last true), a dimension-line rhythm governing vertical spacing (spacing steps that relate to each other the way a drawing's dimension chain does — cumulative, legible, never arbitrary), and occasional "section cuts" — a deliberate visual signal that the page is about to go one layer deeper into technical detail (a cross-hatched or grid-textured band preceding a diagram, a metrics block, or a stack breakdown).

**Trace-path logic** (from Signal & Copper) governs micro-structure: how individual elements relate to their neighbors. Connective lines — between a step and the next step, between a metric and its label, between a contributor avatar and their credited work — run in right angles and 45-degree diagonals, never smooth Bézier curves. This is not a decorative rule; it's a legibility rule borrowed from real schematic and PCB routing conventions, where a right-angle or 45-degree trace is easier to trace visually than a curve, and it doubles as the site's only "signature line quality" — if a reader has seen enough HubZero pages to recognize one visual tic on sight, this is the intended one.

Both logics coexist without conflict because they operate at different scales: drafting-sheet logic answers "how is this page organized," trace-path logic answers "how do two adjacent elements relate."

## 2. Asymmetry

Asymmetry is retained from v2 (`ARCHITECTURE/07_DESIGN_SYSTEM.md` §3, `15_HOMEPAGE_DESIGN.md` throughout) because it remains correct, not because it's already built. The reasoning is unchanged: unequal panels communicate that two things are genuinely different in kind, not just differently labeled — a matched grid says "these are interchangeable," an unequal split says "these are not."

Working Blueprint gives asymmetry a firmer justification than "it looks more editorial": a real drafting sheet or a real populated PCB is _never_ symmetric — component density, drawing detail, and empty substrate vary by what's actually there, not by a designer's instinct for balance. A HubZero page's asymmetry should always be traceable to a real reason (this beat has more to prove, this panel represents a denser practice area, this diagram genuinely has three call-outs and the neighboring one has one) — asymmetry used because it looks more sophisticated than a grid, with no underlying reason, is exactly the same failure as `DESIGN/00_AI_DESIGN_GUIDE.md`'s existing warning against decoration masking thin content.

**Rule of thumb:** before making two elements unequal in size or position, name the real-world reason they're unequal. If no reason exists beyond "asymmetry reads as more considered," the elements should be equal.

## 3. Rhythm

Rhythm is the product of three things working together, never one alone: type scale, spacing, and beat height proportional to narrative weight (inherited directly from `ARCHITECTURE/15_HOMEPAGE_DESIGN.md` §5's already-correct principle, generalized past the homepage to every page in `09_PAGE_ARCHETYPES.md`).

Working Blueprint adds a specific mechanism for _how_ that proportionality should read: the dimension-line model. On a real engineering drawing, a dimension chain accumulates — each segment's length is legible both on its own and as part of a running total. HubZero's vertical rhythm should work the same way: a page's spacing steps are drawn from one governing scale (see `05_LAYOUT_SYSTEM.md` §2), and a reader's sense of "how far into this page am I, and how much more important is what's coming" should be legible from spacing alone, the way an engineer reads a dimensioned drawing without needing every measurement individually labeled.

**Practical rhythm rule:** a beat that matters more gets more vertical room before and after it, drawn from the same spacing scale as everything else — never a one-off custom value invented for that one beat. Uniform padding on every section regardless of content weight is the specific failure this rule exists to prevent, exactly as `ARCHITECTURE/15` §5 already found.

## 4. Whitespace

Two distinct kinds of whitespace exist, and Working Blueprint keeps the v2 distinction (`DESIGN/00_AI_DESIGN_GUIDE.md` §4) intact because it's correct, while tightening its enforcement given the specific failure `docs/design-reviews/MARKETING_SITE_REVIEW_V1.md` §4 found in production:

- **Rhythm whitespace** — the steady, unremarkable spacing between ordinary beats. Should feel like the "unpopulated substrate" on a PCB or the margin of a drafting sheet: present, considered, but not calling attention to itself.
- **Emphasis whitespace** — a deliberately larger pause that signals "what comes next matters more than what came before." This is only powerful because it's rare.

**The v2 failure, restated as a hard budget for v3:** the review found the "unexpected whitespace pause before a full-bleed image" technique used five or six times across one seven-page journey, which drained it of meaning. v3's explicit budget: **at most two emphasis-whitespace moments per page, and at most one shared across any two adjacent pages in the same pillar family.** If a third moment seems to want emphasis whitespace, that's a signal the page has too many "big moments" claimed at once — tighten the weaker one to rhythm whitespace rather than let both compete.

## 5. Engineering artifacts

This is the section that most concretely operationalizes `01_VISION.md` §7's "editorial engineering" idea. An engineering artifact, for HubZero's purposes, is anything that would exist whether or not it was ever put on a website — a real schematic, a real photograph of a real board, a real terminal session, a real CAD export, a real dimensioned drawing. The visual language treats these as content, not decoration, which has concrete consequences:

- **Artifacts are captioned like figures**, not floated like hero art — a real caption, and where it earns its place, a figure reference (borrowed narrowly from Editorial Systems per `00_EXPLORATION.md` §8), so a diagram reads as "figure 2, referenced in the paragraph above" rather than as ambient decoration.
- **Artifacts are never re-skinned to match the brand palette.** A real oscilloscope capture keeps its actual phosphor color; a real PCB render keeps its actual solder-mask color; a real schematic uses real schematic-symbol convention. HubZero's brand colors (copper, drafting cyan) apply to the site's own linework and UI — never retroactively applied to a real artifact to make it "match," which would make the artifact look faked.
- **An artifact's imperfection is evidence, not a flaw to fix.** A slightly uneven solder joint in a macro photograph, a whiteboard photo with a visible glare — these are signals of reality (`DESIGN/00_AI_DESIGN_GUIDE.md`'s zero-fabrication principle extended to image treatment) and should not be retouched into a falsely pristine version.

## 6. Imagery philosophy

Imagery exists on a spectrum from "real artifact" to "site-native diagram," and every image on a HubZero page should sit clearly on one end or the other — never in the uncanny middle of a stock-photo-adjacent illustration standing in for something real.

- **Real-artifact end:** product screenshots, PCB macro photography, CAD renders of actual enclosures, terminal/code captures, real team and workspace photography.
- **Site-native-diagram end:** schematics, system architecture diagrams, and data-flow diagrams built in HubZero's own linework language (drafting cyan on drafting paper, or trace-path copper on solder-mask dark), because these are diagrams HubZero is authoring itself, not artifacts found in the wild.

Nothing should be commissioned or generated to sit between those two poles — no "abstract tech illustration," no stock photography standing in for a real photograph HubZero hasn't taken yet, no AI-generated "concept art" of a product that doesn't exist. Full detail, including a placement map by pillar, lives in `07_IMAGERY.md`.

## 7. Photography direction

Photography (team, workspace, hardware) follows Apple's consistency lesson and Teenage Engineering's art-direction rigor, both named in `00_EXPLORATION.md` §9, adapted rather than imitated: **one lighting approach, one background treatment, one crop ratio, applied identically to every instance of a given category** — every team photo shot the same way, every hardware macro shot under the same lighting logic. This directly targets the specific, named failure in `docs/design-reviews/MARKETING_SITE_REVIEW_V1.md` §6 (inconsistent founder photos undermining the About page's entire purpose) and generalizes the fix into a standing rule rather than a one-time correction: **a photography category is either fully consistent across every instance, or it doesn't ship yet.** A single well-lit, correctly-cropped photo is a placeholder worth waiting for; four inconsistent ones are a liability worse than an honest gap.

Color grading, where used at all, should be minimal and should never shift a hardware photo's actual solder-mask or component colors toward the brand's copper accent — see §5's artifact-integrity rule.

## 8. Illustration direction

HubZero does not commission illustration to stand in for content it hasn't built yet, unchanged from `DESIGN/00_AI_DESIGN_GUIDE.md` §4. Working Blueprint extends this into a positive rule rather than only a prohibition: where a diagram is warranted and no real artifact exists to photograph, the diagram is drawn in HubZero's own site-native linework language (§6), using real, correct technical convention for whatever it depicts — real schematic symbols for a circuit, real box-and-arrow architecture convention for a system, real Gantt/timeline convention for a schedule. "Illustration," in HubZero's vocabulary, means _a real diagram drawn well_ — never a metaphor-illustration (a rocket for "growth," a puzzle piece for "integration") standing in for a claim with no real referent.

## 9. Diagrams

Diagrams are the single most important visual device in this identity, because they are the concrete proof that "editorial engineering" (§1's philosophy) is real rather than aspirational. Every diagram must:

- **Depict something that actually exists or actually happened** — a real system architecture, a real data flow, a real board layout, a real process HubZero actually follows (not an idealized version invented for the page).
- **Use real, correct convention for its domain** — a circuit diagram uses real schematic symbols; a data-flow diagram uses real box/arrow/queue convention; a process diagram uses real swimlane or sequence convention where warranted. A diagram that invents its own cute iconography instead of using the real convention of its field reads as decoration, not evidence.
- **Carry the drafting-cyan or copper-trace treatment consistently** — cyan for the "this is a technical drawing" register (schematics, architecture diagrams, CAD-adjacent views), copper for the "this is a live signal/interactive relationship" register (a data flow between systems, a connective line in a component list). See `04_COLOR.md` §4 for the full semantic split.
- **Be legible at the type system's own scale**, exactly as the existing Labs/R&D data-flow diagram already achieves (per `DESIGN/00_AI_DESIGN_GUIDE.md` §2's own citation of it as the reference case) — built from the site's real type and line-weight tokens, not an embedded image from an external diagramming tool with its own competing visual language.

## 10. Annotations

Annotation is the drafting-sheet vocabulary's other major contribution: dimension lines, leader lines, small numbered call-outs, and revision-stamp-style metadata (a quiet "rev." or "as of" marker) are all legitimate, real conventions for adding a second layer of information to a diagram or image without cluttering the primary content. Annotation should:

- **Always point at something specific** — a leader line with no clear target, used purely for texture, fails immediately.
- **Use the technical-label typographic register** (Geist Mono, small size — see `03_TYPOGRAPHY.md` §7), so an annotation is legible at a glance as metadata rather than competing with body copy.
- **Be genuinely optional to the primary read** — a reader who ignores every annotation should still understand the diagram; annotations add precision for a reader who wants it, they don't gate comprehension for a reader who doesn't.

## 11. Blueprint language

"Blueprint language," as a specific named vocabulary distinct from the direction it's borrowed from, means: title blocks, dimension chains, revision stamps, section-cut cross-hatching, and the drafting cyan reserved exclusively for this vocabulary (never for UI). It is used:

- **At the top of any page or section that benefits from a compact "what is this, what state is it in" identity block** — a Labs entry's stage/date, a Blueprint's version and demo status, a case study's client/timeline facts.
- **As the visual signal that a page is about to present a real technical diagram**, via the section-cut texture described in §1.
- **Never as ambient background texture with no informational job** — a dot-grid or hairline-grid pattern used purely because a section "felt empty" is exactly the decorative-complexity failure `DESIGN/00_AI_DESIGN_GUIDE.md` §3.2 already excludes, and Working Blueprint inherits that exclusion without softening it.

## 12. Iconography

HubZero v3 does not use a conventional icon library (line-icon sets, filled-icon sets, or any third-party icon font) as a default UI layer. Where a small graphic signal is genuinely needed (a status indicator, a filter control, a form affordance), it should be drawn in the same trace-path/right-angle-and-45-degree geometry as the rest of the linework system — a consistent, custom, minimal icon vocabulary rather than a borrowed set with its own unrelated visual DNA. This is a meaningful departure from most component libraries' default (import a generic icon set) and a direct consequence of the Recognition Test (`01_VISION.md` §8): a generic icon set is, definitionally, an icon set that could belong to anyone.

Where an icon would only ever restate a label with no added clarity (the specific "decorative icon without meaning" failure already named in `DESIGN/00_AI_DESIGN_GUIDE.md` §3.3), the correct answer is no icon at all — text and spacing carry the hierarchy instead.

## 13. Visual hierarchy

Hierarchy is established, in order of priority, by: **type scale and weight** (see `03_TYPOGRAPHY.md`), **position within the drafting-sheet structure** (§1 — a title-block position reads as metadata, a full-width position reads as the page's primary claim), **spacing** (§3–4), and only last, and rarely, **color** (the single copper accent, reserved for the one thing on a page that should draw the eye first: the primary action).

This ordering is deliberate and should be checked whenever a hierarchy question arises: if the answer to "what should stand out here" is being solved by reaching for color before type/position/spacing have been tried, that's a signal the underlying composition is under-resourced, not that color is the right tool. This is the same test `DESIGN/00_AI_DESIGN_GUIDE.md` §2 already applies ("typography before decoration"), restated as an explicit priority order rather than a general instinct, so a future designer or AI system has a concrete sequence to follow rather than a value to intuit.
