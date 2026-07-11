# 10 — Implementation Roadmap

> Assumes `00`–`09`. This document does not implement anything — it sequences how a future engineering/design pass should turn this blueprint into code, ranked by value, risk, and dependency, the same way `ARCHITECTURE/14_IMPLEMENTATION_ROADMAP.md` sequenced v2's build without writing v2's code.

## 1. Sequencing principles

Three rules govern the order below, each inherited from a real lesson already documented elsewhere in this repository:

1. **Foundation before expression.** Token-level changes (color, type) must land and be verified before any page-level composition work begins, because every later phase's components assume the new tokens exist — building a new component against an old token is wasted work the moment the token changes underneath it.
2. **Fix the documented failure before extending the system.** `docs/design-reviews/MARKETING_SITE_REVIEW_V1.md`'s highest-impact finding (Services/Software/Hardware's template repetition) is a content/composition problem on _already-shipped_ pages, not a token problem — it should be corrected using the _existing_ v2 token system before the v3 token migration even lands, because it's valuable, low-risk, and shouldn't wait on an unrelated, larger visual migration.
3. **Never ship a partial migration that leaves two competing systems live simultaneously for longer than one phase.** A site with some pages on the retired electric-blue system and others on Working Blueprint's copper system reads as an inconsistency worse than either system alone — every phase below is scoped so it can complete and stabilize before the next begins.

## 2. Phase 0 — Fix the known, already-diagnosed failure (do this regardless of v3's timeline)

**What:** Give Services, Software, and Hardware three genuinely distinct compositions per `docs/design-reviews/MARKETING_SITE_REVIEW_V1.md` §10 #1 and `09_PAGE_ARCHETYPES.md` §3, using v2's _current_ token system — no color or type migration required.

**Value:** Highest available value-per-effort on the entire list. This single change was independently identified by a commissioned review as the one thing most affecting whether the current site reads as exceptional or merely competent.

**Risk:** Lowest on this list — it's content/composition rework on pages that already work mechanically, not new infrastructure.

**Dependencies:** None. Can start immediately, independent of every other phase.

**Effort:** Small — days, not weeks, per the review's own estimate (§14).

## 3. Phase 1 — Token foundation: color and type

**What:** Implement `04_COLOR.md`'s new base palette (solder-mask dark / drafting-paper light, copper accent, drafting cyan) and `03_TYPOGRAPHY.md`'s IBM Plex Serif substitution at the token level — `globals.css`'s custom properties and the font-loading configuration in `layout.tsx`, plus a real WCAG AA contrast audit of every new token pair (inheriting the existing accessibility baseline from `ARCHITECTURE/07_DESIGN_SYSTEM.md` §6 unchanged).

**Value:** High — this is the foundation every later phase depends on, and it's also the single most visible expression of "electric blue is retired" — the moment the rest of the organization can see the decision made real.

**Risk:** Medium. A token-level change touches every page simultaneously; a contrast or legibility regression would be site-wide. Mitigate by shipping behind a real visual QA pass (light and dark themes, every existing page) before merging, mirroring the rigor `ARCHITECTURE/16_RESPONSIVE_DESIGN_STANDARDS.md` already demands for responsive changes.

**Dependencies:** None technically, but should follow Phase 0 so the interior-page fix isn't immediately re-touched by a token migration a few weeks later.

**Effort:** Medium — a token migration plus a full-site visual regression pass across every existing route.

## 4. Phase 2 — Homepage rebuild in the new visual language

**What:** Rebuild the homepage per `09_PAGE_ARCHETYPES.md` §1 — the three-panel What We Do split, the new material/trace-path composition, the Working Blueprint hero.

**Value:** High. The homepage is the highest-traffic, highest-stakes single page on the site and the one every future page's composition is checked against — landing it first gives every subsequent phase a real, working reference rather than a theoretical one.

**Risk:** Medium — a homepage rebuild is user-facing and reputationally visible, but it's a single page, not a site-wide change, so the blast radius is contained.

**Dependencies:** Phase 1 (needs the new tokens live).

