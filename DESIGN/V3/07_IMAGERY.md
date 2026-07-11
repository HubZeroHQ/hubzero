# 07 — Imagery

> Assumes `02_VISUAL_LANGUAGE.md` §5–8. This is the document that most directly answers the brief's central imagery question: **how should HubZero visually communicate engineering, across software, hardware, AI, and research, without ever looking like a stock-photography-driven agency site?** No stock imagery appears anywhere in this taxonomy — every category below is a real artifact category, mapped to where it belongs.

## 1. The governing rule

Every image on a HubZero page sits on one of two poles (`02_VISUAL_LANGUAGE.md` §6): a **real artifact** (something that exists independent of the website — a photograph, a screenshot, a genuine render of a real design) or a **site-native diagram** (something HubZero draws itself, in its own linework language, to explain a real system). Nothing is allowed to sit between those poles — no illustrated metaphor, no stock photo standing in for a real one, no AI-generated "concept" render of a product that doesn't exist. If neither a real artifact nor an honest site-native diagram is available for a claim, the correct answer is to state the claim in text alone, or to omit it, never to manufacture a visual for it.

## 2. Product renders

**What:** real 3D renders or high-fidelity mockups of an actual shipped or in-progress product — a case study's web application, a Blueprint's interface, a Build's product.

**Where it belongs:** Work (case-study evidence), Builds (product presentation), Blueprints (interface preview). Never on Home or Services in a generic, un-specific way — a product render only belongs where it's rendering something specific and real.

**Discipline:** no browser-chrome mockup frames (already excluded, `DESIGN/00_AI_DESIGN_GUIDE.md` §3.1) — the actual interface, cropped and captioned like a figure (`02_VISUAL_LANGUAGE.md` §5), full-bleed only at genuine climax moments (`05_LAYOUT_SYSTEM.md` §8).

## 3. Architecture diagrams

**What:** site-native, drafting-cyan-linework diagrams depicting a real system's structure — services, data flow, request/response paths, deployment topology.

**Where it belongs:** Work (a case study's "how it's built" section), Labs (a research project's current architecture), Services (a practice page's one real system diagram, as the existing Labs/R&D data-flow diagram already models), Blueprints (a foundation's structure).

**Discipline:** built from real box/arrow/queue convention, legible at the site's own type scale (`06_COMPONENT_LANGUAGE.md` §15) — never an embedded screenshot from an external diagramming tool with its own competing visual language.

## 4. PCB renders

**What:** real printed-circuit-board renders or high-resolution photographs — populated boards, bare boards, layout views showing real trace routing.

**Where it belongs:** Services/Hardware, Labs (hardware entries), Work (a hardware case study once one exists), Builds (a hardware product).

**Discipline:** kept in their real solder-mask/copper color — never recolored to match the brand's copper accent (`02_VISUAL_LANGUAGE.md` §5's artifact-integrity rule) — captioned with what the board actually is and does, ideally with a real annotation call-out (`02` §10) pointing at the specific detail the surrounding text is discussing.

## 5. CAD

**What:** real computer-aided-design views — orthographic projections, exploded-assembly views, section views of an actual enclosure or mechanical part HubZero designed.

**Where it belongs:** Services/Hardware, Labs, Builds, Blueprints — anywhere a physical enclosure or mechanical component is part of the real story.

**Discipline:** this is Blueprint direction's most literal home — a real orthographic/exploded CAD view is, functionally, the exact drafting-sheet artifact the whole visual language is modeled on. Presented at genuine engineering-drawing fidelity (dimension lines, section-cut hatching per `02` §1 and §10) rather than a "pretty render" stripped of its technical information.

## 6. Hardware photography

**What:** real photographs of real physical work — assembled boards, enclosures, bench setups, prototypes under test.

**Where it belongs:** Labs (a build in progress), Work (hardware case-study evidence), Builds, About/Team (a workspace photo, used sparingly).

**Discipline:** the Apple/Teenage-Engineering consistency standard from `02_VISUAL_LANGUAGE.md` §7 applies most strictly here — one lighting approach, one background treatment, applied identically across every instance in a given category, because inconsistent hardware photography is exactly as damaging to hardware credibility as v2's inconsistent founder photos were to About's credibility (`docs/design-reviews/MARKETING_SITE_REVIEW_V1.md` §6, the direct precedent this rule generalizes from).

## 7. Code

**What:** real code excerpts — an actual function, an actual config, an actual migration — from a real, shipped or in-progress system.

**Where it belongs:** Work (a technical-decision moment in a case study), Notes (a technical write-up), Labs, Blueprints.

**Discipline:** per `03_TYPOGRAPHY.md` §8 and `06_COMPONENT_LANGUAGE.md` §14 — real, runnable-looking code with real context (filename, real surrounding logic implied), never a decorative "looks technical" snippet with no real referent.

## 8. Terminals

**What:** real terminal/CLI session captures — a build output, a deployment log, a CLI tool HubZero has actually built or used.

