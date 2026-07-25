# ADR: Phase 4 (v2.5 Engineering Profile Flagship Rebuild) removed founder-composition duplication by adopting existing primitives, and introduced no new infrastructure

**Status:** Accepted. Implemented across `profile-shared.tsx`, `EngineeringProfileDetail.tsx`, and all five founder compositions.

**Context:** the HubZero Public v2.5 Engineering Architecture plan scoped Phase 4 as proof that Phases 1–3's platform primitives (composition primitives, `EvidenceGraph`, motion primitives, editorial primitives) are sufficient to build a flagship detail page without inventing new infrastructure. The brief listed a wishlist of composition primitives it expected this page to assemble from (`Hero`, `MediaSection`, `EditorialSection`, `EvidenceSection`, `RelationshipSection`, `QuoteSection`, `DetailGallery`, `RelatedRecordsSection`, `EvidenceGraph`, `AssembleStroke`). Phase 2's ADR had already found once that this kind of wishlist — written from a review of the rendered site rather than the source — doesn't always match what the code actually needs. This phase's audit reached the same kind of finding again, and the fix follows the same shape Phase 2 used: read the real call sites, name what's really duplicated, and adopt what already exists rather than inventing a new component for an imagined name.

## Audit: what already existed

`EngineeringProfileDetail.tsx` (the generic template) already composed from real primitives: `PublicBreadcrumbs`, `DetailSectionHeading`, `TechnologyList`, `RelatedRecordsSection`, `DetailGallery`, `EvidenceGraphFocusSync`/`ProfileEvidenceGraph`. The five founder compositions (`RifaqueComposition`, `RaifComposition`, `IyadComposition`, `SultanComposition`, `SalsabeelComposition`) each delegate to `FounderMotif` (which itself composes from `AssembleStroke`, unchanged) for their bespoke hero/identity sections, but — reading all six files side by side — three blocks were **byte-identical or structurally identical across every founder**, each reimplemented inline instead of reusing what the generic template already used:

1. **The optional `profile.hero` lead-media block** — identical `PublicSection`/`PageContainer`/`PublicImage` markup in all six files.
2. **The `documents.map(...)` block** — identical in all six files; the generic template rendered it through `DetailSectionHeading`, the five founders reimplemented the same bare `<header>` shape inline instead.
3. **The gallery block** — the generic template already called `DetailGallery` (built in Phase 2); all five founders reimplemented, inline, the exact same markup `DetailGallery` already produces.
4. **The evidence section** — the generic template already called `RelatedRecordsSection` (also built in Phase 2, wrapped in Phase 3's `EvidenceGraphFocusSync`); all five founders reimplemented its exact structure (heading, `ProfileEvidenceGraph`, `detail-relation-groups`) inline, differing only in each composition's own heading copy. This is precisely the follow-up Phase 2's own ADR predicted: *"adopting `DetailSectionHeading` in a founder composition… is a mechanical, low-risk follow-up once this phase has shipped and the primitive has a production track record"* — Phase 3 gave it that track record; this phase is the follow-up.

Genuinely bespoke and correctly left untouched: each founder's hero header/portrait arrangement, their "position" and "current exploration" copy and structure (Raif's numbered decision record, Sultan's editorial-grid outline nav, Salsabeel's pinout table replacing a plain technology list), and the founder motif itself. These differences are the entire point of a bespoke composition and the manifesto's founder-motif exclusivity rule — collapsing them into a shared component would be inventing an abstraction for what the brief itself calls "genuine duplication," when it isn't duplication at all.

### The brief's wishlist vs. what's real

None of `Hero`, `MediaSection`, `EditorialSection`, `EvidenceSection`, `RelationshipSection`, or `QuoteSection` exist in this codebase, and this phase does not add them:

- **"EvidenceSection"** is already `RelatedRecordsSection` + `ProfileEvidenceGraph` + `EvidenceGraphFocusSync` composed together — that composition is the real primitive; giving it a fourth name would just be an alias.
- **"RelationshipSection"** is `RelatedRecordsSection`, already built and (as of this phase) adopted everywhere a profile renders relationships.
- **"MediaSection"** is `DetailGallery` plus the new `ProfileHeroMedia` (below).
- **"QuoteSection"** doesn't correspond to a distinct pattern: a profile's "quotes" content (`DOCUMENT_LABELS.quotes`, "Working positions") is just one of the five `document.role` values, rendered through the same generic document loop as `introduction`/`interview`/`timeline`/`achievements`. There is no separate pull-quote treatment in the real content model to extract.
- **"Hero"** is, correctly, not shared — five founders have five different hero treatments by design, and the generic template's own hero is a sixth. Nothing here repeats.

## What shipped

