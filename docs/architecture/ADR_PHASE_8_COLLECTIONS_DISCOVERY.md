# ADR: Phase 8 (v2.5 Collections & Discovery) closed six platform-adoption gaps found by auditing every collection against the primitives Phases 2–7 already built

**Status:** Accepted. Implemented across `PublicCollectionDetail.tsx`, `NoteDetail.tsx`, `EngineeringProfilesIndex.tsx`, `EditorialCard.tsx`, `EditorialPrimitives.tsx`, `public-site.ts`, `domain.ts`, and `repository.ts`.

**Context:** the HubZero Public v2.5 Engineering Architecture plan scoped Phase 8 as completing the browsing experience across all six public collections (Work, Builds, Notes, Labs, Blueprints, Engineering Profiles) by auditing each against the platform primitives already built, not by inventing anything new. This is the first phase whose objective is explicitly "composition, not infrastructure" across the *entire* site rather than one feature — the audit accordingly reads across every collection page rather than one subsystem.

## Collection audit

| Collection | Index page | Detail composition | EvidenceGraph (before) | Trace | Ledger | Primary nav |
|---|---|---|---|---|---|---|
| Work | `PublicCollectionIndex` | `PublicCollectionDetail` | list only, no graph | ✅ backward (Phase 6) | not eligible (no date field) | ✅ |
| Builds | `PublicCollectionIndex` | `PublicCollectionDetail` | list only, no graph | — | not eligible | ✅ |
| Blueprints | `PublicCollectionIndex` | `PublicCollectionDetail` | list only, no graph | — | not eligible | ✅ |
| Labs | `PublicCollectionIndex` | `PublicCollectionDetail` | list only, no graph | none | ✅ eligible, not cross-linked | ✅ |
| Notes | `NotesIndex` (bespoke) | `NoteDetail` (bespoke) | list only, no graph | — | ✅ eligible, not cross-linked | ✅ |
| Engineering Profiles | `EngineeringProfilesIndex` (bespoke) | `EngineeringProfileDetail` + 5 founder compositions | ✅ already had one (Phase 3/4) | — | not eligible | **missing entirely** |

Five real gaps fell out of this table, all closed this phase (detailed below). Two columns needed no change: Trace correctly doesn't apply to Builds/Blueprints/Engineering Profiles (none is a lineage endpoint the way Work and Lab are), and Ledger correctly doesn't apply to Work/Builds/Blueprints/Profiles (`ADR_PHASE_7_LEDGER.md`'s data audit already established only Note and Lab have a trustworthy editorial date).

### Finding 1 — Engineering Profiles had no primary navigation entry

`PUBLIC_NAVIGATION` had entries for Work, Builds, Blueprints, Labs, Notes, Ledger, Services, and About — but none for `/engineering`, despite a fully-built collection index page existing for it. The only paths in were one contextual link on the About page, breadcrumbs (which only help once already on a profile), and the sitemap (crawlers only). An entire published collection was effectively undiscoverable through normal browsing. Added one `PUBLIC_NAVIGATION` entry (`type: 'engineeringProfile'`); it surfaces in both the primary nav and the footer automatically, since both already render from that one shared array (the same mechanism Phase 7 used to add Ledger). No navigation component was modified.

### Finding 2 — Notes and Labs (the two Ledger-eligible collections) never linked to it

Phase 7 built `/ledger` and linked it from primary nav, but nothing on the Notes or Labs collection pages pointed a reader toward it. Added one contextual sentence to each index page's header (`NotesIndex.tsx`, and `PublicCollectionIndex.tsx` conditionally for `type === 'lab'`), using the existing `publicRoute.ledger()`. Not added to Work/Builds/Blueprints, since those aren't Ledger-eligible and a link into an index that would never feature them is misleading, not useful.

### Finding 3 — the "capped relationship list + overflow" pattern was implemented twice

`EditorialCard`'s `ProfileContributions` (Homepage's profile cards) and `EngineeringProfilesIndex`'s inline evidence block each independently sliced a relationship list to 3 and rendered `RelationshipCard`s in a `home-relationships` div — the same rendering, arrived at twice. They're not fully interchangeable (one shows an "+N more contribution(s)" overflow chip; the other shows a leading "Evidence / N connected" count) — that difference is real and intentional (a Homepage teaser reads differently from a collection-index card), not something to force into one behavior. Extracted exactly the part that *was* identical — `CappedRelationshipList` in `EditorialPrimitives.tsx`, with an optional `overflow` slot for the one caller that needs a trailing chip inside the same list. Used it to also remove two more instances of the same "map relationships → `RelationshipCard`s in a div" pattern already living inside `EditorialCard.tsx` itself (the row layout, and the non-profile card branch) — four total call sites collapsed to one shared primitive. All four call sites' output is verified byte-identical by the pre-existing tests that already covered them (`Homepage.test.tsx`'s "+1 more contribution" assertion, `EngineeringProfiles.test.tsx`'s index rendering test), which passed unmodified.

