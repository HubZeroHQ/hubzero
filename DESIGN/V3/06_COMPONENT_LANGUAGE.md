# 06 — Component Language

> Assumes `02`–`05`. This document redesigns every component **conceptually** — what it communicates and why it looks the way it does — not as implementation. It is written against the real vocabulary already in production (`src/components/ui/*`, `src/components/marketing/*`, and the fifteen `ARCHITECTURE/20_CONTENT_BLOCKS.md` block types) so a future engineering pass has a direct mapping from "what exists today" to "what it becomes," rather than a component list invented from nothing.

## 0. The standing question this document resolves

v2 currently runs **two coexisting component languages** (noted as an open tension in `PROJECT_CONTEXT.md` §4 and the research behind this folder): a utility vocabulary (`GlassCard`/`GradientButton`/`SectionGrid`/`TagPill`, for admin/utility surfaces) and an editorial vocabulary (no cards, no gradient buttons, typographic-led — currently scoped to Home/About and, per `ARCHITECTURE/07_DESIGN_SYSTEM.md` §8, extended to Builds/Labs/Blueprints detail pages).

**Working Blueprint's resolution: merge into one language, with two registers, not two vocabularies.** The distinction that matters is not "editorial pages vs. utility pages" (which has already produced confusion about which pages qualify) — it's **evidence-and-narrative surfaces vs. tool-and-workflow surfaces**. A case study, a Labs entry, a Blueprint's live demo, a marketing page — all evidence/narrative, all built from the same drafting-sheet/trace-path component set below. The Studio/CMS admin panel, forms, and generic list/detail utility screens are tool/workflow surfaces, and may reasonably use plainer, denser, more conventional patterns (real tables, real form grids) because their job is operator efficiency, not persuasion — but even there, the same type system, color tokens, and linework geometry apply, so a Studio screen still reads as unmistakably HubZero's, just in its "workshop" register rather than its "showroom" register. There is one visual language with two registers, not two languages.

## 1. Buttons

**Conceptually:** a button is the one place the copper accent is guaranteed to appear, and its entire visual job is to be immediately, unambiguously the thing to click — never decorated beyond that job. No gradient fill (retired along with the multi-hue gradient, `04_COLOR.md` §5), no drop shadow beyond the same restrained elevation scale every other raised surface uses (`04_COLOR.md` §7). Shape: a rectangle with a small, consistent corner radius (not the current fully-rounded "pill" shape) — a pill reads as a consumer-app convention; a small-radius rectangle reads closer to a labeled control on an instrument panel or a real drafting-title-block field, which is more consistent with Working Blueprint's material logic. Primary (copper fill) exists exactly once per page's primary conversion path; every other action is a secondary (outlined or plain-text) button or, more often in narrative content, a plain in-content link — mirroring v2's already-correct instinct (`ARCHITECTURE/15_HOMEPAGE_DESIGN.md` §6) that most in-page actions shouldn't compete with the one real CTA as button-shaped chrome.

## 2. Cards

**Conceptually:** "card," as a generic elevated rounded-rectangle container, is retired as a default pattern for narrative/evidence content — the same conclusion `ARCHITECTURE/15` already reached for the homepage, generalized site-wide. In its place: content is presented as **panels within the drafting-sheet grid** (`02_VISUAL_LANGUAGE.md` §1) — a bounded region defined by grid position and a hairline rule or trace-path connector, not by a floating rounded box with its own shadow and background fill sitting apart from the page's structure. Where a genuinely card-like utility pattern is still the right tool (a filter result in a dense index list, an admin/Studio list row), it survives in the "workshop register" (§0) as a plain, low-ornament row — a hairline divider, not a shadowed floating box — which is also a closer visual match to a real parts-list or bill-of-materials row than a consumer-app card ever was.

## 3. Navigation

**Conceptually:** the current navbar's instinct — plain-text nav items in Geist Mono joined by literal `/` glyphs, deliberately not sticky/blurred/bordered, deliberately not app-nav button chrome — is correct and is kept. Working Blueprint's addition: the nav reads as a **running head**, the way a real drawing sheet's title block runs along one edge — quiet, monospace, informational, never competing with page content for visual weight. The primary CTA remains the one place copper appears in the nav, exactly as today. Mobile nav's full-screen drawer keeps its serif-emphasis treatment for link labels, migrated from Instrument Serif to IBM Plex Serif (`03_TYPOGRAPHY.md` §6) at the same restrained weight.

## 4. Footer

**Conceptually:** the footer is the one place on the site allowed to be genuinely dense and reference-document-like — closer to a drawing sheet's revision/reference block than to a page's editorial voice. Multi-column, real hairline dividers between columns, Geist Mono for the copyright/legal line. No decorative treatment at all — the footer's entire job is being a reliable, boring, complete reference, and boring is correct here in a way it wouldn't be in a hero.

## 5. Section headers

**Conceptually:** a section header is a compact title-block moment (`02_VISUAL_LANGUAGE.md` §1), not a standalone hero-style headline repeated at every section boundary. A caption/eyebrow line in the technical-label register (`03_TYPOGRAPHY.md` §7) — a section number, a pillar name, a date — sits above the actual heading, giving every section the same "what is this, where does it sit" identity a drawing sheet's title block gives a page. This is a generalization of v2's existing mono-caption pattern, made explicit as a standing convention rather than an ad hoc choice per page.

## 6. Links

**Conceptually:** in-content links carry the weight most "buttons" carry on a conventional agency site — an arrow-suffixed or underline-on-hover text link, in copper, is HubZero's default way of saying "go here," reserving actual button chrome for true primary conversions only (§1). This is a direct continuation of v2's already-correct instinct (`ARCHITECTURE/15_HOMEPAGE_DESIGN.md` §6: services/case-study link-outs use "plain in-content links/arrows, not button chrome").

