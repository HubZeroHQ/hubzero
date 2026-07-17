# Public Experience Implementation Plan

**Status:** Proposed after Phase 12 review — no implementation is authorized by this document

This roadmap begins only after the Phase 12 documentation set is approved. It replaces the idea of building page-by-page with a sequence that establishes content contracts, shared narrative systems, and evidence quality before broad route coverage.

## Sequencing principles

1. Validate content readiness before designing around missing evidence.
2. Build the public read model before UI so visibility and relationships have one source of truth.
3. Establish typography, density, chrome, and motion foundations before collection templates.
4. Prove the product identity with Builds and Labs before expanding service-oriented surfaces.
5. Build one vertical slice deeply, then generalize shared systems.
6. Launch Notes and Engineering Profiles only when their content gates are met.
7. Treat mobile, accessibility, discoverability, performance, and reduced motion as phase acceptance criteria, not a final repair list.

## Dependency map

```text
Approved Phase 12 docs
        │
        ▼
Content audit and public contracts
        │
        ├──────────────► Public query/visibility layer
        │                         │
        ▼                         ▼
Foundations ───────────► Vertical slice (Build + Lab)
                                  │
                    ┌─────────────┼─────────────┐
                    ▼             ▼             ▼
                 Work        Blueprints     Notes/Profiles
                    └─────────────┼─────────────┘
                                  ▼
                         Home composition
                                  │
                                  ▼
                    About · Services · Contact
                                  │
                                  ▼
                       Verification and release
```

## Phase 12A — Approval and decision closure

**Goal:** turn this proposal into an approved contract.

Decisions:

- Confirm the active engineering publication thesis.
- Confirm Builds as the leading long-term identity signal.
- Confirm `/engineering` as distinct from `/about`.
- Confirm long-term navigation: Notes replaces Services after the Notes content gate.
- Confirm Services remains public but contextual.
- Confirm global framing remains handcrafted for the first public implementation.
- Confirm that public contribution credit waits for explicit contributor data.

**Exit:** all decisions are approved or amended in documentation. No UI code begins before this exit.

## Phase 13 — Content audit and public contracts

**Goal:** determine what can be published truthfully and define the public read contract over Studio.

Work:

- Inventory real Work, Builds, Blueprints, Labs, Notes, Team, Services, and Engineering Profiles.
- Resolve the legacy Work/Build triage still open in `PLANNING.md`.
- Identify the first real deployed Blueprint.
- Apply the completeness gates in `PUBLIC_NARRATIVE.md`.
- Define one public visibility predicate used by routes, search, sitemap, feeds, and relations.
- Define public DTOs that exclude internal fields and resolve Media/Taxonomy safely.
- Define derived inverse relations and handle unpublished targets.
- Decide how Note User authors resolve to Team/Profile identities.
- Create an editorial gap report; do not fabricate seed content.

**Dependencies:** approved Phase 12 docs; working Studio collections.

**Exit:** at least one launch-quality Build, Work, Blueprint, and active Lab; explicit go/no-go for Notes and Profiles; reviewed DTO and visibility contracts.

## Phase 14 — Public foundations

**Goal:** create the shared experience substrate without collection pages.

Work:

- Separate public and Studio design-token/application concerns while preserving the canonical public design language.
- Implement typography, spacing, container behavior, density, media, prose, and wide-artifact rules.
- Build global navigation, Search entry, footer, focus behavior, and route-announcement behavior.
- Implement motion tokens and reduced-motion equivalents from `MOTION_GUIDELINES.md`.
- Establish metadata, canonical URL, structured-data, sitemap, robots, Open Graph, and feed foundations.
- Establish public error, empty, archived, unavailable, and loading behavior.
- Validate 320px mobile through ultrawide composition with real content.

**Dependencies:** Phase 13 public contracts.

**Exit:** a content-neutral shell passes keyboard, contrast, reduced-motion, responsive, and performance checks.

## Phase 15 — Vertical slice: Build and originating Lab

**Goal:** prove the product-first thesis and the hardest cross-collection relationship end to end.

Work:

