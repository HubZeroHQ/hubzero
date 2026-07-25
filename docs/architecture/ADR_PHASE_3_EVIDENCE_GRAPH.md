# ADR: Phase 3 (v2.5 Interactive Evidence Graph) extracted the fan diagram into a platform primitive and added its first interaction layer

**Status:** Accepted. Implemented in `src/components/public/evidence-graph/` (`EvidenceGraph`, `EvidenceGraphFocusSync`).

**Context:** the HubZero Public v2.5 Engineering Architecture plan scoped Phase 3 as building the reusable public Evidence Graph — a single fan-mode diagram component meant to serve Engineering Profiles today and Homepage, Search, and Trace later — plus migrating the existing Engineering Profile evidence visualization onto it. Phase 1's own ADR ([`ADR_PHASE_1_DEFERRALS.md`](ADR_PHASE_1_DEFERRALS.md)) had already named this phase as the point where jsdom/Testing Library should be introduced, "scoped to that component only." This record is the required audit-before-build step for both decisions.

## Audit: what already existed

Before writing anything, the following were read in full:

- `src/lib/entity-graph/{types,query}.ts` — a general, indexed, immutable graph traversal engine (`createGraphQuery`: `get`/`outbound`/`inbound`/`connected`/`entitiesOfType`/`relationshipsOfKind`/`relationships`/`hasRelationship`). Fully generic, not evidence- or profile-specific.
- `src/lib/public/evidence-projection.ts` (`projectEvidence`) — one-hop traversal + visibility filtering (a `destinations` map of publicly-resolvable entities) on top of that engine. Its input is already a generic `{ type: PublicEntityType; id: string }` subject, not an Engineering-Profile-specific shape.
- `src/lib/graph-layout/layered.ts` (+ `layered.test.ts`) — pure, deterministic fan/tree layout math: `{x, y, width, height}` node positions and elbow-routed edge polylines. Decoupled from React and from data-fetching.
- `src/components/public/EvidenceVisuals.tsx` — the only rendering consumer of the above: `RelationshipGraph` (the SVG fan diagram) and the unrelated `AxisDiagram` (a horizontal stage axis used by Blueprints/Labs/Notes), colocated in one file.
- `RelationshipGraph`'s actual call sites — this is the audit's one substantive finding.

### Finding: `RelationshipGraph` was not Engineering-Profiles-only

The task brief frames Homepage, Search, and Trace as *future* consumers. Reading the real call sites before writing code found this already false for Homepage: `src/components/public/homepage/Homepage.tsx` renders `RelationshipGraph` twice today — once for the featured Build, once for the featured Work item — entirely independently of `ProfileEvidenceGraph`/`profile-shared.tsx`. Both call sites were exercised by `Homepage.test.tsx`, which caught the break immediately once `RelationshipGraph` was removed from `EvidenceVisuals.tsx` during migration (see Validation below). `EvidenceGraph` is therefore not "Engineering Profiles' component made reusable" — it already had two consumers before this phase touched it; Phase 3 is the first time that was made structurally explicit (its own module) rather than incidental (a shared function two features happened to import).

### What was reused unchanged

- `entity-graph/*` — the traversal engine. No public consumer should ever import `GraphQuery` directly; it stays server-side, feeding only pre-shaped projections outward. Nothing in this phase changes that boundary.
- `evidence-projection.ts` — already the correct shape (data-agnostic subject + destinations map + visibility filtering entirely inside the projection). No change needed; it already satisfies "projections own visibility, the graph does not."
- `graph-layout/layered.ts` — the fan layout math. Reused byte-for-byte; this phase does not touch layout algorithms, per its own scope (no `chain.ts`, no new layouts — that stays deferred to Phase 6/Trace per `ADR_PHASE_1_DEFERRALS.md`).

### What was extended

Only the rendering layer. `RelationshipGraph` moved out of the `EvidenceVisuals.tsx` grab-bag (which otherwise holds the unrelated `AxisDiagram`) into its own module, `src/components/public/evidence-graph/`, renamed `EvidenceGraph`, and gained:

1. A `data-evidence-node` attribute on every SVG edge/node, carrying the same `relationshipKey` id already used as the adjacent list's React key.
2. `EvidenceGraphFocusSync`, a new client component (see below) that mirrors hover/focus between the graph and that list.

Nothing about the layout, the SVG markup, or the visual output changed — this is confirmed by `EvidenceGraph.test.tsx` asserting the same summary/label/structure the old `RelationshipGraph` produced, and by the full existing suite (`EngineeringProfiles.test.tsx`, `Homepage.test.tsx`) passing unmodified in behavior (one assertion was updated — see Validation — for an attribute-ordering detail, not a behavior change).

