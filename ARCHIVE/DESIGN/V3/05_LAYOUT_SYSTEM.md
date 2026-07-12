> **⚠️ ARCHIVED — historical reference only, not implementation guidance.** This document described the public marketing website under the design direction that was reset. It is preserved for historical context. Do not use it to guide the new design (see `DESIGN/NEXT`). See `ARCHIVE/README.md`.

# 05 — Layout System

> Assumes `02`–`04`. This document defines the layout language — the spatial rules `06`–`09` apply to real components and pages.
>
> **Amended.** §2's spacing scale and grid are stated as ranges with no starting value, step count, or column count — the highest-probability source of real implementation divergence `CRITIQUE_01_REVIEW_BOARD.md` Part 7 found in this folder. `14_VISUAL_TOKENS.md` §1–2 commits to the actual base unit, nine-step scale, and 12-column grid this document's ranges describe only in principle.

## 1. Page widths

Three content-width tiers, evolving v2's two (`--content-marketing` at 1200px, `--content-prose` at 740px) into three, because Working Blueprint's drafting-sheet/trace-path composition (`02_VISUAL_LANGUAGE.md` §1) genuinely needs a wider tier for diagram- and evidence-led moments that the current two tiers don't serve well:

| Tier                 | Approx. width                               | Job                                                                                                                                                                                                                                                    |
| -------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Prose**            | ~720–760px                                  | Long-form reading — Notes body copy, case-study narrative paragraphs. Unchanged from v2's existing value; already correctly calibrated for the measure specified in `03_TYPOGRAPHY.md` §11.                                                            |
| **Marketing**        | ~1150–1250px                                | The default content column for most page content — headings, standard body copy, panels, forms. Unchanged from v2's existing value.                                                                                                                    |
| **Drafting** _(new)_ | ~1400–1600px, or full-bleed within a gutter | Diagrams, dimension-line technical layouts, large-scale hardware/product imagery, and any drafting-sheet-composed moment (§4) that needs more room than the marketing tier to let a real diagram or trace-path arrangement breathe at a legible scale. |

The Drafting tier is not a license for arbitrary full-width sprawl — it exists specifically for content that has a real reason to need more horizontal room than prose or standard marketing copy (a wide diagram, a side-by-side technical comparison, a large product render), and its use should be checked the same way `02_VISUAL_LANGUAGE.md` §2 checks asymmetry: name the real reason it needs the extra width, or use the Marketing tier instead.

## 2. Grids and the spacing scale

A single governing spacing scale underlies both grid gutters and vertical rhythm (`02_VISUAL_LANGUAGE.md` §3), so that a page's horizontal and vertical spacing are always relatable to each other — the "dimension chain" idea applied literally. The scale is a modest geometric/near-Fibonacci progression (each step roughly 1.5–1.6× the previous), which gives enough steps to express real hierarchy without the arbitrary one-off values that make a page feel un-engineered.

**Grid columns** follow trace-path logic (`02` §1): a page's column structure is treated like a board's routing channels — content occupies definite, intentional column spans (e.g., an 8/4 or 7/5 asymmetric split, never an arbitrary in-between value), and gutters are wide enough to read as genuine "unpopulated substrate" rather than a cramped seam between two panels.

