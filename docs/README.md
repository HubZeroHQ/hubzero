# Documentation

This directory contains HubZero's engineering, design, and product documentation. It is organized by purpose rather than by when a document was written.

| Directory | Contents |
|---|---|
| [`architecture/`](architecture) | The data model, CMS product design, and public read contracts the codebase implements today. |
| [`design/`](design) | The design system, motion, and visual identity language the interface follows. |
| [`product/`](product) | Public-facing information architecture, narrative strategy, and content-model documentation. |
| [`operations/`](operations) | Production trust boundaries, security posture, and operational limitations. |

## Architecture

- [`PLANNING.md`](architecture/PLANNING.md) — The canonical Studio data model: collections, relationships, the Document Engine, publishing workflow, and role capabilities. Cited throughout `src/` by section number.
- [`CMS_PRODUCT_DESIGN.md`](architecture/CMS_PRODUCT_DESIGN.md) — The Studio CMS product layer built on top of `PLANNING.md`: navigation, dashboard, editing, media, search, and permissions.
- [`PUBLIC_DATA_LAYER.md`](architecture/PUBLIC_DATA_LAYER.md) — The canonical read architecture between Studio and every public HubZero surface.
- [`PUBLIC_DTO_SPECIFICATION.md`](architecture/PUBLIC_DTO_SPECIFICATION.md) — The field-level contract for public read objects derived from Studio records.
- [`VISIBILITY_RULES.md`](architecture/VISIBILITY_RULES.md) — The single fail-closed visibility predicate used by every public consumer.
- [`RELATIONSHIP_AUDIT.md`](architecture/RELATIONSHIP_AUDIT.md) — Canonical relationship kinds, storage direction, and reciprocal public behavior between collections.
- [`ADR_PHASE_1_DEFERRALS.md`](architecture/ADR_PHASE_1_DEFERRALS.md) — Why v2.5 Phase 1 deferred jsdom/Testing Library and `chain.ts`, and the conditions under which each should be introduced.

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