- Implement Builds index and detail.
- Render case-study and technical Documents through the public block renderer.
- Implement Labs index and detail, milestone treatment, and journal rendering.
- Implement originating Lab ↔ graduated Build navigation.
- Implement live deployment, repository, technology, media, version/state, and recency treatment.
- Prototype the typed relationship transition and reduced-motion fallback.
- Validate unpublished/archived relationship behavior.

**Why first:** Builds carries the desired company identity; Labs proves current engineering and exercises state, progress, long-form Documents, media, and the most meaningful lifecycle transition.

**Dependencies:** Phases 13–14.

**Exit:** one real Build/Lab lineage is complete, indexable, accessible, fast, and editorially credible.

## Phase 16 — Work

**Goal:** prove client outcomes through the same engineering system.

Work:

- Implement Work index filters and detail narrative.
- Establish constraint, decision, outcome, source, and lesson presentation.
- Implement Work ↔ Build and Work ↔ Blueprint relationships.
- Carry relevant evidence context into Contact without prematurely building the full Services surface.
- Confirm that private client facts and internal repositories never leak.

**Why now:** the Build/Lab slice has already proven Documents and relationships, letting Work focus on evidence and confidentiality rather than inventing infrastructure.

**Dependencies:** Phase 15 relationship and renderer patterns.

**Exit:** at least one real case study meets the completeness gate and has a meaningful next path.

## Phase 17 — Blueprints

**Goal:** make reusable foundations evaluable before a conversation.

Work:

- Implement architecture/design-language filtering.
- Implement X/Y explanation, version, audience fit, features, technologies, preview media, live deployment, repo/docs links.
- Implement Work/Build proof relationships.
- Design live-preview transitions that clearly distinguish canonical detail from external deployment.
- Enforce the no-placeholder launch gate.

**Dependencies:** first real Blueprint deployed; Phase 16 relations.

**Exit:** at least one complete Blueprint can be understood, previewed, and traced to evidence.

## Phase 18 — Notes and editorial graph

**Goal:** activate the connective publishing layer only when it deserves a public index.

Content gate:

- At least five substantive published Notes.
- More than one author or a clear editorial reason for a single-author launch.
- Coverage across at least three pillar entries.
- No sequence of announcement-only posts.

Work:

- Implement Notes index, article view, author resolution, relations, metadata, and feeds.
- Add reciprocal “Engineering notes” links within relevant pillar narratives.
- Add Notes to public search and sitemap.
- Replace Services with Notes in the visible nav only after real-width navigation validation.

**Dependencies:** enough published content; public author-resolution contract.

**Exit:** Notes functions as connective engineering knowledge, not an empty blog shell.

## Phase 19 — Engineering Profiles and About

**Goal:** connect people to engineering evidence without creating résumés or inferred credit.

Content gate per Profile:

- Published public Team record and published Profile.
- Two meaningful evidence links.
- One substantive Document role.
- Current overview, identity, and exploration.

Work:

- Implement About's roster stage and Founder Modules.
- Implement `/engineering` and Profile detail.
- Resolve populated Document roles selectively.
- Implement About → Profile continuity and reduced-motion behavior.
- Link Notes by explicit authorship.
- Do not name contributors on other content until Studio has an explicit contributor relation.

**Dependencies:** Phase 18 author resolution; qualifying content.

**Exit:** Team members with and without Profiles both have complete, honest public states.

## Phase 20 — Home

**Goal:** compose the complete system into the time-based narrative.

Work:

- Implement the seven narrative chapters in `PUBLIC_NARRATIVE.md`.
- Curate one featured Build, one client evidence passage, one Blueprint/deployed artifact, and one current Lab/Note pair.
- Implement four-pillar orientation and real relationship paths.
- Add the people/principles bridge and final contextual actions.
- Establish recency fallback rules for homepage current-state content.
- Validate 5-second, 30-second, 2-minute, and 10-minute comprehension with real users or structured review.

**Why late:** the homepage can only be composed honestly after its destination surfaces, content quality, and relationship behavior exist.

**Dependencies:** Phases 15–19, with Notes/Profile chapters omitted cleanly if their gates are not met.