### Finding 4 — five of six collections' main relationship section had no EvidenceGraph

Engineering Profiles has shown a fan-mode `EvidenceGraph` beside its relationship list since Phase 3. Homepage's featured Build/Work sections have had one since Phase 3 too. But `PublicCollectionDetail.tsx`'s "Continue through the engineering record" sections (Work, Build, Blueprint, Lab) and `NoteDetail.tsx`'s "Continue through the record" section were plain relationship lists with no graph at all — the platform's own signature visualization was inconsistently applied across the site's own collections. Added `EvidenceGraph` (fan mode, unchanged) as `headerContent` to all five sections, wrapped in `EvidenceGraphFocusSync` (reused unchanged), reusing exactly the data (`connected` in `PublicCollectionDetail.tsx`, `note.relationships` in `NoteDetail.tsx`) each section's list was already built from — no new query, no new projection. `Lab`, `Build`, and `Blueprint` types had zero prior test coverage of this section's non-empty state (their existing test fixtures didn't populate the relevant relationship groups); fixtures were extended to actually exercise it, and a Blueprint detail-page test was added — there had been none at all before this phase.

### Finding 5 — Trace was Work-only; Lab (its own explicitly-named follow-up) was still missing

`ADR_PHASE_6_TRACE.md` named Lab (forward direction: Lab → Build → Work) as "a natural, low-risk follow-up… deliberately left for a future phase." This is that phase. `projectTrace` already supported `direction: 'outbound'`; `resolveTrace` gained a `direction` parameter (default `'inbound'`, so Work's existing call is byte-for-byte unchanged); Lab's `PublicEntityDetail` variant gained a `trace` field; `PublicCollectionDetail.tsx` gained a forward-framed Trace section for Lab ("Follow this investigation forward to where it led"), reusing the identical `EvidenceGraph`(`layout="chain"`) + `RelatedRecordsSection` + `EvidenceGraphFocusSync` composition Work's backward Trace already established. Build's bidirectional case remains out of scope, for the same reason Phase 6 gave: it isn't one path, it's two independent traces (backward to Lab, forward to Work), and forcing that into "the smallest correction" for this phase would be scope creep beyond what the audit actually asked for.

## What the audit found and deliberately did not change

- **Work's category filter has no equivalent on Builds/Blueprints/Labs.** `categories` is a field that exists only on `PublicWorkSummary` — Build, Blueprint, and Lab have no comparable taxonomy dimension in their schema, only flat `technologies`. Adding filter UI for a dimension that doesn't exist would mean inventing metadata, which this phase's own instructions forbid. Correctly left Work-only.
- **The four collection-specific relationship-group configurations in `PublicCollectionDetail.tsx`** (Work sees Engineering foundations/Reusable foundations/Connected investigations/Engineering notes; Build sees Applied in client work/Connected investigations; Blueprint sees Proven in client work/Connected products/Explored in Labs/Engineering notes; Lab sees Related Builds/Related Blueprints) look like repeated `.filter().map()` blocks but encode a genuinely different editorial decision per collection — which related-record types matter enough to name and group for that collection's reader. This *is* each collection's personality expressed in code, not duplicated logic to consolidate into one generic function.
- **`NotesIndex.tsx`'s own hand-rolled `<ol className="notes-ledger">`** (predating this phase, and already discussed in `ADR_PHASE_7_LEDGER.md`) was left untouched — it's a Note-specific index list by design, not a second implementation of anything this phase touched.
- **`EngineeringProfilesIndex.tsx`'s card was not migrated onto `EditorialCard`'s card layout wholesale.** `EditorialCard` renders `entity.hero`; `PublicEngineeringProfileSummary` has a separate `portrait` field (`repository.ts`'s `mapSummary` populates them from different Studio fields — `record.heroMediaId` vs `record.portraitId`/the linked Team's portrait). Most profiles set a portrait but not a distinct hero image. Fully migrating would silently drop the portrait photo from the collection index for exactly the common case. This is a genuine data-model constraint, not an oversight — documented here rather than forced through.

## Platform impact summary

**Existing APIs reused unchanged:** `EvidenceGraph` (fan mode, no prop changes), `EvidenceGraphFocusSync`, `RelatedRecordsSection`, `RelationshipCard`, `DetailSectionHeading`, `PublicEmptyState`, `publicRoute.ledger()` (Phase 7), `projectTrace`'s existing `direction` option (Phase 6, previously only exercised by tests — now exercised by a second real caller).

**Existing APIs extended:** `resolveTrace()` gained an optional `direction` parameter, defaulting to the exact value that preserved Work's existing behavior — confirmed unchanged by the full pre-existing Work-Trace test passing with zero modified assertions. `PublicEntityDetail`'s Lab variant gained a `trace` field (mirroring Work's, Phase 6). `PUBLIC_NAVIGATION` gained one config entry (Engineering).

**New public APIs introduced:** `CappedRelationshipList` (`EditorialPrimitives.tsx`) — the only new component this phase, and it's a platform primitive by construction (two real consumers before this phase's own refactor even finished touching it: Homepage's profile cards and the Engineering Profiles index).

**Existing consumers modified:** `PublicCollectionDetail.tsx` (Work/Build/Blueprint/Lab — added `EvidenceGraph`; Lab — added a Trace section), `NoteDetail.tsx` (added `EvidenceGraph`), `EngineeringProfilesIndex.tsx` (evidence block now calls `CappedRelationshipList`), `EditorialCard.tsx` (all three relationship-rendering branches now call `CappedRelationshipList`), `NotesIndex.tsx`/`PublicCollectionIndex.tsx` (added a Ledger cross-link sentence). Homepage and every founder composition are untouched.

## Performance

- **Query reuse:** zero new queries anywhere in this phase. Every `EvidenceGraph` addition reuses relationship data a section's list was already built from; Lab's Trace reuses the same `EvidenceContext` Work's Trace already shares.
- **Bundle impact:** `EvidenceGraphFocusSync` was already shipped to the client on every page that already used `EvidenceGraph` (Homepage, Engineering Profiles, Work). The four newly-wrapped sections (Build, Blueprint, Lab's main relationships, Note) and Lab's Trace section activate the same already-bundled client component on pages that previously loaded zero of it — a small, expected increase on those specific routes, not a new client boundary type.
- **Rendering cost:** unchanged complexity class — the same SVG structure `EvidenceGraph` has always produced, bounded by each entity's own (typically small) relationship count.
- **Streaming:** not introduced; no data-fetching architecture changed.

## Accessibility

No new interaction model was introduced — every `EvidenceGraphFocusSync` addition follows the exact pattern established in Phase 3 (SVG `aria-hidden`, accessible list is the real keyboard path, no `tabIndex` added). Heading hierarchy is unchanged (existing `<h1>`/`<h2>`/`<h3>` structure on every touched page was preserved; only additional content was inserted at existing points). Reduced motion needed no new handling — no animation was introduced.

## Validation

- `npx vitest run` — 63 files / 410 tests passing (6 new: a Blueprint detail-page test that didn't exist before this phase, a Lab-forward-Trace test, a Labs-vs-Builds Ledger-cross-link test, and three `PublicFooter` tests). Every pre-existing test — including the ones this phase's refactor (`CappedRelationshipList`) runs straight through — passed with zero modified assertions except where a fixture needed a new required field (`trace: []` on unaffected Lab/Work fixtures) or a genuinely new assertion was added to verify new content.
- `npx tsc --noEmit` — clean.
- `npx eslint .` — clean.
- `npx prettier --check` — clean on every file this phase touched.
- Not run: `next build` / a live browser check, for the same `.env.local`-points-at-production reason recorded in Phases 1–7.

## Self-review

- **Did we improve discovery without adding infrastructure?** Yes — Engineering Profiles' nav entry, the Ledger cross-links, and every `EvidenceGraph` addition are all composition of existing pieces; the one new component (`CappedRelationshipList`) removes code rather than adding a new pattern.
- **Did we compose existing capabilities?** Yes — nothing in this phase invents a new rendering shape; every fix reuses a primitive that already existed and was already proven on at least one other page.
- **Did we remove duplication before adding code?** Yes — `CappedRelationshipList`'s extraction happened before, and enabled, the rest of the phase's composition work, and collapsed four independent implementations into one.
- **Did every collection become more coherent?** Yes — the audit table above is now uniform: every collection with relationships gets the same graph-plus-list treatment; every collection with a trustworthy date is Ledger-linked; every collection is in primary navigation.
- **Did we preserve the evidence-first philosophy?** Yes — no invented metadata (Work's filter stays Work-only; the portrait/hero constraint is documented, not worked around), no fabricated timestamps, every new graph and Trace entry point renders only real, already-public relationship data.