**Effort:** Medium-large — a full narrative-arc page, including its one GSAP hero sequence and Anime.js trace-path draw-in (the first real implementation of `08_MOTION_SYSTEM.md`'s multi-library approach, so budget extra time for establishing the shared timing-token integration pattern the rest of the site will reuse).

## 5. Phase 3 — Motion infrastructure

**What:** Stand up the shared GSAP/Motion/Anime.js token-integration pattern established in Phase 2 as reusable infrastructure (a small shared utilities layer analogous to the existing `lib/motion.ts`, extended with GSAP `matchMedia` and Anime.js reduced-motion helpers per `08_MOTION_SYSTEM.md` §6).

**Value:** Medium-high — every later page benefits from this existing cleanly, once, rather than each page inventing its own reduced-motion handling per library.

**Risk:** Low — this is internal infrastructure with no direct user-facing surface of its own.

**Dependencies:** Phase 2 (the homepage is where the pattern is proven out first).

**Effort:** Small, if scoped immediately after Phase 2 while the pattern is fresh; larger if deferred and re-derived later.

## 6. Phase 4 — Interior marketing pages (Services, Software, Hardware, Work, Case Study, About)

**What:** Migrate the Phase-0-fixed interior pages, plus Work/Case Study/About, into the full Working Blueprint component language (`06_COMPONENT_LANGUAGE.md`), per their individual archetypes in `09_PAGE_ARCHETYPES.md` §2–5, §10.

**Value:** High — this is the bulk of the site's persuasion-and-proof surface area.

**Risk:** Medium — several pages at once, but each individually scoped and each already has a Phase-0-validated composition to migrate rather than a composition being invented for the first time under a new token system simultaneously.

**Dependencies:** Phases 0–3.

**Effort:** Large — the biggest single phase by page count, but each page is individually well-specified by this point, which should keep per-page effort predictable.

## 7. Phase 5 — Contact, Team, Careers

**What:** Migrate the three most restrained, least visually elaborate pages — lowest-risk, since `09_PAGE_ARCHETYPES.md` §9, §11–12 already specify minimal visual change for these relative to their current form (mostly a token/type migration plus the photographic-consistency fix already flagged in the design review).

**Value:** Medium — necessary for a fully consistent site, lower individual visibility than Phase 4's pages.

**Risk:** Low.

**Dependencies:** Phase 1 (tokens); benefits from, but doesn't strictly require, Phase 4.

**Effort:** Small-medium, with the one real cost being the About/Team founder-photography consistency pass (`07_IMAGERY.md` §6) — an asset-production task, not a code task, and worth scheduling as its own small workstream since it doesn't block on any engineering phase.

## 8. Phase 6 — Labs, Builds, Blueprints, Notes

**What:** Apply each pillar's specific, differentiated register (`09_PAGE_ARCHETYPES.md` §6–8) — Labs' honest incompleteness, Blueprints' live-demo-as-hero, Notes' editorial figure discipline.

**Value:** Medium-high — this is where HubZero's expanded ambition (`01_VISION.md` §1) becomes visible for the first time; these pillars are the most direct evidence of the "engineering studio, not SaaS marketing site" positioning.

**Risk:** Low-medium — these pillars are content-gated in the underlying IA already (`ARCHITECTURE/17_COMPANY_STRUCTURE.md` §5), so visual migration effort naturally scales with how much real content exists in each, rather than needing to be fully built out ahead of content.

**Dependencies:** Phases 1–4 (borrows components and patterns already proven on Work/Case-Study pages).

**Effort:** Medium, scaling with real content volume — genuinely small if each pillar still has few published entries at this point, larger once they've grown.

## 9. Phase 7 — Full diagram and imagery system rollout

**What:** Build out the reusable architecture-diagram component (`06_COMPONENT_LANGUAGE.md` §15) as real shared infrastructure, and commission/capture the real imagery `07_IMAGERY.md` calls for wherever it doesn't exist yet (hardware photography, PCB renders, CAD views) — an ongoing production workstream more than a single phase with a clean end.

**Value:** High long-term, since diagrams and real artifact imagery are this identity's single strongest differentiator per `00_EXPLORATION.md`'s competitive analysis — but individually lower-urgency than Phases 0–6 since it can proceed incrementally, page by page, as real content and real hardware work becomes available.

**Risk:** Low — additive, non-breaking, and naturally paced by real project/Labs output rather than needing to be rushed.

**Dependencies:** None strictly technical; conceptually follows once Phase 2's diagram component pattern exists.

**Effort:** Ongoing — not a phase with a completion date, a standing production discipline.

## 10. Recommended order, summarized

| Order | Phase                                          | Value            | Risk       | Effort                  |
| ----- | ---------------------------------------------- | ---------------- | ---------- | ----------------------- |
| 1     | 0 — Fix Services/Software/Hardware composition | Highest          | Lowest     | Small                   |
| 2     | 1 — Color + type token foundation              | High             | Medium     | Medium                  |
| 3     | 2 — Homepage rebuild                           | High             | Medium     | Medium-large            |
| 4     | 3 — Motion infrastructure                      | Medium-high      | Low        | Small                   |
| 5     | 4 — Interior marketing pages                   | High             | Medium     | Large                   |
| 6     | 5 — Contact/Team/Careers                       | Medium           | Low        | Small-medium            |
| 7     | 6 — Labs/Builds/Blueprints/Notes               | Medium-high      | Low-medium | Medium (content-scaled) |
| 8     | 7 — Diagram/imagery system rollout             | High (long-term) | Low        | Ongoing                 |

**Highest impact, lowest risk, do regardless of everything else in this document:** Phase 0. It requires none of v3's new tokens, none of the new motion infrastructure, and none of the color/typography decisions in `03`–`04` — it is pure composition discipline applied to pages that already exist, and it is already independently validated as the single highest-leverage fix available on the current site.

**Highest long-term differentiation value:** Phase 7. Real diagrams and real hardware/product imagery, sustained as a standing discipline rather than a one-time migration, are what separate Working Blueprint from a palette swap — they are the actual, ongoing evidence that "editorial engineering" (`01_VISION.md` §7) is a practice, not a slogan.

## 11. What this roadmap deliberately does not schedule

No new CMS collections, no new routes, no new content-block types — `ARCHITECTURE/19_CMS_FOUNDATION.md` and `20_CONTENT_BLOCKS.md`'s existing model already supports everything this blueprint specifies (fifteen block types are enough to express every component in `06_COMPONENT_LANGUAGE.md`; the four-pillar structure already supports every page archetype in `09_PAGE_ARCHETYPES.md`). This roadmap is a visual-layer migration on top of an already-correct content architecture, and any future team tempted to add new backend scope alongside it should treat that as a separate, unjustified expansion of what this blueprint actually asked for.
