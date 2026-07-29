# Documentation

This directory contains HubZero's engineering, design, and product documentation. It is organized by purpose rather than by when a document was written.

| Directory | Contents |
|---|---|
| [`architecture/`](architecture) | The data model, CMS product design, and public read contracts the codebase implements today. |
| [`design/`](design) | The design system, motion, and visual identity language the interface follows. |
| [`product/`](product) | Public-facing information architecture, narrative strategy, and content-model documentation. |
| [`operations/`](operations) | Production trust boundaries, security posture, and operational limitations. |
| [`releases/`](releases) | Permanent historical records of completed releases — why they were built the way they were, not just what shipped. |

## Architecture

- [`PLANNING.md`](architecture/PLANNING.md) — The canonical Studio data model: collections, relationships, the Document Engine, publishing workflow, and role capabilities. Cited throughout `src/` by section number.
- [`CMS_PRODUCT_DESIGN.md`](architecture/CMS_PRODUCT_DESIGN.md) — The Studio CMS product layer built on top of `PLANNING.md`: navigation, dashboard, editing, media, search, and permissions.
- [`PUBLIC_DATA_LAYER.md`](architecture/PUBLIC_DATA_LAYER.md) — The canonical read architecture between Studio and every public HubZero surface.
- [`PUBLIC_DTO_SPECIFICATION.md`](architecture/PUBLIC_DTO_SPECIFICATION.md) — The field-level contract for public read objects derived from Studio records.
- [`VISIBILITY_RULES.md`](architecture/VISIBILITY_RULES.md) — The single fail-closed visibility predicate used by every public consumer.
- [`RELATIONSHIP_AUDIT.md`](architecture/RELATIONSHIP_AUDIT.md) — Canonical relationship kinds, storage direction, and reciprocal public behavior between collections.
- [`ADR_PHASE_1_DEFERRALS.md`](architecture/ADR_PHASE_1_DEFERRALS.md) — Why v2.5 Phase 1 deferred jsdom/Testing Library and `chain.ts`, and the conditions under which each should be introduced.
- [`ADR_PHASE_2_COMPOSITION_SCOPE.md`](architecture/ADR_PHASE_2_COMPOSITION_SCOPE.md) — Why v2.5 Phase 2 built different composition primitives than originally planned, a spacing bug the audit caught before shipping, and why adoption is scoped to three files.
- [`ADR_PHASE_3_EVIDENCE_GRAPH.md`](architecture/ADR_PHASE_3_EVIDENCE_GRAPH.md) — How v2.5 Phase 3 extracted the Evidence Graph into a platform primitive (`EvidenceGraph`), added its first hover/focus interaction layer (`EvidenceGraphFocusSync`), and the scoped jsdom/Testing Library introduction that required.
- [`ADR_PHASE_4_ENGINEERING_PROFILE_REBUILD.md`](architecture/ADR_PHASE_4_ENGINEERING_PROFILE_REBUILD.md) — How v2.5 Phase 4 removed six-times-duplicated hero/document/gallery/evidence blocks from the five founder compositions by adopting primitives that already existed, introducing no new infrastructure.
- [`ADR_PHASE_5_HOMEPAGE_REBUILD.md`](architecture/ADR_PHASE_5_HOMEPAGE_REBUILD.md) — How v2.5 Phase 5 found the homepage already well-composed, closed one real `EvidenceGraphFocusSync` adoption gap (correcting an inaccurate Phase 3 claim), and added a truthful `publishedRecordCount` opening statistic with zero new queries.
- [`ADR_PHASE_6_TRACE.md`](architecture/ADR_PHASE_6_TRACE.md) — How v2.5 Phase 6 (Trace) found the existing layered graph layout already renders a causal chain correctly with no new layout module, added one backward-chain projection (`trace-projection.ts`) and one optional `EvidenceGraph` prop, and wired it into Work detail pages.
- [`ADR_PHASE_7_LEDGER.md`](architecture/ADR_PHASE_7_LEDGER.md) — How v2.5 Phase 7 (Ledger) audited every collection for a trustworthy editorial date, found only Note and Lab qualify, and built the `/ledger` timeline entirely from existing queries and the `EditorialCard` row primitive with zero new persistence.
- [`ADR_PHASE_8_COLLECTIONS_DISCOVERY.md`](architecture/ADR_PHASE_8_COLLECTIONS_DISCOVERY.md) — How v2.5 Phase 8 audited all six public collections against Phases 2–7's primitives, closing five real gaps (missing nav entry, missing Ledger cross-links, a duplicated capped-relationship-list pattern, five collections missing `EvidenceGraph`, Trace missing from Lab) without adding any new rendering pattern.
- [`EXPERIENCE_V3_PROGRESS.md`](architecture/EXPERIENCE_V3_PROGRESS.md) — The canonical, in-repo log of what Experience v3 has shipped, milestone by milestone. Read this for current project stage instead of relying on conversation memory.

## Design

- [`DESIGN_SYSTEM.md`](design/DESIGN_SYSTEM.md) — The canonical specification for HubZero's product design language.
- [`MOTION_GUIDELINES.md`](design/MOTION_GUIDELINES.md) — The public motion system: what animates, why, and within what budget.
- [`ENGINEERING_IDENTITY.md`](design/ENGINEERING_IDENTITY.md) — The visual language behind each founder's engineering motif.

## Product

- [`PUBLIC_EXPERIENCE.md`](product/PUBLIC_EXPERIENCE.md) — The public site's experience strategy, chapter by chapter.
- [`PUBLIC_INFORMATION_ARCHITECTURE.md`](product/PUBLIC_INFORMATION_ARCHITECTURE.md) — Public destinations, navigation, and Studio-to-public mapping.
- [`PUBLIC_NARRATIVE.md`](product/PUBLIC_NARRATIVE.md) — The public storytelling strategy and content promise.
- [`ENGINEERING_PROFILES.md`](product/ENGINEERING_PROFILES.md) — What an Engineering Profile is, how it differs from a Team record, and how it is earned.

## Operations

- [`AI_AUTHORING_SECURITY.md`](operations/AI_AUTHORING_SECURITY.md) — Trust boundaries, validation, and rate-limiting for the AI authoring feature in production.
- [`ENGINEERING_BOOTSTRAP.md`](operations/ENGINEERING_BOOTSTRAP.md) — The canonical engineering startup sequence: required reading order, skill discovery, working assumptions, and a pre-implementation checklist. Run this at the start of every session.
- [`ENGINEERING_SKILLS_ROADMAP.md`](operations/ENGINEERING_SKILLS_ROADMAP.md) — Classification of every current `.claude/skills` / `.agents/skills` skill (Core, Specialized, Obsolete, candidate for consolidation) and the named gaps in that library relative to this repository's actual engineering work.

## Releases

- [`EXPERIENCE_V3_RELEASE_RECORD.md`](releases/EXPERIENCE_V3_RELEASE_RECORD.md) — The canonical historical record of Experience v3: why it was built the way it was, what decisions future contributors must preserve, and what it hands off to whatever comes next.
