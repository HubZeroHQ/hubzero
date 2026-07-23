# ADR: Phase 2 (v2.5 Page Composition) built different primitives than planned, and adopted them narrowly

**Status:** Accepted. Implemented in the "extract detail-page composition primitives" change (`DetailSectionHeading`, `RelationshipGroup` in `EditorialPrimitives.tsx`; `RelatedRecordsSection.tsx`; `DetailGallery.tsx`).

**Context:** the HubZero Public v2.5 Engineering Architecture plan's Phase 2 named a specific set of composition primitives to extract — `Hero`, `EditorialSection`, `EvidenceSection`, `QuoteSection`, `ArtifactSection`, `MediaSection`, `TimelineSection`, `RelationshipSection` — based on the creative review's read of the *rendered* site. Auditing the actual source before writing code showed a different picture, and a real bug was found and fixed mid-implementation. Both are recorded here.

## Decision 1 — Different primitives than the architecture doc named

**Original proposal:** extract `Hero`, `EditorialSection`, `MediaSection`, and `RelationshipSection` from "the five already-duplicated collection pages."

**Actual implementation:** the five collection index pages (Work/Builds/Blueprints/Labs) already share one component, `PublicCollectionIndex` — there was no hero duplication to extract there. The real, present duplication was elsewhere: a `RelationshipGroup` component defined identically in three separate files (`profile-shared.tsx`, `NoteDetail.tsx`, and twice more inline in `PublicCollectionDetail.tsx`), a "media/evidence gallery" block reimplemented four times, and a section-heading shape (`eyebrow` + `h2` + optional description) repeated roughly fifty times site-wide. Built `DetailSectionHeading`, `RelationshipGroup` (moved, not duplicated), `RelatedRecordsSection`, and `DetailGallery` instead — named for what they actually do, not for the architecture doc's a priori guess.

**Reason for deviation:** the architecture doc was written from a review of the *rendered* site (Phase 1 of this project), before reading the component source. "Every collection page looks the same" turned out to already be well-composed at the code level in some places (collection index) and genuinely duplicated in others the doc hadn't named (relationship groups, galleries). The audit step this phase's own instructions required — auditing before assuming — is what surfaced the difference.

**Why this reduces maintenance:** building the originally-named primitives would have meant either forcing them onto code that didn't actually repeat (manufacturing an abstraction with one real caller) or leaving the actual, literal triplicated `RelationshipGroup` untouched. Naming primitives after what's really duplicated means every one of them has multiple real call sites today, not a hoped-for future one.

## Decision 2 — `DetailSectionHeading`'s class is opt-in, not a hardcoded default

**What happened:** the first version of `DetailSectionHeading` hardcoded `className="detail-section-header"`. Before adopting it anywhere, cross-referencing `globals.css` showed this was wrong: some header call sites (`BlueprintSpecification`, `LabProgress`, all four galleries) already carried that exact class and its `gap`/`margin-bottom` spacing — but others (every relationship-section header, every document-body header, every profile chapter header) were always a *bare* `<header>`, with spacing owned entirely by the surrounding `*-grid` container's own `gap`. A hardcoded default would have added real, unplanned `margin-bottom` (clamp 40–64px) to the second group, stacking on top of spacing they already had from their parent grid.

**Fix:** `className` is a plain optional prop with no default. Callers that originally had the class pass it explicitly (`DetailGallery` always does; `BlueprintSpecification`/`LabProgress` do); callers that were always bare pass nothing, rendering an unstyled `<header>` exactly as before.

**Why this matters beyond this one component:** it's a general lesson for every future primitive extraction in this codebase — a shape that's visually repeated is not necessarily *styled* identically underneath it, and the only way to know is to check the CSS each call site's original markup actually matched, not assume the most common case applies everywhere.

## Decision 3 — Adoption scoped to three files, not every call site the pattern applies to

**Confirmed by grep:** the same eyebrow/heading shape also appears in all five founder composition files (`RifaqueComposition.tsx` and siblings) and in `NotesIndex.tsx`/`EngineeringProfilesIndex.tsx`.

**Decision:** this phase adopts the new primitives only in `PublicCollectionDetail.tsx`, `NoteDetail.tsx`, and `EngineeringProfileDetail.tsx` (the generic template) — not in the five founder compositions or the two index files.

**Reason:** the founder compositions are bespoke, actively-iterated files (one had just changed in a parallel commit while this phase was underway). Migrating all five in the same change as introducing a brand-new primitive multiplies the surface area for a visual regression for no corresponding gain — none of them share code with each other or with the files this phase touched.

**Introduce it when:** adopting `DetailSectionHeading` in a founder composition or an index page is a mechanical, low-risk follow-up once this phase has shipped and the primitive has a production track record — verify each site's original header against `globals.css` first, the same way this phase did, rather than assuming the pattern is safe by inspection alone.