**Exit:** every homepage promise resolves to a complete destination and real evidence.

## Phase 21 — Services and Contact

**Goal:** convert qualified understanding without allowing services to dominate identity.

Work:

- Implement evidence-led Services.
- Require evidence links and state boundaries plainly.
- Implement Contact → Leads with source/context capture, privacy, abuse protection, error recovery, and honest response timing.
- Preserve originating evidence context in the contact experience.
- Add confirmation behavior from `MOTION_GUIDELINES.md`.

**Dependencies:** Work/Build/Blueprint/Lab evidence; existing Leads Studio workflow.

**Exit:** every published Service is proven and every contact state is accessible, secure, and explicit.

## Phase 22 — Search and discovery hardening

**Goal:** make the complete public body findable without creating a parallel content system.

Work:

- Complete collection-driven public search for published routes, Team/Profile identities, Services, and Taxonomy.
- Validate result language, type, state, and keyboard behavior.
- Validate metadata, structured data, canonical URLs, sitemap, feeds, robots, breadcrumbs, and internal links.
- Add lightweight metadata indexing first; defer full Document-body search until evidence shows a need.
- Test archived/unpublished removal across all discovery surfaces.

**Dependencies:** all launch collections.

**Exit:** no important public entry is orphaned, duplicated, mislabeled, or discoverable after unpublishing.

## Phase 23 — Public verification and release

**Goal:** complete the HubZero lifecycle before launch.

Passes:

1. Engineering review.
2. Design review.
3. Mobile Experience review.
4. Product Polish review.
5. Accessibility audit with keyboard and assistive technology.
6. Reduced-motion audit.
7. Performance profiling with real media/content and mid-range mobile hardware.
8. SEO/discoverability verification.
9. Privacy/security review for Contact, public DTOs, and unpublished content.
10. Canonical release checklist.

**Exit:** all applicable findings resolved; content owners approve every published artifact; release is explicitly approved.

## Cross-phase workstreams

### Content

- Real-content audit and editorial review run before and alongside templates.
- Content gaps block publication of that entry; they do not get filled with fabricated placeholders.
- Homepage curation is a maintained editorial responsibility after launch.

### Accessibility and motion

- Every motion pattern ships with its reduced-motion version in the same change.
- Keyboard, focus restoration, route announcements, touch targets, and reading order are acceptance criteria in every phase.

### Performance

- Server rendering remains the default.
- Client behavior is scoped to interactions that require it.
- Document blocks do not hydrate merely for entrance effects.
- Images reserve dimensions and use the Cloudinary/Next delivery pipeline.

### Observability

Future analytics should answer architectural questions without becoming surveillance or vanity reporting:

- Which relationship paths are used?
- Do visitors reach Builds/Labs as well as Work?
- Which evidence contexts lead to Contact?
- Where does search fail to produce a useful result?

Analytics implementation requires a separate privacy-aware decision; it is not implied by this roadmap.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Public design begins around incomplete content | Phase 13 audit and per-type gates |
| Products remain secondary despite stated identity | Build/Lab vertical slice precedes Work/Home/Services |
| Relationship UI becomes generic recommendations | Typed vocabulary and reciprocal query contract |
| Engineering identity becomes decoration | Every motif requires a real data source |
| Notes launches as a thin blog | Five-note, multi-pillar content gate |
| Profiles become résumés | Earned eligibility and evidence-first composition |
| Navigation becomes too dense | Notes replaces Services; validate with real text before change |
| Motion harms performance/accessibility | Static equivalence, reduced motion, ≤500ms budget, per-phase QA |
| Public attribution is inaccurate | Never infer credit from `createdByUserId` |
| Global copy becomes hard to maintain | Keep handcrafted initially; design a typed settings model only when recurring editorial need is proven |

## Explicit non-goals

- No public page or component implementation in Phase 12.
- No Studio schema changes as part of design documentation.
- No global page builder.
- No fabricated content, metrics, clients, or profiles.
- No visual redesign of Studio.
- No public analytics, newsletter, careers, pricing, or account system without a separate product decision.