## Design decision: one client component, not a client-ified graph

The brief requires "one source of keyboard focus... the graph reflects focus, it does not own focus... do not invent a second keyboard model," and separately requires minimizing new client boundaries. Three shapes were possible:

1. Make `EvidenceGraph` itself a client component with hover state.
2. Add `tabIndex` to SVG nodes so the graph could track its own focus.
3. Keep `EvidenceGraph` a Server Component and introduce one small, separate client wrapper that only mirrors an id that already exists on both sides.

(2) was rejected outright — it is a second keyboard model, which the brief explicitly forbids and which would let a user tab into a decorative SVG that isn't the canonical link. (1) was rejected because it drags client-side JS into every page that renders the graph even when no interaction handler is needed (e.g., a future consumer that only wants the static diagram). (3) is what shipped, as `EvidenceGraphFocusSync`.

It is deliberately dumb: it does not track "which item is focused" as React state (no re-render on every hover), it does not read or write any data, and it does not add `tabIndex` anywhere. It listens for `pointerover`/`pointerout`/`focusin`/`focusout` bubbling up from its children, resolves the nearest ancestor's `data-evidence-node`, and toggles a `data-evidence-active` attribute directly on every element (list item and/or SVG node) sharing that id — a plain DOM operation, not a state update. Every real interactive element inside it (the `RelationshipCard` `<a>` tags) keeps its native tab order untouched.

Why not pure CSS (`:has()` is already used extensively in this codebase for hover/focus state, e.g. `.home-card:has(a:focus-visible)`)? Because that pattern requires the *ancestor* to test for a *specific* descendant selector — it cannot express "highlight whichever other element shares this element's id," since CSS has no cross-element attribute-value comparison. Doing this for an arbitrary, data-driven relationship count would require generating one CSS rule per relationship id per page. The one small client listener is the smaller, more general solution, and it is the exact scenario `ADR_PHASE_1_DEFERRALS.md` predicted as jsdom's real trigger.

### Why jsdom/Testing Library, scoped

`EvidenceGraphFocusSync` is the first component in this repo with real focus/hover interaction to simulate. `EvidenceGraph.test.tsx` needed no DOM change — it stayed under the existing `environment: 'node'` default, asserting markup via `renderToStaticMarkup` exactly like every other component test in this repo. Only `EvidenceGraphFocusSync.test.tsx` carries a `// @vitest-environment jsdom` file-level pragma, plus `@testing-library/react` and `@testing-library/user-event` as new devDependencies — exactly the scoped introduction `ADR_PHASE_1_DEFERRALS.md` called for, not a switch of the suite's default environment. `@testing-library/jest-dom` was deliberately **not** added; its convenience matchers (`toHaveFocus()`, etc.) were replaced with plain `document.activeElement` comparisons to avoid a third new dependency for a want-not-need.

One real gap surfaced during this addition, not by design: `@testing-library/react`'s automatic per-test DOM cleanup requires `test.globals: true` in Vitest, which `vitest.config.ts` does not set (and this phase does not change, to avoid affecting every other test file's global namespace). Without it, `render()` calls accumulate DOM across tests in the same file. The fix is a plain `afterEach(() => cleanup())` local to `EvidenceGraphFocusSync.test.tsx` — scoped to the one file that needs it, not a config change.

## Migration

`ProfileEvidenceGraph` (`profile-shared.tsx`) is now a thin Engineering-Profile-specific adapter onto `EvidenceGraph` — it shapes `profile.relationships` into the generic `subject`/`relationships` projection and adds the profile's connection-count caption; it owns no rendering logic beyond that translation. `EvidenceGraphFocusSync` wraps the six call sites where a profile's graph and its matching `RelationshipGroup` list render together: the generic template (`EngineeringProfileDetail.tsx`, wrapping the `RelatedRecordsSection` call) and all five founder compositions (wrapping the `profile-evidence` `PublicSection`). `RelationshipCard` (`EditorialPrimitives.tsx`) gained the matching `data-evidence-node` attribute so every relationship list item pairs with its graph node by construction, not by a second lookup table.

