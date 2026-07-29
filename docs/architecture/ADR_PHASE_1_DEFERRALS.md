# ADR: Phase 1 (v2.5 Foundations) deferred two planned items

**Status:** Accepted. Implemented in the "extract stroke-assembly primitive into shared motion module" change (`src/components/public/motion/assemble.tsx`).

**Context:** the HubZero Public v2.5 Engineering Architecture plan scoped Phase 1 ("Foundations") as three items: add a jsdom/Testing Library test environment, extract the founder motifs' stroke-draw mechanism into a shared, reusable module with regression tests, and add a `chain.ts` path-layout module beside `src/lib/graph-layout/layered.ts`. Auditing the codebase before writing any code showed two of the three should not ship yet. This record exists so a future contributor sees a deliberate decision, not an abandoned task.

## Decision 1 — Deferred: jsdom / Testing Library

**Original proposal:** add a jsdom test environment plus `@testing-library/react` and `@testing-library/user-event`, as foundational infrastructure for the interactive components (Evidence Graph, Ledger, Trace) planned in later phases.

**Actual implementation:** not added. Phase 1's only real deliverable — extracting `PathBuilder` and the stroke-reveal component — has no state, no event handling, and no interaction to simulate. It's tested the same way `src/lib/graph-layout/layered.test.ts` and `src/components/public/engineering/EngineeringProfiles.test.tsx` already are: plain function assertions and `react-dom/server`'s `renderToStaticMarkup`, under the existing `environment: 'node'` Vitest config. That config's own comment already explains why `node`, not `jsdom`, is the project default — this decision doesn't override that rationale, it just declines to add a second environment before anything needs it.

**Reason for deviation:** adding a test environment and two new dependencies with zero tests exercising them is speculative infrastructure — the exact anti-pattern the v2.5 engineering standards call out ("avoid: unnecessary dependencies, speculative architecture").

**Why this reduces maintenance:** every dependency in this repo is something a future upgrade, security patch, or config migration has to account for. An unused jsdom environment sitting alongside the documented, deliberate `node` default is confusing to read six months from now — it looks like an abandoned migration, not a choice. Deferring it keeps the test config's existing rationale true and unambiguous.

**Introduce it when:** the first component that needs real interaction simulation (hover, focus, keypress) is actually being built — planned as Phase 3, the interactive Evidence Graph. At that point, scope the addition to that component only (e.g. a `// @vitest-environment jsdom` pragma on the specific test file, or `environmentMatchGlobs`), rather than switching the whole suite's default environment.

## Decision 2 — Deferred: `chain.ts`

**Original proposal:** add `src/lib/graph-layout/chain.ts`, a linear/path layout function (A→B→C→D) alongside the existing fan-out `layered.ts`, in anticipation of Trace's backward-causation path rendering.

**Actual implementation:** not added. No component consumes it — Trace itself isn't scheduled until Phase 6.

**Reason for deviation:** `layered.ts` earns its shape from a real, working consumer (`RelationshipGraph` in `EvidenceVisuals.tsx`) and a real test suite proving specific layout behavior. Writing `chain.ts` now means guessing at a path-layout API against zero real usage — the same "premature abstraction" the v2.5 engineering standards warn against. A guessed API is more likely to need reshaping once Trace's actual data (variable-length causal chains, hop counts, truncated paths) shows up than one built against a real caller.

**Why this reduces maintenance:** an unused layout module invites two failure modes: it either gets built with the wrong shape and has to be reworked when Trace finally lands, or it quietly rots and nobody trusts it enough to use as-is, and Trace's implementer builds a second one anyway. Neither outcome is cheaper than writing it once, on schedule, against a real consumer.

**Introduce it when:** Phase 6 (Trace) begins. Build `chain.ts` in the same PR as `projectTrace` (`src/lib/public/trace-projection.ts`) and `EvidenceGraph`'s chain mode, so the layout function's shape is validated against real traced paths from the first commit rather than a hypothetical one.

## What Phase 1 actually shipped

`PathBuilder` and the stroke-dashoffset reveal component, extracted from `motifs.tsx` into `src/components/public/motion/assemble.tsx`, with new unit and regression tests for both the primitive and the five founder motifs it draws. No visual, behavioral, or public API change. See [`MOTION_GUIDELINES.md`](../design/MOTION_GUIDELINES.md) for the motion budget this primitive operates within, and [`ENGINEERING_IDENTITY.md`](../design/ENGINEERING_IDENTITY.md) for the founder motif system it was extracted from.