## 7. Tags

**Conceptually:** tags (practice-area filters, technical stack labels, Labs discipline filters) are set in the technical-label register — Geist Mono, small, a thin hairline border rather than a filled pill background — closer to a real component-designator label on a schematic (`R1`, `U3`) than to a social-app hashtag chip. Active/selected state uses the copper accent as a border or underline, not a filled background, keeping the accent's footprint small even when many tags are visible at once (directly serving `04_COLOR.md` §8's "don't increase visual noise" constraint).

## 8. Metrics

**Conceptually:** per `03_TYPOGRAPHY.md` §9 — a metrics block is a small, honest instrument readout: large tabular-numeral value, small muted label beneath stating exactly what was measured. Presented in a simple row or grid with hairline dividers between values (again, no individual card-per-metric — a shared drafting-sheet row, the way a real dimension chain presents several measurements as one connected sequence rather than as separate floating boxes).

## 9. Tables

**Conceptually:** real tables (a spec comparison, a stack breakdown) use hairline row dividers, tabular numerals wherever numbers appear, and left-aligned text columns / right-aligned numeric columns as a firm rule (numbers that don't align in a column read as imprecise, directly undermining the "precise" emotional goal in `01_VISION.md` §2). No zebra-striping, no heavy header-row fill — the same quiet, hairline-governed logic as every other dense surface in this system.

## 10. Quotes

**Conceptually:** the pull quote is IBM Plex Serif's primary, and most tightly budgeted, home (`03_TYPOGRAPHY.md` §3, §6) — at most one per page, set noticeably larger than body copy, with a real attribution (name, role) set in the technical-label register directly beneath it, never floating unattributed. A decorative oversized quotation-mark glyph (present in v2's current `quote` block styling) is dropped — the serif's own scale and the surrounding whitespace budget already signal "this is a quote" without needing an additional decorative glyph competing for attention.

## 11. Callouts

**Conceptually:** a callout (note/info/success/warning) keeps its existing tonal-highlight job but drops any color-block "banner" treatment in favor of a left-edge hairline rule in the relevant semantic color (`04_COLOR.md` §4) plus a small technical-label-register tag naming the callout's type (`NOTE`, `WARNING`) — closer to a real engineering-document margin annotation than to a consumer-app alert banner. This keeps callouts legible and distinct without introducing a filled color block that would compete with the page's disciplined, mostly-neutral surface language.

## 12. Timelines

**Conceptually:** this is trace-path geometry's most direct component application — a timeline's connective line runs in the site's right-angle/45-degree trace convention (`02_VISUAL_LANGUAGE.md` §1) rather than a smooth vertical line with round dots, and each milestone reads as a "node" (a small filled square or diamond, echoing a schematic junction) with its date set in Geist Mono. This makes a timeline visually indistinguishable in _kind_ from a signal-path diagram, which is the intended effect — a project's history and a system's data flow are both, in Working Blueprint's vocabulary, the same kind of drawn object: a sequence of real, dated, connected events.

## 13. Media (images, galleries, video)

**Conceptually:** every media block follows the figure convention (`02_VISUAL_LANGUAGE.md` §5, `05_LAYOUT_SYSTEM.md` §6) — real caption, deliberate width tier, deliberate position. A gallery presents multiple related images as a genuine set (consistent crop ratio, shared caption context) rather than a generic auto-playing carousel, which remains explicitly excluded (`DESIGN/00_AI_DESIGN_GUIDE.md` §3.3, unmodified). Video (a demo walkthrough, a hardware bring-up clip) never autoplays and never loops decoratively — it's evidence to be deliberately watched, not ambient motion.

## 14. Code blocks

**Conceptually:** per `03_TYPOGRAPHY.md` §8 — real code, real filename/context header set in the technical-label register, syntax highlighting drawn from the site's own token palette rather than an imported third-party theme with unrelated colors. A code block should look like it belongs to the same drawing set as every diagram on the page, not like an embedded widget from a different product.

## 15. Architecture diagrams

**Conceptually:** the single most important component in this entire language, and the direct, generalized descendant of the existing Labs/R&D data-flow diagram v2 already built and `DESIGN/00_AI_DESIGN_GUIDE.md` §2 already cites as the reference case. Built from the site's real type and line tokens (never an embedded image from an external diagramming tool), using drafting cyan for the linework (`04_COLOR.md` §4), real box/arrow/queue/schematic convention appropriate to what's being depicted, and the annotation vocabulary from `02_VISUAL_LANGUAGE.md` §10 for call-outs. Every future page that needs to explain a system should reach for this component before reaching for a screenshot of an external tool's diagram or a commissioned illustration.

## 16. Gallery layouts

**Conceptually:** for hardware/CAD/prototype documentation specifically (a build log, a Labs entry's photo set), a gallery is presented as a real contact-sheet-adjacent grid — consistent crop ratio, consistent caption placement, numbered figures — rather than a lightbox-first carousel experience. The existing lightbox interaction (click to enlarge, keyboard navigation) is a reasonable utility layer on top of this, kept as the "workshop register" interaction (§0) beneath the showroom-register visual presentation.

## 17. What this document deliberately leaves to a later phase

Exact spacing values, exact corner-radius values, exact component API/props — all implementation decisions, one level below what a conceptual component-language document should specify, exactly as `ARCHITECTURE/07_DESIGN_SYSTEM.md` §5's original component table specified _purpose and replacement rationale_ rather than final code. `10_IMPLEMENTATION_ROADMAP.md` sequences when a future engineering pass should turn this document into an actual component library.