Homepage's two `RelationshipGraph` call sites were migrated to `EvidenceGraph` directly (the import move was required — `RelationshipGraph` no longer exists) but were **not** wrapped in `EvidenceGraphFocusSync`: the adjacent markup there is an `EditorialCard` grid keyed by `feature.entity.url`, not a `relationshipKey`-keyed `RelationshipCard` list, so there is no matching id on the other side for the sync wrapper to pair against. Wrapping it would add a client boundary that does nothing — exactly what "every `use client` file must justify its existence" rules out. This is a case for a future phase (whenever Homepage's evidence diagram gets a matching accessible list) to revisit, not something to force now.

## What Phase 3 deliberately did not do

- No `chain.ts`, no Trace, no Ledger, no new layout algorithm — still deferred to Phase 6 per `ADR_PHASE_1_DEFERRALS.md`.
- No change to `entity-graph` or `evidence-projection.ts` — both already had the right shape.
- No visualization or animation library, no new runtime dependency beyond the two dev-only test packages plus `jsdom`.
- No `AssembleStroke`-style draw-in animation for the graph's edges, despite `assemble.tsx`'s own doc comment naming "the evidence graph" as its next generalization candidate. Adding motion to a component whose job in this phase is a like-for-like migration plus a small interaction layer would be scope creep beyond what was asked; a future phase can adopt it once there's a design decision to actually add that motion, not as an unplanned side effect of this one.

## Validation

- `npx vitest run` — 59 files / 369 tests, all passing, including two new files (`EvidenceGraph.test.tsx`, `EvidenceGraphFocusSync.test.tsx`) covering projection-to-markup rendering, shared-id tagging, keyboard-focus mirroring (tab between two links, verifying only the matching node gets `data-evidence-active`), hover mirroring in both directions (list → graph and graph → list), and focus clearing when it leaves the region.
- `npx tsc --noEmit` — clean.
- `npx eslint .` — clean (one file-scoped `@next/next/no-html-link-for-pages` disable in `EvidenceGraphFocusSync.test.tsx`, justified inline: the test's plain `<a>` fixtures stand in for a `RelationshipCard`'s anchor without pulling Next's router into a unit test).
- `npx prettier --check` — clean on every file this phase touched or added.
- Two pre-existing tests needed real changes, both caught by running the full suite rather than only the new files: `Homepage.test.tsx` (the `RelationshipGraph` import-removal break described above) and one `EditorialPrimitives.test.ts` assertion that had hardcoded the exact attribute order Next's `Link` happens to serialize (`class="..." href="..."`); adding `data-evidence-node` shifted that order, so the assertion was split into two independent `toContain` checks and a new test was added that positively asserts the `data-evidence-node` id itself.
- Reduced motion: no new animation was added (see above), so no new reduced-motion handling was needed; the existing global `@media (prefers-reduced-motion: reduce)` rule in `globals.css` (which forces all transition/animation durations to ~0) already covers the new hover-highlight `transition` declarations added to `.evidence-graph-line`/`.evidence-graph-node`/`.home-relationship-card`.
- Not run: `next build` / a live browser check. This environment's `.env.local` points at the production database, and this repo has no seed/staging database to build or render against safely — the existing precedent in this repo (Phases 1–2) is unit-test-and-typecheck validation only, for the same reason.

## Self-review, against the brief's own questions

- **Is this infrastructure, or a page component?** Infrastructure: `EvidenceGraph` takes a generic `{subject, relationships}` projection and knows nothing about profiles, routing, or data-fetching. `EvidenceGraphFocusSync` takes only `children` and knows nothing about what's inside them beyond the `data-evidence-node` contract.
- **Can another page adopt it without modification?** Yes for `EvidenceGraph` (already proven — Homepage did, today, unmodified beyond the import path). `EvidenceGraphFocusSync` is adoptable by any future consumer that pairs a graph with a `data-evidence-node`-tagged list; Homepage doesn't yet because its list isn't tagged that way, not because the wrapper is profile-specific.
- **Unnecessary client state?** No React state was added at all — the only client boundary uses `useRef`/`useEffect` for DOM event listeners and imperative attribute toggling, not `useState`.
- **Duplicated graph logic?** No — `layered.ts` and `evidence-projection.ts` are untouched and still the only implementations of layout and projection.
- **Server-first rendering preserved?** `EvidenceGraph` remains a Server Component. The one client component is a thin interaction shell around Server-rendered children, not a client-rendered graph.
- **Would Trace/Search/Homepage reuse this unchanged?** Homepage already does (`EvidenceGraph`). Search and Trace are not implemented this phase per scope, but nothing in `EvidenceGraph`'s contract assumes an Engineering Profile — a future Trace multi-hop projection would still need its own layout (`chain.ts`, deferred) before it could use a *different* rendering primitive; that is Phase 6's job, not evidence this primitive is wrong today.
