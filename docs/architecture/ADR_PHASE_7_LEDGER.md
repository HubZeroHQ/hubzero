# ADR: Phase 7 (v2.5 Ledger) built a truthful chronological view from two entity types, excluding four for lack of a real editorial date

**Status:** Accepted. Implemented in `src/lib/public/ledger-projection.ts`, `getPublicLedger()`, the `Ledger` component, and the `/ledger` route.

**Context:** the HubZero Public v2.5 Engineering Architecture plan scoped Phase 7 as a canonical, chronological activity view of published records, reusing the existing data model wherever possible. Unlike Phases 3–6 (which audited component/rendering duplication), this phase's audit is a data audit: which entities actually have a trustworthy, editorial publication date, and which don't.

## Audit: which entities have a trustworthy publication date

Every collection (`Work`, `Build`, `Blueprint`, `Lab`, `Note`, `EngineeringProfile`) inherits `createdAt`/`updatedAt: Date` from `WithTimestamps` — but **these are not exposed on any public DTO today**, and reaching for them for this phase would be a mistake even though the raw values are real:

- `updatedAt` bumps on every edit, including a copy fix with zero connection to real "activity" — using it would let editorial housekeeping masquerade as engineering progress.
- `createdAt` records when a Studio record was entered, not when the underlying work happened — a record can be authored well after (or, via backfill, well before) the event it describes.

Reading each collection's actual schema (`src/types/studio.ts`) for a genuine, deliberately-curated **editorial** date field found exactly two:

- **`Note.publicationDate: Date`** — required, always present, explicitly named for this purpose. Already surfaced publicly as `PublicNoteSummary.publicationDate`.
- **`Lab.startDate: Date`** (required) plus optional **`lastMajorUpdateAt: Date`**, whose own doc comment already says it's "deliberately curated, distinct from the record's own `updatedAt` (which changes on every trivial edit)" — i.e., a human decision that something worth noting happened, not a side effect of any edit. Already surfaced publicly as `PublicLabSummary.startDate`/`lastMajorUpdate`.

`Work`, `Build`, `Blueprint`, and `EngineeringProfile` have **no editorial date field at all** — `Work.timeline` is free text ("12 weeks", "Q2 2025", "Ongoing" are all valid values in the schema), not a parseable date; `Build.version`/`Blueprint.version` are version strings; none of the four has anything resembling `publicationDate`.