**Where it belongs:** Notes (a technical walkthrough), Labs, Blueprints (demonstrating a real developer-tool interaction), Builds (an internal tool's real usage).

**Discipline:** captured, not staged — a real session, cropped to the relevant portion, in the site's own monospace type rather than an embedded screenshot carrying a different terminal theme's colors (an actual re-typeset excerpt, where practical, reads more intentional than a raw screenshot and keeps the color palette disciplined per `04_COLOR.md`).

## 9. Technical drawings

**What:** genuine dimensioned drawings — the most literal expression of Blueprint's drafting-sheet vocabulary, whether hand-derived from a real CAD export or authored directly in the site's linework system.

**Where it belongs:** Services/Hardware, Labs, Blueprints — anywhere a real dimensioned artifact exists or is worth authoring to explain a real physical relationship (an enclosure's tolerances, a board's real physical footprint).

**Discipline:** real units, real tolerances, real revision metadata (`02_VISUAL_LANGUAGE.md` §11) where available — a technical drawing with invented dimensions is a fabrication exactly as serious as an invented metric (`ARCHITECTURE/05_CONTENT_STRATEGY.md`'s zero-fabrication policy, extended to visuals).

## 10. Notebooks

**What:** real working-notes imagery — a photographed whiteboard, an actual dated Labs log entry, a real sketch made during a real design decision.

**Where it belongs:** Labs, exclusively (or a Note describing a Labs project) — this is the one imagery category explicitly scoped to a single pillar, mirroring `01_VISION.md` §9's decision to keep Lab Notebook's honesty-about-incompleteness register narrowly contained rather than applied site-wide.

**Discipline:** must be a photograph or scan of something real — never a designed-to-look-handwritten graphic standing in for an actual notebook page, which would be a fabrication of process exactly as serious as a fabricated testimonial.

## 11. Annotations

**What:** the leader-line, dimension-call-out, and revision-stamp vocabulary from `02_VISUAL_LANGUAGE.md` §10, applied as an overlay on top of any of the categories above.

**Where it belongs:** anywhere a real artifact benefits from a second layer of explanation — a PCB render with a call-out identifying a specific component, a screenshot with a leader line pointing at the specific detail the surrounding prose is discussing.

**Discipline:** every annotation points at something specific and real; a diagram or photo should remain fully comprehensible with all annotations ignored, per `02` §10's optionality rule.

## 12. Manufacturing

**What:** real photographs or footage of an actual manufacturing/assembly step — a pick-and-place run, a reflow oven, a hand-assembly bench, a small production batch.

**Where it belongs:** Labs and Builds specifically, and only once such imagery genuinely exists — this category is the clearest illustration of `01_VISION.md` §10's standing rule that an honest gap beats a fabricated stand-in. HubZero should not commission "manufacturing-adjacent" stock or illustrated imagery to fill this slot before it has real manufacturing evidence to show.

**Discipline:** documentary, not staged-for-marketing — a real process caught in the act, not art-directed to look more dramatic than the actual process is.

## 13. Prototypes

**What:** real, dated photographs of a prototype at a real stage of development — a breadboard, a 3D-printed enclosure test-fit, a v1 board next to a v2 board.

**Where it belongs:** Labs primarily (where visible incompleteness is the honest, correct register per `01_VISION.md` §9), occasionally Builds (a "how we got here" retrospective moment) and a case study's approach section (showing real iteration, not just the finished result).

**Discipline:** dated and stage-labeled honestly — a prototype photo should never be presented in a way that implies a more finished state than the real project was actually at, at that date.

## 14. Placement summary by pillar

| Pillar/page       | Primary imagery categories                                                                                                                                                                                             |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Home              | One curated product render or architecture diagram (the "trust climax" moment) — never a category not already earned elsewhere on the site                                                                             |
| Services          | Architecture diagrams, CAD, technical drawings — proof of real systems thinking, not product photography                                                                                                               |
| Work / Case Study | Product renders, architecture diagrams, code, real evidence images specific to the delivered project                                                                                                                   |
| Labs              | Notebooks, prototypes, hardware photography, manufacturing (once real), PCB renders — the most visually varied and most honestly "in progress" pillar                                                                  |
| Builds            | Product renders, PCB renders, manufacturing, terminals (for developer tools)                                                                                                                                           |
| Blueprints        | CAD, technical drawings, terminals/code (the live demo is the actual hero content, per `ARCHITECTURE/06_PAGE_SPECIFICATIONS.md`'s existing Blueprints spec — imagery here supports, never replaces, the real artifact) |
| Notes             | Code, terminals, architecture diagrams, technical drawings — whatever the specific write-up is actually about                                                                                                          |
| Team / About      | Hardware/workspace photography (consistency-critical, §6), real team photography only                                                                                                                                  |
| Careers           | Workspace photography, real team-adjacent imagery — the one place a slightly warmer, more human register is appropriate                                                                                                |
| Contact           | Minimal to no imagery — this page's job is the form and the context around it, not persuasion through image                                                                                                            |

## 15. What is never used, restated as a closed list

No stock photography (people at desks, generic "innovation" imagery), no abstract hero illustrations (rockets, puzzle pieces, blob shapes — already excluded by `DESIGN/00_AI_DESIGN_GUIDE.md` §3.3, carried forward unmodified), no AI-generated "concept" renders of unbuilt products, no browser-chrome device mockup frames, no commissioned illustration standing in for a real diagram or photograph HubZero doesn't have yet. Every category in this document is real-artifact-or-real-diagram; nothing on this list is either.
