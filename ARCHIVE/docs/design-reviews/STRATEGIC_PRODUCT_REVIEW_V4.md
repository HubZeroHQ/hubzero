> **⚠️ ARCHIVED — historical reference only, not implementation guidance.** This document described the public marketing website under the design direction that was reset. It is preserved for historical context. Do not use it to guide the new design (see `DESIGN/NEXT`). See `ARCHIVE/README.md`.

# HubZero Marketing Website — Strategic Product Design Review

> **Status: Review, not a constitution — 2026-07-12.** Commissioned before the Homepage Architecture milestone, per direct instruction to reassess direction rather than continue implementation. This document does not modify `.hubzero`, `DESIGN/V3`, or `ARCHITECTURE/00`–`20`. It reads all of them, plus `docs/design-reviews/MARKETING_SITE_REVIEW_V1.md`, the current token implementation (`src/app/globals.css`, `src/components/brand/logo.tsx`, `src/config/brand.ts`), the real brand assets (`assets/hubzero-logo-black.png`, `assets/hubzero-logo-white.png`, `assets/hubzero-app-icon.png`), and the real team photography (`public/team/*`), and recommends what should change before Homepage Architecture resumes. Where it disagrees with `DESIGN/V3`, it says so and names the specific reason — usually a new fact `DESIGN/V3` could not have had, not a change of taste.
>
> **The one fact that reframes everything below:** the company has now delivered a canonical logomark, and it is pure flat black/white — no blue, no gradient, no gloss. `DESIGN/V3/11_COLOR_PHILOSOPHY_AMENDMENT.md`, the single most-argued document in the entire eleven-document set, spent its full reasoning re-deriving a seven-stop **blue** palette specifically because "the existing mark's blue is not an accident to be corrected out from under it — it is the single most recognizable thing HubZero already owns." That premise no longer holds. This isn't a taste reversal of `DESIGN/V3`'s color work; it's new, load-bearing fact overriding an inference `DESIGN/V3` made in good faith from an asset that has since changed.

---

## 0. How to read this document

Six parts, matching what was asked for:

1. [Product design review](#1-product-design-review) — holistic evaluation against `.hubzero`'s standards.
2. [Critique of the current implementation](#2-critique-of-the-current-implementation)
3. [Critique of `DESIGN/V3`](#3-critique-of-designv3-and-where-hubzero-core-changes-it)
4. [Revised long-term creative direction](#4-revised-long-term-creative-direction)
5. [Phased implementation roadmap](#5-phased-implementation-roadmap)
6. [Claude Code implementation prompt](#6-claude-code-implementation-prompt)

If you read only one section before deciding anything: §4.2 (the accent-color decision) and §5's Phase −1. Everything else follows from those two.

---

## 1. Product design review

### 1.1 What HubZero Core actually asks for, restated plainly

`.hubzero` is short, and it is not shy about what it thinks the point is. Distilled to the sentences that should govern every decision below:

- **"The only characteristic every HubZero product should consistently share is elegance"** (`.hubzero/README.md`). Not a palette. Not a metaphor. Not drafting-sheet vocabulary specifically. Elegance.
- **"Elegance is the outcome of thoughtful engineering, excellent user experience, deliberate visual decisions, and careful attention to detail working together"** (`design/principles.md`). It is earned by finishing things completely, not by having an elaborate system on paper.
- **"Perceived Quality Is an Engineering Responsibility"** (`principles.md`) — motion, spacing, loading states, and consistency are not decoration layered on top of working software; they're part of what "working" means.
- **"A product may include one deliberate, memorable interaction... Restraint is what makes it work. One well-executed signature moment is memorable. Five competing ones cancel each other out"** (`design/principles.md`).
- **"Not every element deserves animation... Prioritize... Everywhere else, default to restraint"** (`design/motion.md`, Progressive Delight).
- **"A user who only ever experiences a HubZero product on their phone should have no sense that it was designed for a larger screen first"** (`design/mobile-experience.md`).
- **"When a new visual motif is introduced... review the entire interface, not just the surface where it appeared"** (`design/principles.md`, Design Systems Evolve as Systems) — this is the specific principle that makes the color-swap below non-negotiable rather than optional: you cannot change the brand mark's color family and leave the interface's color family alone.

Held against this, the honest verdict on where things stand: **the documentation discipline is exceptional and the underlying engineering is sound; the site does not yet feel finished, and the visual-system ambition currently on paper exceeds what a four-to-five person, pre-revenue team can sustain without repeating the exact failure already caught once.**

### 1.2 Holistic evaluation

**Visual identity.** Currently mid-migration: tokens (`globals.css`) already carry the `DESIGN/V3` amendment's seven-stop blue palette; the actual delivered brand mark is monochrome. These two facts are in direct, unresolved conflict inside the live codebase right now — not a future risk, a present one. See §2.1.

**Navigation.** `.hubzero/design/navigation.md` explicitly validates what `DESIGN/V3` already wanted here: "a marketing product's navigation often earns visual investment, since establishing confidence in the first few seconds is close to the entire job." No contradiction to resolve — this is one of the places Core and V3 already agree, worth stating so it doesn't get re-litigated by accident.

**Rhythm, typography, hierarchy, whitespace.** `DESIGN/V3`'s token work here (`14_VISUAL_TOKENS.md`'s spacing scale, grid, corner radii, stroke weights) is genuinely good — concrete, derivable, and almost entirely color-independent. This is real, keepable engineering regardless of what happens to the palette.

**Storytelling.** The editorial, narrative-arc page model is the single thing both design reviews (V1 and the V3 critique board) independently praised hardest, and it's the thing most at risk of being under-resourced by an eleven-document system that asks for _more_ bespoke composition on _more_ pages than the team already once failed to sustain (`CRITIQUE_01_REVIEW_BOARD.md` Part 9, finding 1 — never resolved).

**Motion.** Ambitious past the point of being finishable by this team as specified. Three animation libraries for a five-person, unregistered studio is a real, named risk the critique board itself called "the panel's strongest technical objection" and it was never resolved in `DESIGN/V3` — only inherited into `10_IMPLEMENTATION_ROADMAP.md` unexamined.

**Imagery.** The imagery _taxonomy_ (`07_IMAGERY.md`) is excellent thinking. The imagery _reality_ is that the company has real assets for roughly two of thirteen named categories today, and the one category it does have real assets for — team photography — currently fails the standard `02_VISUAL_LANGUAGE.md` §7 itself sets, visibly, in the actual files in `public/team/`. See §2.3.

**Engineering credibility, perceived quality, memorability.** The single strongest asset on the entire site remains what both prior reviews already found: the Bhatkal Time Luxe case study's specificity, and the Labs/R&D diagram's honesty. Nothing in this review changes that finding. Protect it; do not let a color migration or a motion-library debate consume the next quarter at the expense of a second real case study, which both reviews rank as higher-leverage than any visual-system work.

### 1.3 The one dimension `.hubzero` adds that `DESIGN/V3` under-weighted: capacity as a design constraint

`.hubzero/principles.md` — "Simplicity Requires Justification for Complexity: every abstraction, dependency, and architectural layer must earn its place. Do not build for hypothetical future requirements." `DESIGN/V3`'s own critique board flagged, and ranked fourth of six blocking items, that the system "prescribes more bespoke design labor than the team that produced the original failure had capacity for" — and that finding was never actually resolved, only named. Nothing has changed about team size since. This review treats that as a live constraint on every recommendation below, not a footnote.

---

## 2. Critique of the current implementation

### 2.1 The brand mark and the token system actively contradict each other right now

This is not a five-year risk. It is true today, in the repository, on the branch this review was commissioned to reassess before continuing:

- `src/app/globals.css` implements `DESIGN/V3/11_COLOR_PHILOSOPHY_AMENDMENT.md`'s seven-stop **Brand Blue** palette verbatim (`--color-accent: #0174d5`, `--brand-gradient: linear-gradient(90deg, #0174d5, #1495ed, #62cefb)`, Ice Blue, Pale Cyan, Neutral Silver — all present, all wired).
- `src/config/brand.ts`'s `icon` (the asset actually rendered in the navbar and footer via `Logo`) points at `/brand/icon.png` — the old **expressive, glossy, dimensional** render, not either of the new canonical flat assets in `assets/`.
- `src/components/brand/logo.tsx` sets the wordmark's "Zero" in `text-accent-text font-serif` — i.e., in Brand Blue.
- The real, delivered canonical mark (`assets/hubzero-logo-black.png`, `assets/hubzero-logo-white.png`) is **pure black or pure white, zero chroma, no gloss, no gradient.**

Today, a visitor sees a token system, a `site.webmanifest` `theme_color`, a wordmark, and (per `brand.ts`'s own code comment) a `favicon`/`apple-touch-icon`/`android-chrome-*` set all built around a blue mark that is no longer the company's mark. This is precisely the failure `CRITIQUE_01_REVIEW_BOARD.md` predicted for the _previous_ color transition ("a future team implementing this blueprint would ship a copper-and-graphite identity with a glossy blue 3D logo sitting in the navbar... the single most likely real, embarrassing outcome") — it did not happen with copper, because copper never shipped. It is happening now, with blue, because blue did ship. Fixing this is not part of a future visual-system phase; it is a correctness bug in the current build and belongs in Phase −1 (§5).

### 2.2 The Services/Software/Hardware fix: verify, don't assume

`MARKETING_SITE_REVIEW_V1.md` (2026-07-04) found Services/Software/Hardware "three fills of one template" and ranked fixing it the single highest-leverage item available. `DESIGN/V3/10_IMPLEMENTATION_ROADMAP.md` scoped this as "Phase 0 — do regardless of everything else." Component names now present in `src/components/marketing/` (`section-cut.tsx`, `entry-row.tsx`, `schematic-diagram.tsx`, `filter-chip.tsx`) suggest work happened since that review. This document does not have a page-by-page re-read of Services/Software/Hardware's current shipped composition, and it should not be assumed fixed just because the component vocabulary evolved — confirm directly (re-run the Uniqueness Test on the three live pages) before treating this as closed. If it's genuinely fixed, good — one fewer item for Phase −1. If not, it is still the single highest trust-per-effort fix available, ahead of any new visual-system work.

### 2.3 Team photography is a live Product Polish failure, not a historical finding

`public/team/*.jpg` was read directly for this review. The five photos are not a minor inconsistency — they are five different photographic registers entirely: a professionally lit corporate portrait against a city-skyline office backdrop; an outdoor snapshot against motorbikes and trees; what reads as a school portrait (blazer and tie, hedge backdrop) rather than a professional headshot; a waistcoat portrait against an office whiteboard; a casual seated photo at a home dining table with wall-mounted planters visible behind. `.hubzero/polish/PRODUCT_POLISH.md`'s guiding question is direct: _"Would someone experiencing this product for the first time, with zero context, conclude that HubZero cares about details — or that this is unfinished work?"_ On the current About/Team photography, the honest answer is the second one. `.hubzero/design/principles.md`'s consistency standard and `DESIGN/V3/02_VISUAL_LANGUAGE.md` §7's "a photography category is either fully consistent across every instance, or it doesn't ship yet" both say the same thing independently. This was already flagged as the #1 trust-priority fix in the 2026-07-04 review, over a week before this one — it is still unresolved, and it is the single highest-leverage action available before any redesign work begins. See Phase −1.

### 2.4 What the current implementation gets right and should not be disturbed

- Real component reuse discipline (`Container`, `Reveal`, shared CTA-close pattern) — genuinely good engineering, not duplicated-and-drifted.
- The hero's `useEffect` reveal-trigger and `strokeDasharray`/`strokeDashoffset` workarounds are documented, deliberate responses to a real framework bug, not sloppiness — do not "clean up" these without understanding why they exist.
- Zero-fabrication content discipline (no invented stats, no placeholder testimonials) — both prior reviews confirm this holds in practice, not just on paper. It is the single strongest trust mechanism on the site and nothing in this review touches it.
- The Bhatkal Time Luxe case study and the Labs/R&D diagram remain the two strongest editorial moments on the site. Protect both; do not dilute either while a color migration is underway.

---

## 3. Critique of `DESIGN/V3`, and where HubZero Core changes it

### 3.1 What `DESIGN/V3` got right, kept in full

- **The documentation and self-critique culture itself.** `CRITIQUE_01_REVIEW_BOARD.md` is unusual and valuable — a team that commissions an adversarial review of its own five-year plan and publishes the unflattering findings is doing something most organizations don't. Keep this practice; this document is a continuation of it, not a replacement.
- **Real-artifact imagery discipline** (`07_IMAGERY.md`) — no stock photography, no AI "concept" renders, no illustrated metaphors standing in for real evidence. This is directly load-bearing for `.hubzero/design/principles.md`'s "every design must earn trust" and should survive any color or motion change untouched.
- **The drafting-sheet / trace-path geometric vocabulary as a motif** — right-angle and 45-degree connective geometry, title-block composition, dimension-line rhythm. This system was never actually dependent on a specific hue; it's line quality and composition logic, and it survives a monochrome pivot completely intact. See §4.1.
- **Page-archetype thinking and the Uniqueness/Recognition/sibling-differentiation tests** (`09_PAGE_ARCHETYPES.md`) — the right mechanism for the right problem, provided it's resourced honestly (§3.3 below).
- **The visual token work** (`14_VISUAL_TOKENS.md`'s spacing scale, grid, radii, strokes) and the **accessibility document** (`12_ACCESSIBILITY.md`) — concrete, implementable, almost entirely color-independent, genuinely good bones.
- **The diagram-authoring tiering** (`15_DIAGRAM_SYSTEM.md`, CMS-editable vs. hand-built) — sound engineering judgment about where complexity belongs.

### 3.2 What DESIGN/V3 got wrong, and why — beyond the color premise already stated above

- **It conflated "our current stylistic choice" with "permanent principle."** `01_VISION.md` §4 lists "editorial narrative over agency-block composition" as something that "should never change," in the same breath as zero-fabrication — an ethics commitment. `.hubzero/design/principles.md` is more honest about this exact distinction: elegance is the only permanent constant; _how_ a given product expresses it is expected to evolve. `CRITIQUE_01_REVIEW_BOARD.md` caught this precisely and it was never corrected in the eleven amended documents. Recommendation: keep editorial-over-agency as this era's strong default (it's a good choice, well-argued, validated by both design reviews) — but stop asserting it as unchangeable dogma. Say so explicitly in whatever document succeeds `01_VISION.md`.
- **The motion system solves a problem the team's size doesn't have.** Three libraries (GSAP, Motion, Anime.js) for a four-to-five person team is over-scoped by the critique board's own admission ("the panel's strongest technical objection... never makes the case Anime.js does something the other two genuinely can't"). Motion (motion.dev) already covers SVG line-drawing and spring-based counters — Anime.js's entire assigned job. `.hubzero/principles.md`'s "Evaluate Dependencies, Don't Default Against Them" cuts both ways: it means don't avoid a good library out of dependency-phobia, but it equally means don't carry a third one that duplicates a second one's job without a demonstrated reason. Consolidate to two.
- **Signature Moments (five, named) is good instinct, unrealistic as a day-one requirement.** `.hubzero/design/motion.md`'s Progressive Delight explicitly asks for prioritization and restraint elsewhere — five fully-specified signature moments across a homepage, a diagram reference case, a sitewide transition device, a form, and a Blueprints entrance is not "restraint elsewhere," it's five simultaneous asks from a team that has not yet shipped the first one at production quality. Tier them (§4.3).
- **Capacity was named as a blocking finding and never actually resolved.** `CRITIQUE_01_REVIEW_BOARD.md`'s Part 9 ranked item 4 ("address design capacity, not just design discipline") remains, in the amended documents (`11`–`17`), simply un-addressed. This review treats that as still open and answers it directly in §5.
- **No primary research exists anywhere in the set** — still true, still worth doing (one real prospect conversation, one real client debrief) before the next major visual-identity investment, exactly as the critique board asked. Not blocking, but overdue.

### 3.3 Where `.hubzero` (HubZero Core) changes `DESIGN/V3`'s conclusions directly

The brief asked for this explicitly, so it's stated as a direct table rather than buried in prose:

| `DESIGN/V3` position                                                                                                | `.hubzero` principle it's checked against                                                                                                                                                                    | Resolution                                                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Seven-stop Brand Blue palette, derived from "the mark's real equity"                                                | `.hubzero/design/principles.md` — "Design Systems Evolve as Systems": a new visual motif (the delivered monochrome mark) requires reviewing the _entire_ interface, not leaving the token system untouched   | **V3 loses.** Not a taste call — the mark that grounded the derivation no longer has the color the derivation assumed. See §4.2.                                                                             |
| Three motion libraries, five signature moments as baseline scope                                                    | `.hubzero/design/motion.md` — Progressive Delight: "default to restraint... premium is the goal, flashy is the failure mode" + `.hubzero/principles.md` — "Simplicity Requires Justification for Complexity" | **V3 loses, partially.** Consolidate to two libraries; tier the five moments by launch-readiness rather than shipping all five as day-one scope.                                                             |
| "Editorial narrative over agency-block composition... should never change" listed alongside zero-fabrication        | `.hubzero/design/principles.md` — elegance, not a specific style, is the only permanent constant                                                                                                             | **V3 overstates its own permanence.** Keep the choice; drop the "never change" framing.                                                                                                                      |
| Eleven fully bespoke page archetypes, each demanding a genuinely distinct composition                               | `.hubzero/principles.md` — "Finish Completely": an implementation isn't done because it behaves correctly under ideal conditions, and `.hubzero/polish/PRODUCT_POLISH.md` — no unfinished surfaces           | **V3's ambition is right, its resourcing is wrong.** A tiered system (§4.3) that finishes fewer things completely beats eleven things half-finished, per Core's own standard more than per V3's own roadmap. |
| Mobile treated as a brief aside in a couple of documents, no per-archetype mobile column in `09_PAGE_ARCHETYPES.md` | `.hubzero/design/mobile-experience.md` — Mobile Experience is its own Design Review stage, not a checkbox, and composition (not just reflow) must be considered per surface                                  | **V3 has a real gap here.** Any successor document needs an explicit mobile-composition note per archetype, matching Core's mandate that this is a first-class design pass.                                  |
| Navigation ambition (floating, elegant, confidence-establishing)                                                    | `.hubzero/design/navigation.md` — marketing navigation "often earns visual investment... an elegant floating or adaptive treatment can work well here"                                                       | **No conflict — V3 was already right,** worth confirming so it isn't second-guessed by accident during the color migration.                                                                                  |

---

## 4. Revised long-term creative direction

### 4.1 What stays exactly as `DESIGN/V3` specified it

Everything in this list survives the monochrome pivot untouched, because none of it was ever actually a function of hue:

- Geist Sans / Geist Mono, unchanged.
- The IBM Plex Serif substitution for Instrument Serif, **with one governance fix**: before locking this in, spend fifteen minutes actually looking at current AI-assisted/editorial design output to sanity-check that Instrument Serif is still the over-saturated choice V3 asserted it to be (the critique board's fair complaint was that this was asserted, not shown — the fix is cheap, do it, don't relitigate the typeface choice itself, which remains well-reasoned on pedigree grounds regardless).
- The full spacing scale, 12-column grid, corner-radius, and stroke-weight tokens in `14_VISUAL_TOKENS.md`.
- Right-angle/45°-only trace-path geometry, the icon construction rule, dimension-line and section-cut vocabulary — all pure line and composition logic, zero dependency on which hue (if any) fills the line.
- The imagery taxonomy and placement table (`07_IMAGERY.md`), the diagram-authoring tiering (`15_DIAGRAM_SYSTEM.md`), and the accessibility document (`12_ACCESSIBILITY.md`) — extended, not replaced, per §4.4.
- Page-archetype thinking, Uniqueness Test, Recognition Test, sibling-differentiation checks — kept, re-scoped for capacity in §4.3.

### 4.2 The color decision — recommended direction

**Recommendation: go further than `DESIGN/V3`'s "Typographic Monolith" direction ever got taken seriously, because the real, delivered brand asset now makes it the _only_ fully honest option, not merely the purest one.**

`CRITIQUE_01_REVIEW_BOARD.md` Part 3 already found, independently of anything in this review, that "no single hue can honestly claim to represent all of HubZero's disciplines at once... which is itself an important finding — it may be that no single hue can honestly claim this, which is a real argument for the restraint/near-absence of color direction deserving more serious weight than the final recommendation gave it." The board raised this as a hypothesis under-weighted by taste. The delivered logo has now settled it as a fact: the company's own canonical mark carries no hue at all. Building a five-year interface color system around a hue the brand mark itself doesn't have is the exact mistake `01_VISION.md` §1 diagnosed in the original electric blue — "never actually derived from anything HubZero makes" — repeated a third time with a third hue, unless it's stopped here.

**The proposal, concretely:**

1. **Retire the seven-stop Brand Blue palette in full**, including Brand Blue, Electric Sky, Ice Blue, Pale Cyan, and the associated gradient token. Not softened, not kept as a "secondary" color — the same discipline `01_VISION.md` §5 point 1 already asked of electric blue, correctly applied a second time.
2. **Ground the neutral base in real, hue-neutral material references instead of a blue-leaning or graphite-green-leaning one:** dark mode as _graphite_ — a true near-black with the faint warmth of pencil lead, not a color family, a material; light mode as _vellum_ — a warm, low-chroma off-white closer to real drafting/tracing paper than to a stark digital white. Both leans should sit close enough to zero chroma that "hue lean" isn't a meaningful sentence about either of them — the honesty `DESIGN/V3/04_COLOR.md` §2 was reaching for with its "under 0.02 chroma" instinct, taken to its actual conclusion.
3. **The single interactive "act here" signal becomes contrast, not hue.** A primary action is a solid ink fill — true black on a light surface, true white on a dark surface — with the inverse foreground color, exactly the way a stamped instrument-panel control or a title block's filled field reads: unambiguous, high-contrast, zero chroma. This directly answers the one genuinely sound operational argument `DESIGN/V3/04_COLOR.md` §3 made for keeping a signature color at all (a CMS-authored site with non-designer contributors needs one cheap, unambiguous "click here" signal) — solid-fill-versus-outline is exactly as unambiguous as a brand hue, and it's free: it costs nothing to maintain, never needs a CVD audit (there is no hue to confuse), and can never drift out of sync with a mark that has none either.
4. **The diagram/technical-drawing register (previously "Ice Blue") becomes graphite linework, differentiated from body content by weight, dash pattern, and the drafting-sheet annotation vocabulary already specified in `02_VISUAL_LANGUAGE.md` §9–11** — closer to what an actual pencil-and-ink engineering drawing looks like before anyone adds a color overlay, and a more literal, more honest expression of "blueprint" as a _document type_ than a cyan hue ever was.
5. **The four semantic status colors (danger/warning/success/info) are the one deliberate, narrow exception**, kept exactly as `DESIGN/V3/04_COLOR.md` §4 already scoped them — functional safety/state conventions, not brand color, present in essentially every credible monochrome interface (including ones this system's own competitive research already looked at) without diluting the identity's restraint.
6. **The two real logo assets already delivered (`assets/hubzero-logo-black.png`, `assets/hubzero-logo-white.png`) are the canonical register `DESIGN/V3/13_BRAND_SYSTEM.md` correctly said was missing** — they need production polish (true vector source, verified at 16px per the Favicon Test) but the _design decision_ `13_BRAND_SYSTEM.md` asked for is already made, by the company, for real. No further derivation needed; wire them in.

**What this is not:** it is not "no design system." Restraint this total is harder to execute well than a system with a color to lean on, not easier — every hierarchy decision now has to be earned through type, weight, geometry, spacing, and motion alone, which is a _higher_ bar for craft, not a lower one. `.hubzero/design/principles.md`'s "Elegance Above All" and "Every Pixel Is Intentional" apply with more force here, not less, because there's no accent color to paper over a weak decision.

**Founder-level confirmation worth getting explicitly, in the spirit of `DESIGN/V3`'s own convention of naming open questions rather than silently deciding them:** this document recommends true zero-hue over "near-zero plus one narrow warm-neutral signal" because the delivered mark makes zero-hue the more honest option and because it's the more distinctive, more durable five-year bet per the critique board's own reasoning. If a narrow secondary signal is wanted later for some specific, real reason (not "it felt a little bare"), it should be added the way `14_VISUAL_TOKENS.md` §8 already governs token additions — against a named, specific need, in the same change that needs it.

### 4.3 Capacity-tiered page archetypes

`09_PAGE_ARCHETYPES.md`'s eleven fully bespoke archetypes stay as the _target_, but ship in three honestly-named tiers rather than as one undifferentiated list — this is the direct fix for the critique board's unresolved capacity finding, and it also resolves the separate finding that Team/Careers/About "converge on quiet, minimal, textual" by accident: under this scheme, that convergence becomes a named, deliberate register instead of an unowned drift.

- **Tier 1 — full bespoke investment.** Home, Services, Software, Hardware, Work index, Case Study. These are the pages a skeptical evaluator actually reads to decide whether to have a first conversation; they earn the composition effort `09_PAGE_ARCHETYPES.md` specifies in full.
- **Tier 2 — shared component, distinct register.** Labs, Builds, Blueprints, Notes index/detail. One real shared filterable-list and detail-shell component (already correct engineering per `ARCHITECTURE/07_DESIGN_SYSTEM.md` §8), with each pillar's register (Labs' honest incompleteness, Blueprints' live-demo-as-hero) expressed through content density, imagery category, and the presence/absence of specific devices — not through a fourth from-scratch macro-composition per pillar.
- **Tier 3 — the quiet family, named on purpose.** Team, Careers, Contact, and About's essay form. `09_PAGE_ARCHETYPES.md` already correctly identifies each of these as restrained; this tier makes that restraint an intentional, shared design decision ("these four pages are quiet because their job is quiet") rather than four separate under-resourced attempts at differentiation that happen to land in the same place. Each still gets one small, specific, real differentiator (photography for Team, warmth for Careers, absence-of-CTA for Contact, essay rhythm for About) — but none is expected to carry a signature moment or a bespoke macro-composition.

### 4.4 Motion, retiered

Two libraries, not three: **GSAP** (ScrollTrigger) owns scroll-driven sequencing and pinned sections; **Motion** (motion.dev) owns everything Motion already does well, including the SVG line-drawing and spring-based counters originally assigned to Anime.js — its `pathLength` animation and spring physics cover both jobs without a third dependency, third bundle cost, or third timing vocabulary to keep in sync.

Signature moments, launch-tiered rather than shipped as one batch:

1. **Ship first:** The Trace-In (homepage hero) and The Confirmation (Contact success state) — the two moments with the clearest immediate trust/conversion payoff and the lowest individual build cost.
2. **Ship opportunistically, as real content warrants it:** The Build Sequence (one real, worked diagram-sequencing reference — the Labs/R&D diagram remains the correct anchor case), reserved for the first page that actually has a real diagram worth sequencing, not built speculatively ahead of content.
3. **Defer until Tier 1 pages are stable:** The Section Cut and The Live Handoff — genuinely good ideas, correctly scoped as small and Motion-driven rather than GSAP-budget-consuming, but not load-bearing for launch.

### 4.5 Mobile — the explicit gap `DESIGN/V3` left

Whatever document succeeds `09_PAGE_ARCHETYPES.md` needs one addition Core requires and V3 never delivered: a real mobile-composition note per archetype, not a generic responsive-breakpoint assumption. At minimum, for each Tier 1 page: what recomposes (not just reflows) at handheld width, where the thumb-reach primary action lives, and how the page's imagery sequencing changes for a taller, narrower, more linear reading path — per `.hubzero/design/mobile-experience.md`'s explicit standard.

---

## 5. Phased implementation roadmap

Sequencing principle, inherited from `DESIGN/V3/10_IMPLEMENTATION_ROADMAP.md` and unchanged: fix known, already-diagnosed failures before extending the system; land token-level changes before page-level composition depends on them; never leave two competing systems live longer than one phase.

### Phase −1 — Correctness and polish fixes (days, start immediately, no dependencies)

- Wire `assets/hubzero-logo-black.png` / `hubzero-logo-white.png` into `brandAssets` and `Logo` as the theme-adaptive canonical mark, replacing the old glossy blue PNG in all navbar/footer/chrome usage. Produce a true vector source before finalizing favicon/app-icon use (the Favicon Test: legible as a flat, single-tone shape at 16×16px).
- Remove the accent-colored "Zero" from the wordmark (`logo.tsx`) — there is no brand hue left for it to be. Resolve the "Hub" + "Zero" typographic split on its own merits (weight or serif-without-color) or drop the mixed treatment for the flat lockup the new asset already provides.
- Resolve the team photography inconsistency named in both this review and the 2026-07-04 review — a real, same-session photography pass (or, if that's not feasible on the current timeline, a disciplined, honest re-crop/re-grade pass toward one consistent register) before About/Team ship in their current state. This is the single highest trust-per-effort fix available, confirmed twice now.
- Confirm (don't assume) that Services/Software/Hardware currently pass the Uniqueness Test as distinct compositions. If not, this is still Phase 0-equivalent priority ahead of any token work.

### Phase 0 — Color and brand token realignment

- Retire the seven-stop Brand Blue palette (`--color-accent`, Electric Sky, Ice Blue, Pale Cyan, `--brand-gradient`) from `globals.css` in full.
- Implement the graphite/vellum neutral base and the solid-fill interactive signal per §4.2.
- Re-tune the four status colors against the new, truly neutral base (a smaller, easier audit than the one `DESIGN/V3/12_ACCESSIBILITY.md` originally scoped, since a zero-hue system removes the CVD-confusion risk between the brand signal and the status hues entirely — worth naming as a real, positive side effect, not just a smaller checklist).
- Run a WCAG AA contrast pass across the new tokens in both themes — mechanically simpler than the original seven-stop audit, since there are fewer hue relationships to verify.
- Update `site.webmanifest`'s `theme_color`/`background_color` to match.

### Phase 1 — Motion infrastructure consolidation

- Stand up the shared GSAP + Motion timing-token pattern (extending `lib/motion.ts`), retiring any Anime.js-specific usage in favor of Motion's equivalent capability.
- Implement reduced-motion handling once, correctly, for both libraries per `.hubzero/design/motion.md`'s standard (instant resolved state, not a shorter animation).

### Phase 2 — Homepage Architecture (the paused milestone, resumed)

- Rebuild the homepage under the new tokens: asymmetric drafting-sheet composition, three-panel What We Do (Software/Hardware/AI), the Trace-In hero sequence (§4.4), one curated real-evidence image at the featured-case-study beat.
- This is the first real page built under the new system and becomes the reference every later Tier 1 page is checked against — land it carefully; do not start Tier 1 interior pages before it's stable.

### Phase 3 — Tier 1 interior pages

Services, Software, Hardware, Work index, Case Study, About — migrated to the new tokens, each re-verified individually against the Uniqueness and Recognition tests and against its named siblings, per `09_PAGE_ARCHETYPES.md`'s existing per-page discipline.

### Phase 4 — Tier 2 and Tier 3 pages

Labs, Builds, Blueprints, Notes (Tier 2, shared component + distinct register); Team, Careers, Contact (Tier 3, quiet family, one real differentiator each). Team ships only once Phase −1's photography fix is real.

### Phase 5 — Diagram and imagery production (ongoing, no fixed end date)

Same standing production discipline `DESIGN/V3/10_IMPLEMENTATION_ROADMAP.md` Phase 7 already scoped — real hardware photography, PCB renders, CAD, and the reusable engineering-diagram component — now executed in graphite/ink rather than cyan, paced by real project output rather than rushed ahead of it.

---

## 6. Claude Code implementation prompt

The prompt below is scoped to **Phase −1 + Phase 0**, the correctness fixes and token realignment that must land before Homepage Architecture (Phase 2) can safely resume — matching the sequencing principle that token-level work always precedes the page-level work that depends on it. It is written to be handed to a fresh Claude Code session with no other context.

```
You are implementing Phase −1 and Phase 0 of the HubZero marketing site's
monochrome realignment, per docs/design-reviews/STRATEGIC_PRODUCT_REVIEW_V4.md
(read that file in full before starting — it is the authoritative brief for
this work and explains the "why" behind every instruction below).

CONTEXT YOU MUST INTERNALIZE FIRST
- Read .hubzero/principles.md, .hubzero/design/principles.md, and
  .hubzero/design/motion.md before writing any code. This is HubZero Core —
  the non-negotiable engineering and design philosophy for every HubZero
  product. Elegance is the only permanent constant; the specific visual
  system below is this era's expression of it, not dogma.
- Read DESIGN/V3/02_VISUAL_LANGUAGE.md, 03_TYPOGRAPHY.md, 05_LAYOUT_SYSTEM.md,
  06_COMPONENT_LANGUAGE.md, and 14_VISUAL_TOKENS.md — these subsystems
  (geometry, type, spacing, grid, radii, strokes) are UNCHANGED by this work
  and remain your source of truth for everything except color.
- Read DESIGN/V3/04_COLOR.md and 11_COLOR_PHILOSOPHY_AMENDMENT.md for
  historical context only — both are SUPERSEDED by this review's §4.2. Do
  not implement either document's color values. Do not implement a blue,
  copper, or any hue-based brand accent.
- The company's real, canonical brand mark is assets/hubzero-logo-black.png
  and assets/hubzero-logo-white.png — pure flat black/white, no gradient, no
  gloss, no chroma. This is a real, already-decided brand asset, not a
  placeholder — do not attempt to redesign it, recolor it, or add richness
  to it.

DO NOT
- Do not implement any new page composition (no Homepage Architecture work —
  that is Phase 2, out of scope here, and depends on this phase completing
  first).
- Do not introduce a new brand hue, gradient, or "just one" accent color not
  explicitly specified below.
- Do not touch src/lib/motion.ts's duration/ease token *values* — Phase 1
  (motion consolidation) is separate, later work. If you encounter an
  Anime.js-specific call site during this phase, leave it as-is and note it;
  do not migrate it now.
- Do not delete assets/hubzero-logo-black.png, assets/hubzero-logo-white.png,
  or the old /public/brand/* assets. Old assets may still be referenced from
  places outside this phase's scope (e.g. a static Open Graph fallback) —
  audit call sites before removing anything, per HubZero Core's "Read Before
  Writing" and "Inspect Before Creating."

STEP 1 — Brand asset wiring (Phase −1)
1. Produce (or, if you cannot generate true vector output, faithfully
   re-trace at high fidelity) a canonical SVG of the H/Z hexagonal monogram
   from assets/hubzero-logo-black.png, in solid-fill and open-linework
   treatments, per DESIGN/V3/13_BRAND_SYSTEM.md §2's construction logic
   (right-angle/45° flat planes, no bevel/gradient/gloss). Verify it reads
   as a distinct, intentional shape at 16×16px flat-color rendering (the
   Favicon Test, 13_BRAND_SYSTEM.md §1 invariant 4) before proceeding.
2. Update src/config/brand.ts: brandAssets.icon should point at the new
   canonical monochrome asset (theme-adaptive — black mark on light theme,
   white mark on dark theme, or a single currentColor-driven SVG if
   feasible). Update favicon.ico, apple-touch-icon.png, and the
   android-chrome-* sizes to the canonical solid treatment. Update the code
   comment documenting the "known gap" — it is now closed.
3. Update src/components/brand/logo.tsx: remove text-accent-text from the
   wordmark's "Zero" — there is no brand accent color for it to reference
   after Step in this prompt's Phase 0 work. Keep or drop the Geist
   Sans/IBM Plex Serif split on typographic merits alone (weight/serif
   distinction is fine; color distinction is not, because it no longer
   exists in the brand).
4. Update public/site.webmanifest's theme_color and background_color to the
   new graphite/vellum values once Step "Phase 0" below defines them.

STEP 2 — Color token realignment (Phase 0)
1. In src/app/globals.css, remove: --color-accent (Brand Blue),
   --color-accent-text, --color-accent-foreground, --color-electric-sky,
   --color-ice-blue, --color-pale-cyan, --color-neutral-silver, and
   --brand-gradient, in both the dark (default) and .light blocks.
2. Replace the neutral base with a truly hue-neutral graphite (dark
   mode)/vellum (light mode) scale: near-zero chroma in both themes (target
   under 0.005 OKLCH chroma — meaningfully lower than DESIGN/V3's original
   "under 0.02" instinct, because the goal here is genuine neutrality, not a
   faint material lean). Keep the existing token NAMES (--color-bg,
   --color-bg-dark, --color-bg-light, --color-text, --color-text-muted,
   --color-border, --color-border-muted, --color-highlight) so every
   existing bg-*/text-*/border-* call site in the codebase keeps working
   unchanged — only the values change, exactly as the prior migration's own
   comment in globals.css already established as the right pattern.
3. Define the new interactive-signal system as CONTRAST, not hue: a solid
   ink fill (near-black in light mode, near-white in dark mode) with an
   inverse foreground color, for primary buttons and active/selected
   states. Focus rings use a 2px outline in the same ink tone (per
   DESIGN/V3/14_VISUAL_TOKENS.md §4's existing 2px-focus-ring weight
   convention) — verify it clears WCAG 2.1's 3:1 non-text contrast minimum
   against every surface it can appear on, light and dark.
4. Re-tune the four status colors (--color-danger/warning/success/info)
   against the new neutral base only if a contrast check against the new
   background/surface values fails — otherwise leave their hue/chroma
   values as-is, since removing the brand hue doesn't inherently require
   re-deriving unrelated semantic colors.
5. Replace the diagram/technical-linework color reference (formerly Ice
   Blue) with the same graphite ink used elsewhere, differentiated from
   body content by weight and the dimension-line/annotation vocabulary
   already specified in DESIGN/V3/02_VISUAL_LANGUAGE.md §9-11 — search the
   codebase for any component currently referencing --color-ice-blue (e.g.
   src/components/marketing/diagram/*) and update it to use the graphite
   ink token plus a distinct stroke weight/dash pattern instead.
6. Run a real WCAG 2.1 AA contrast check (4.5:1 text, 3:1 UI/large text) on
   every new token pair, in both themes, before considering this step
   complete. Because this is now a genuinely hue-neutral system, there is
   no separate CVD (color-vision-deficiency) audit required for the
   interactive signal itself — note this explicitly in your summary as a
   real, positive consequence of the zero-hue direction, not an oversight.

STEP 3 — Verification
1. Grep the full src/ tree for any remaining reference to the retired
   tokens (accent, electric-sky, ice-blue, pale-cyan, neutral-silver,
   brand-gradient) and to the old /brand/icon.png-style asset paths. Every
   hit must be intentionally resolved (migrated to the new token/asset, or
   confirmed genuinely out of scope) — none should be silently left
   dangling.
2. Visually verify, in both light and dark theme, that: the navbar and
   footer render the new monochrome mark correctly on both themes; every
   button/link/focus state uses the new contrast-based signal correctly;
   no page renders a visible blue anywhere.
3. Confirm the site still builds and passes existing tests/typecheck before
   finishing.

DEFINITION OF DONE
- No blue-family hue exists anywhere in the rendered site.
- The navbar, footer, favicon, and social-card default image all render the
  real canonical monochrome mark, not the old glossy blue render.
- Every existing page renders correctly in both themes with no visual
  regression outside the intended color change.
- A brief written summary (not a new document — a PR description is
  sufficient) states what changed and explicitly confirms the WCAG contrast
  check was run and passed.

Do not proceed to Homepage Architecture (Phase 2) in this session. When this
phase is verified complete, stop and report back — the next phase is a
separate, deliberately sequenced piece of work per
docs/design-reviews/STRATEGIC_PRODUCT_REVIEW_V4.md §5.
```

For **Phase 2 (Homepage Architecture)**, once Phase −1/0 have landed and been verified: open a fresh session, point it at this same review document plus `DESIGN/V3/09_PAGE_ARCHETYPES.md` §1 and `ARCHITECTURE/15_HOMEPAGE_DESIGN.md`, and scope it narrowly to the homepage alone — do not let a single session attempt Phase 2 through Phase 4 together. The capacity finding in §3.2 applies to how this work gets _executed_, not only how it gets _planned_.