**Section vertical padding** keeps v2's 96–128px desktop floor (`ARCHITECTURE/07_DESIGN_SYSTEM.md` §3) as a floor, not a target — Working Blueprint's beat-weight-proportional rhythm (`02_VISUAL_LANGUAGE.md` §3) means the tallest beats on a page (a Featured Case Study, a Blueprint's live-demo hero) should comfortably exceed that floor, while compact beats (a credibility strip, a step list) may sit at or near it.

## 3. Section spacing as a dimension chain

Practically, this means: pick the page's tallest, most important beat first (the "primary dimension" in drafting terms), and size every other beat's spacing as a deliberate fraction or multiple of it — not as an independent decision made section by section. A page where every section shares identical padding regardless of content weight has, in effect, no dimension chain at all — it has one repeated measurement, which is the exact "uniform padding" failure `ARCHITECTURE/15_HOMEPAGE_DESIGN.md` §5 already named and rejected for the homepage, generalized here to every page.

## 4. Editorial spreads

An "editorial spread" — two or more related pieces of content (a narrative block and its supporting image, a claim and its evidence) presented as one composed unit rather than as sequential, independent sections — is Working Blueprint's primary compositional unit for narrative content (case studies, About, Notes). Two conventions govern how a spread is built:

- **Drafting-sheet spreads** pair prose with a diagram or dimensioned technical view — text occupies the narrower column, the diagram commands the wider one (or the full Drafting tier width, per §1), with the section-cut cross-hatching (`02_VISUAL_LANGUAGE.md` §1) marking the hinge between them.
- **Evidence spreads** pair a claim with a real photograph or screenshot — the asymmetric panel logic already validated in v2's `WhatWeDo` and case-study components, retained because it's structurally correct, re-skinned in Working Blueprint's material palette rather than replaced.

## 5. Split layouts

Two-panel splits (Software/Hardware, a comparison, a before/after) should always be genuinely unequal (`02_VISUAL_LANGUAGE.md` §2) and should carry a visible reason for their inequality — differing content density, differing texture (a drafting-cyan schematic panel beside a copper trace-path panel, for instance, when the split is genuinely contrasting two technical registers). A symmetric 50/50 split is permitted only where the content is genuinely, deliberately symmetric (the CTA-close beat's bookend-the-hero moment, inherited unchanged from `ARCHITECTURE/15_HOMEPAGE_DESIGN.md` §3's "one symmetric moment on the page" logic) — symmetry-as-default is the failure being avoided; symmetry-as-a-rare-deliberate-resolution is not.

## 6. Image layouts

Images follow the figure convention established in `02_VISUAL_LANGUAGE.md` §5: a real caption, a deliberate width (content-column width for a supporting image, Drafting-tier or full-bleed width for a hero/evidence image), and a deliberate position relative to the surrounding text (never simply "centered because that's the image component's default"). Full-bleed image treatment — no visible container edge — is reserved for the page's genuine climax moment(s) (§7), consistent with v2's already-correct instinct that a full-bleed case-study image should be rare and earned, not a routine way to present every image on a page.

## 7. Storytelling layouts

A "storytelling layout" is any page built as a narrative arc rather than a stack of independent sections — the already-validated model from `ARCHITECTURE/15_HOMEPAGE_DESIGN.md` §2–3, generalized in `01_VISION.md` §4 as a permanent, never-changing principle. Working Blueprint's specific contribution is the transition mechanism between beats: rather than v2's "no hard boundary, one continuous device tapering" abstraction, Working Blueprint gives transitions a concrete visual grammar — a trace-path line running from one beat into the next (literally connecting two sections the way a signal trace connects two components), or a section-cut cross-hatch band marking a genuine depth change (moving from claim to technical proof). Every storytelling page in `09_PAGE_ARCHETYPES.md` specifies which transition device it uses and why.

## 8. Full-width moments

Full-width (edge-to-edge, ignoring the content-column constraint entirely) is reserved for a small, deliberate set of uses:

- A genuine climax image or diagram (§6), budgeted the same way emphasis whitespace is budgeted (`02_VISUAL_LANGUAGE.md` §4) — at most one or two per page.
- A Drafting-tier diagram that has a real reason to need the room (§1).
- Never used as a default section-background treatment, a decorative texture band, or a stat-strip banner — all three are agency-page conventions this identity is built to avoid.

## 9. Dense vs. quiet sections

Density should always track real information weight, and Working Blueprint gives this a concrete material metaphor to check against: a populated PCB region is dense because there's real component work happening there; unpopulated substrate is quiet because there's genuinely nothing there yet. Applied to a page:

- **Dense sections** (a metrics block, a technical spec table, a dimensioned diagram, a stack breakdown) may legitimately pack information tightly — density here reads as precision, not clutter, provided every element in it is real and load-bearing.
- **Quiet sections** (a transition, a single-sentence claim, a credibility strip) should be genuinely spare — no texture, no diagram, no annotation competing with the one thing being said.
- **A section should never be artificially densified to avoid looking "empty."** This is the direct layout-level restatement of `02_VISUAL_LANGUAGE.md` §4 and §11's shared instinct: an empty-feeling section needs either more real content or a deliberate embrace of quiet, never decorative filler pretending to be information.

`09_PAGE_ARCHETYPES.md` marks, for every page, which of its beats are dense and which are quiet, and checks that the pattern of dense/quiet beats is itself distinct from every sibling page's pattern — a direct, layout-level application of the Recognition Test (`01_VISION.md` §8) and the standing Uniqueness Test both.