**Conclusion:** Ledger includes only Notes and Labs. This is not an oversight or a first-pass limitation to backfill later — it's the correct, truthful scope given what's actually public today. The exclusion is enforced in exactly one place (`ledger-projection.ts`'s `resolveLedgerDate`, a `switch` with no `default` case for the four excluded types), documented inline, so a future entity joins Ledger by adding one case there once it has a real editorial date field — not by redesigning anything.

**Publication vs. creation:** the brief asked which chronology basis is correct. The answer, given the data available, is neither exactly — it's "the most recent deliberately-curated editorial fact," which for Notes is `publicationDate` and for Labs is `lastMajorUpdate ?? startDate`. That fallback is not new policy invented for this phase: it's the exact expression Homepage's own `currentTimeline` construction (`Homepage.tsx`, Phase 5) already uses for the identical purpose. Reusing it here rather than choosing independently is deliberate — one date-preference rule, not two.

**The smallest correction, for the record:** if a future phase wants Work, Build, or Blueprint in Ledger, the correct fix is adding an explicit editorial date field to that Studio type (mirroring `Note.publicationDate` or `Lab.lastMajorUpdateAt` — a human-set field, distinct from `updatedAt`), then adding one case to `resolveLedgerDate`. Reaching for `updatedAt` instead, even under time pressure, would reintroduce exactly the non-truthful chronology this phase was told to avoid.

## Design: composition, not a new timeline system

- **`ledger-projection.ts`** — a pure, dependency-free module (no `entity-graph`, no traversal — Ledger doesn't need relationships, only dates already resolved by the existing visibility-checked `listSummaries` query). `buildLedger` derives a date per entity, excludes anything without one, and sorts descending with a deterministic title tie-break. `groupLedgerByYear` is a second, separate pure function — grouping over an already-sorted list, not a second sort — used only for the page's year headings.
- **`getPublicLedger()`** (`queries.ts`) composes two already-existing, already-individually-cached calls (`listPublicSummaries('note')`, `listPublicSummaries('lab')`) and runs the result through `buildLedger`. **Zero new database queries, zero new `PublicRepository` methods, zero new cache entries** — the repository's public interface is completely unchanged by this phase.
- **`Ledger.tsx`** reuses `EditorialCard`'s existing `'row'` layout — already the shared "dated ledger entry" primitive Homepage's own Labs/Notes sections use (its own doc comment, written in Phase 5, already anticipated this: *"used where a section wants to read as a chronological record"*) — and the existing `PublicEmptyState`, `PageContainer`/`PublicSection`, and `collection-hero`/`collection-register`/`home-subsection-title`/`home-ledger` CSS classes already used by other collection index pages and Homepage. **Zero new CSS was written for this phase.** The one deliberate presentational choice: each year's entries render inside an `<ol className="home-ledger">` (Homepage's own usage is a plain `<div>`) — order is Ledger's entire organizing principle, so the semantic list is a correct, low-cost improvement specific to this consumer, not a change to Homepage's existing markup.
- **`NotesIndex.tsx`'s own `<ol className="notes-ledger">`** (a Note-only, hand-rolled chronological list, predating this phase) was deliberately left untouched rather than generalized — it's specialized to one type by design, appropriate for the Notes collection's own index page, and touching a merged phase's file without a regression to justify it would violate this phase's own instruction not to revisit prior phases. Two chronological list shapes now coexist for a reason: one is a single-collection index page's own list, the other is Ledger's cross-type canonical view. Neither duplicates the other's actual logic (date derivation, sorting, exclusion) — `NotesIndex` doesn't sort or exclude anything (it receives entries pre-sorted by `listNoteIndexEntries`); Ledger's derivation/sort/exclusion logic exists exactly once, in `ledger-projection.ts`.
- **`TraceGraph`-equivalent mistake avoided:** no new rendering component was created for "a Ledger row" — `EditorialCard` already was one.

## Reachability: `/ledger` route, added to `PUBLIC_NAVIGATION`

The brief requires Ledger to "become the canonical timeline view used by the public site," which means it has to be genuinely reachable, not an orphan route. `publicRoute` gained one new method (`ledger()`); `PUBLIC_NAVIGATION` gained one new entry. This automatically surfaces the link in both the primary pill navigation and the footer's "Record" section, since both already render from that one shared array — no navigation component was modified, and `PUBLIC_NAVIGATION`'s `type` field (used only by the footer to separate "Record" from "Studio" links) isn't constrained to `PublicEntityType` anywhere in the codebase, so adding a `'ledger'` value required no type changes elsewhere (confirmed by a clean `tsc --noEmit`).

## Accessibility and performance

- **Semantic chronology:** each year renders as its own `<section>`/`<h3>`, with entries in a genuine `<ol>` — keyboard and screen-reader traversal follows document order, which is the same order the dates imply. No client-side reordering, filtering, or virtualization exists to diverge from that.
- **No client state:** `Ledger` and every function it calls are Server Components/pure functions. Sorting and grouping happen once, server-side, before the response is sent — there is nothing to hydrate beyond what `EditorialCard`'s own existing (zero) client footprint already requires.
- **Reduced motion:** unaffected — no animation was introduced.
- **Query cost:** two already-cached queries, reused; the additional work is an O(n log n) in-memory sort over however many Notes and Labs are published — trivially fast at any realistic scale, and the same complexity class every other collection index page already pays.
- **Pagination:** not implemented this phase — the current published-record volume (see `publishedRecordCount` from Phase 5) doesn't warrant it yet. If Ledger's entry count grows large enough to matter, the natural extension is a `limit`/cursor parameter on `getPublicLedger()`, not a new architecture.

## Platform impact summary

**Existing APIs reused unchanged:** `listPublicSummaries` (`queries.ts`), `EditorialCard` (including its pre-existing `'row'` layout), `PublicEmptyState`, `PageContainer`/`PublicSection`, `PublicJsonLd`, `createPublicMetadata`, `breadcrumbJsonLd`/`collectionPageJsonLd`, and the `collection-hero`/`collection-register`/`collection-index-header`/`home-subsection-title`/`home-ledger` CSS classes. `PublicRepository`'s interface — every method on it — is untouched.

**Existing APIs extended:** `publicRoute` gained one method (`ledger()`). `PUBLIC_NAVIGATION` gained one config entry (data, not code).

**New public APIs introduced:** `src/lib/public/ledger-projection.ts` (`buildLedger`, `groupLedgerByYear`, `LedgerEntry`, `LedgerYear`); `getPublicLedger()` in `queries.ts`; the `Ledger` component; the `/ledger` route.

**Existing consumers affected:** none. Homepage, Engineering Profiles, `PublicCollectionDetail` (Work/Build/Blueprint/Lab), `NotesIndex`, and search are all untouched — confirmed by the full pre-existing test suite passing with zero modified assertions.

## Validation

- `npx vitest run` — 62 files / 404 tests passing. New: `ledger-projection.test.ts` (9 tests: mixed-type ordering, the Lab date-preference rule in both directions, exclusion of every ineligible type, deterministic tie-breaking, empty/fully-excluded input, determinism across repeated calls, and year-grouping including the empty case) and `Ledger.test.tsx` (4 tests: the empty state, year-grouped ordering across mixed types, the semantic single-`<ol>`-per-year structure, and the header register's real entry/year counts).
- `npx tsc --noEmit` — clean.
- `npx eslint .` — clean.
- `npx prettier --check` — clean on every file this phase touched.
- Not run: `next build` / a live browser check, for the same `.env.local`-points-at-production reason recorded in Phases 1–6.

## Self-review

- **Did Ledger compose existing capabilities?** Yes — every rendering and data-fetching building block already existed; this phase's own code is the derivation/exclusion/grouping logic and the thin route/nav wiring around it.
- **Did we avoid introducing new persistence?** Yes — zero new queries, zero new repository methods, zero new cache entries.
- **Is the chronology truthful?** Yes — every date shown is a real, human-curated editorial fact already public on the entity it describes.
- **Did we avoid fake timestamps?** Yes — `createdAt`/`updatedAt` were considered and explicitly rejected, with the reasoning recorded in code, not just here.
- **Can future entities participate without redesign?** Yes — one `switch` case in `resolveLedgerDate` per newly-eligible type, once that type has a real editorial date field.
- **Did we accidentally duplicate timeline logic?** No — the Lab date-preference rule reuses Homepage's exact existing expression rather than reinventing it; `NotesIndex`'s own list was left alone rather than partially duplicated; `EditorialCard`'s row layout was reused rather than a new renderer built.