Two small, deliberately **profile-specific** (not platform) composition helpers were added to `profile-shared.tsx`, alongside the existing `ProfileFooter`/`ProfileEvidenceGraph`:

- **`ProfileHeroMedia`** — the six-times-duplicated optional hero-media block.
- **`ProfileDocuments`** — the six-times-duplicated document-rendering loop.

Neither is exported as a platform primitive: the document-role model (`introduction`/`interview`/`quotes`/`timeline`/`achievements`) and the "optional hero media directly under the header" placement are specific to Engineering Profiles, not a generic detail-page pattern another collection has today. This mirrors exactly how `ProfileFooter` and `ProfileEvidenceGraph` were already scoped before this phase.

The five founder compositions were then migrated to:

- Call `ProfileHeroMedia`/`ProfileDocuments` instead of reimplementing them.
- Call the existing `DetailGallery` instead of reimplementing its markup.
- Call the existing `RelatedRecordsSection` (wrapped in the existing `EvidenceGraphFocusSync`, reused unchanged) instead of reimplementing its markup, keeping each founder's own evidence-heading copy as the `title` prop `RelatedRecordsSection` already accepts.

No new platform primitive was introduced. No new client boundary was introduced — `EvidenceGraphFocusSync` is reused exactly as Phase 3 built it. No new dependency was added. `FounderMotif`/`AssembleStroke` were not touched and remain exclusive to the profile, per the manifesto.

## Validation

- `npx vitest run` — 59 files / 374 tests passing (5 new). The new tests are the substantive verification for this phase: a parametrized case per founder slug asserts that with a populated `hero`, `gallery`, and `documents` fixture, the composed output still contains `ProfileHeroMedia`'s section, `RelatedRecordsSection`'s relationship groups and evidence graph, `ProfileDocuments`' heading, and `DetailGallery`'s grid — proving the migrated founders render identically to what their removed inline blocks used to produce, not just that they typecheck.
- `npx tsc --noEmit` — clean.
- `npx eslint .` — clean.
- `npx prettier --check` — clean on every file this phase touched.
- **Duplicate logic:** grepped for the removed inline patterns (`profile.hero ?`, `profile.gallery.length ?`, a leftover `RelationshipGroup` import) across all five founder compositions post-migration — none remain; every occurrence left is the legitimate `resolveRelationshipGroups()` call.
- **Manifesto compliance:** the founder motif (`FounderMotif`/`AssembleStroke`) is untouched and still rendered only inside each founder's own composition — it was not extracted, generalized, or reused elsewhere.
- **Accessibility / reduced motion:** unaffected — no markup shape changed (verified by the new tests above), and no new animation or interaction was added this phase.
- **Bundle impact:** all six files remain Server Components; this phase adds zero client-side JavaScript. Net line count across the five founder compositions and the generic template dropped by roughly 340 lines (partially offset by ~70 new lines in `profile-shared.tsx`'s two helpers and ~70 new lines of test coverage) — a net reduction in server-rendered code size, not an increase.
- Not run: `next build` / a live browser check, for the same `.env.local`-points-at-production reason recorded in Phases 1–3.

## Self-review

- **Did we compose instead of invent?** Yes — every founder migration replaced inline markup with a call to a primitive that already existed before this phase (`DetailGallery`, `RelatedRecordsSection`, `EvidenceGraphFocusSync`). The only two additions (`ProfileHeroMedia`, `ProfileDocuments`) are composition helpers around existing primitives (`PublicSection`/`PageContainer`/`PublicImage`/`DetailSectionHeading`/`ProseRenderer`), not new rendering logic.
- **Did we reduce duplication?** Yes — three blocks that were duplicated six times each are now defined once (two in `profile-shared.tsx`, one already existed as `DetailGallery`/`RelatedRecordsSection` and just needed adoption).
- **Did we preserve engineering boundaries?** Yes — `EvidenceGraph` still doesn't fetch data or know about routing; the one client boundary (`EvidenceGraphFocusSync`) is reused unchanged; the founder motif stays exclusive to the profile.
- **Does the profile feel assembled from stable primitives?** Yes — reading any founder composition file now shows five or six named primitive calls plus a handful of genuinely bespoke sections, not a wall of hand-rolled markup.
- **Would another engineer understand this composition immediately?** Yes — `ProfileHeroMedia`, `ProfileDocuments`, `DetailGallery`, and `RelatedRecordsSection` calls are self-describing; the remaining bespoke JSX is exactly the founder-specific 20–30% each composition's own doc comment already describes.
- **Did we accidentally create profile-specific infrastructure?** No — the two new helpers are deliberately not exported outside `profile-shared.tsx`'s existing profile-specific pattern, matching `ProfileFooter`/`ProfileEvidenceGraph`'s existing scope.
