# Experience v3 — Release Record

This document is the permanent historical record of Experience v3: what it became, why it was built this way, what decisions shaped it, and what a future contributor should understand before modifying it. It is not release notes, not a changelog, and not user-facing documentation — those are separate artifacts if they're ever needed. Read `docs/architecture/EXPERIENCE_V3_PROGRESS.md` for the working log this record is distilled from; read this document for the reasoning that log doesn't have room to carry.

---

## Identity

| Field | Value |
|---|---|
| Project | HubZero — public engineering-studio platform |
| Release | Experience v3 — `v3.0.0` |
| Status | Release Candidate — engineering, design, and production-readiness verification all passed |
| Repository | `hubzero`, branch `experience/v3` (built on the v2.5 six-collection public platform — see `docs/architecture/ADR_PHASE_1_DEFERRALS.md` through `ADR_PHASE_8_COLLECTIONS_DISCOVERY.md`) |
| Timeline | Eleven sequential milestones, Publishing Integrity through CSP Validation; the design-conformance/motion/craft arc (Milestones 7–9) concluded 2026-07-26 through 2026-07-28, production-readiness hardening (Milestones 10–11) concluded 2026-07-29 |
| Completion date | 2026-07-29 |
| Release type | `v3.0.0` Release Candidate, prepared for the `experience/v3 → dev → main` flow (manual QA on `dev`, a tag and GitHub Release on `main`). `PUBLIC_SITE.release.live` is currently `true` in the working tree, matching go-live intent, but this branch is not yet merged — merge, QA, tag, and deploy remain the ordinary steps outside this document (see Release Verification, below) |

---

## Executive Summary

Experience v3 is the release that turned HubZero's public site from *functionally complete* into *trustworthy and deliberately designed*.

v2.5 (documented in `ADR_PHASE_1` through `ADR_PHASE_8`) built the platform's breadth: six public collections (Work, Build, Blueprint, Lab, Note, Engineering Profile) reading through one repository layer, a shared Evidence Graph, and a Ledger view — all functionally wired to the Studio CMS. What it left behind, by the nature of building breadth first, was a set of trust gaps that only a dedicated integrity pass would find: a published entry could be silently rewritten with no re-review gate, the in-Studio preview toggle rendered a different component tree than the public site and called that parity, Careers was asserted live by three registries while having zero actual routes, and the Evidence Graph quietly drew more relationships than its adjacent list disclosed. None of these were visible from reading the design docs — they were only visible by reading the code that implemented them.

Experience v3 exists to close those gaps for real, then to do the design and craft work v2.5's breadth-first approach hadn't had room for: a systematic pass against the canonical `DESIGN_SYSTEM.md`, a dedicated motion audit, and a final craftsmanship pass across the entire visitor-facing experience.

It differs from v2.5 in kind, not just in scope. v2.5 asked "does the platform have this capability." Experience v3 asked "can this capability be trusted, and does it feel like it was built by the studio it's describing." The answer to the first question required closing real bugs (Milestones 1–4) and removing real duplication (Milestone 5). The answer to the second required something subtler: a framework for telling deliberate product identity apart from accidental implementation drift (Milestones 6–9) — because the most consequential mistake made during this release was nearly recommending the removal of one of the site's most considered pieces of design (the founder identity system) on the strength of a secondhand audit summary, before anyone had read the code it was actually built from.

---

## Engineering Summary

**Architecture.** One public repository layer (`src/lib/public/repository.ts`) sits in front of the Studio CMS's collections and produces immutable public DTOs (`ImmutablePublic<T>`) that every public page consumes. Studio's authoring surface and the public site remain two intentionally separate rendering paths.

**Rendering model.** `BlockRenderer` (Studio's authoring-time renderer, admin chrome included) and `ProseRenderer` (the public site's `.public-*` CSS renderer) are not the same component tree and were never meant to be. Milestone 2 replaced a preview toggle that had falsely implied otherwise with real Next.js Draft Mode — the same public render path, gated by a real Studio session, rather than a resemblance of it rendered through the wrong component.

**Studio integration.** Every content type, including Careers as of Milestone 3, has full Studio CRUD and relation management. Milestone 5 extracted the entry→option mapper and the split/read relation-field algorithm — each previously copied by hand across seven and three files respectively — into `lib/studio/relation-options.ts` and `lib/studio/relation-fields.ts`, giving both dedicated test coverage for the first time.

**Relationship model.** `assertionsFrom()` normalizes every collection's relationships into typed assertions, `normalizeRelationshipAssertions()` and `createGraphQuery()`/`buildGraph()` turn them into a queryable graph, and `projectEvidence()`/`projectTrace()` project that graph into what a detail page or the Homepage actually renders. Milestone 3 gave Career its first real branch in this pipeline. Milestone 4 audited every relationship kind across schema, repository, search, the Evidence Graph, Studio, and public rendering, and found the graph drawing relationships (contributor credits, Career's hiring-manager credit) that the adjacent list didn't disclose on five of six detail types — the graph and the list are required to describe the same data, and now do.

**Search.** Verified in Milestone 4 to already run through the same `projectEvidence()` pipeline as every other consumer — a finding of correctness, not a gap.

**Preview system.** Real Next.js Draft Mode. `findDetail`/`visible`/`mapSummary` in the repository layer gained a `bypassStatus` path that lifts the status gate only for the entity being previewed directly — it is never propagated into that entity's relations or trace resolution, so a draft entity can't leak a preview of other draft entities through its relationship list.

**Careers.** Went from a fully-wired headless backend with zero UI (a live-leak risk: search or the sitemap could surface a `/careers/{slug}` URL that 404'd) to a complete content type — public index and detail pages, a candidate-interest form reusing the Contact form's honeypot/timing pattern, Studio CRUD, Studio Candidates reusing existing lead-management components unmodified, and full relationship-system wiring.

**Evidence Graph.** One shared primitive (`EvidenceGraph`) renders Profiles, the Homepage, and Trace (Work's causal-chain view) — the same layered layout handles a linear chain without a separate chain-rendering module. `EvidenceGraphFocusSync` adds hover/focus synchronization between the graph and the adjacent list.

**Content architecture.** Six public collections plus Services and Careers, all reading through the one repository layer. Editorial dates are honestly scoped: only Note and Lab have a real, trustworthy editorial date, which is why the Ledger (`/ledger`, `ADR_PHASE_7`) is built from exactly those two types and no others — Work, Build, Blueprint, and Engineering Profile were deliberately excluded rather than backed by a `createdAt`/`updatedAt` substitute that would misrepresent what the date actually means.

---

## Design Philosophy

The system implemented is the one specified in `docs/design/DESIGN_SYSTEM.md`, and Experience v3's design milestones (7 and 9) exist to verify the implementation actually matches it, not to reinterpret it.

**Engineering-first presentation.** The site is designed to be *used*, not read — every page is a surface inside one continuous application, never a stack of marketing sections. This is why the Card → Inspector Panel pattern and the About roster stage (see Known Limitations) matter enough to remain on the roadmap even though they're unbuilt: both are about operating the site rather than watching it.

**Editorial experience.** Instrument Serif italic is reserved for occasional human warmth inside an otherwise sans/mono system — a hero's closing phrase, a section lead-in, never more than roughly 30% of a page's headline text. Notes and the Ledger are where this editorial register is used most.

**Restrained visual language.** One monochrome base, one functional accent (`#e8ab5c`, reserved for live/active/selected state and nothing else), one status-success green. Hierarchy comes from value and spacing, not hue. The prohibition list (bento grids, glassmorphism, glowing gradients, blueprint/circuit decoration, particle fields, cursor-replacement effects) exists because these are the specific visual habits of the generic-AI-SaaS aesthetic this project explicitly designed away from.

**Typography.** A three-font system with strict role separation: Instrument Serif italic for editorial accent, Instrument Sans for all interface and structural text, IBM Plex Mono for anything that is data rather than prose (timestamps, states, reference IDs, technologies). Mono is a system voice, never a "developer aesthetic" applied to prose.

**Spacing.** Generous and confident by design — 80–140px section padding, an 8px-multiple internal scale, minimum 20px card padding. `AGENTS.md`'s content philosophy adds the other half of this constraint: whitespace must never make a page feel empty, and every section must earn its space with real information, especially at 1440p/2K/ultrawide.

**Founder identity as product identity.** The founder accent/motif system (one procedural SVG motif and one accent color per founder, `src/config/founder-identity.ts`) is the design system's one deliberate, accountable exception to "one accent, ever" and to the general prohibition on engineering-diagram iconography. It earned that exception the hard way — see Architectural Decisions and Lessons Learned below — and the standard it now has to meet is written into `ENGINEERING_IDENTITY.md`'s "Founder identity scope": every motif must trace to that specific person's own documented expertise, or it doesn't belong.

**Originality over trends.** HubZero's engineering identity (`ENGINEERING_IDENTITY.md`) is built from six kinds of real evidence — state, lineage, decision, artifact, accountability, continuity — not from an illustration style. A site can look engineered without a single decorative circuit trace on it; that was the thesis this whole design language tests, and Experience v3's conformance work is the proof that it held up under a real, adversarial audit.

---

## Motion Philosophy

Documented canonically in `docs/design/MOTION_GUIDELINES.md`; verified end-to-end in Milestone 8.

**Design goals.** Motion explains state changes, confirms input, and preserves spatial orientation. It is never performance. The standing test applied throughout this release: "does this feel like operating software, or watching one?" If an animation can be removed without hurting comprehension or feedback, it gets removed.

**Interaction principles.** Causality first (movement starts from what caused it); structure over entrance (reveal relationships and progress, never animate content just because it entered the viewport); continuity over replacement (shared context persists between source and destination); input owns time (direct interaction is immediate, scroll-linked motion stays 1:1 with scroll); one chapter moment at a time; content is never gated behind animation; exits are faster than entrances; performance is part of meaning, not separate from it.

**Signature moments.** Exactly one motion exceeds the general budget, and it is documented as the single named exception rather than left as an unexplained outlier: the founder motif's mount-time construction draw (`--duration-motif: 900ms`, `AssembleStroke`/`PathBuilder` in `src/components/public/motion/assemble.tsx`), drawn once per visit on a founder's own Engineering Profile route. The About card's copy of the same motif is a separate, shorter interruptible hover/focus reveal and does not carry this exception. Where the platform supports the View Transitions API and the visitor hasn't requested reduced motion, the About card and the profile hero treat their two motifs as one continuous object rather than restarting cold.

**Transition philosophy.** Two speed bands only — Immediate (120–250ms) for anything that responds directly to input, Considered (300–500ms) for view/state changes — with one standard easing curve (`cubic-bezier(.2,.8,.2,1)`) and no bounce, elastic, or spring overshoot anywhere. Every cross-page navigation uses the same `public-settle` pattern (fade + ≤10px vertical settle), applied to the new view's own `<main>` on remount; the persistent navigation never re-animates because it is a layout sibling of the page content, not a child of it.

**Reduced-motion support.** A global CSS kill-switch forces near-zero transform/animation durations under `prefers-reduced-motion: reduce`, layered with explicit per-component fallbacks documented as a direct table in `MOTION_GUIDELINES.md` (draw/construct becomes a complete static structure; shared-element travel becomes a direct view change; card lift becomes fill/border/focus only). Reduced motion is treated as a design mode with its own specified behavior, not a cleanup pass applied at the end.

**Performance considerations.** The motion system is dependency-free everywhere except one scoped, pre-existing use of `framer-motion` in the Search palette overlay — explicitly flagged in the guidelines as not a precedent for a second consumer. Every other animation, including the founder motif's stroke-draw, is plain CSS or a zero-dependency SVG primitive built for this purpose. Milestone 8 confirmed zero scroll-triggered entrance animations exist anywhere on the site — a correctness finding, not a gap, since the design system explicitly prohibits them.

---

## Major Milestones

Full detail lives in `docs/architecture/EXPERIENCE_V3_PROGRESS.md`. This section captures lasting outcomes only.

**Publishing & Preview Integrity (Milestones 1–2).** Closed a real authorization gap (a published entry could be silently rewritten with no re-review gate) and replaced a preview mechanism that had falsely claimed component-tree parity with the public site with real Next.js Draft Mode. Architectural impact: publishing now has a genuine reviewer-reject path (`inReview → draft`), and "what I see in preview is what ships" became true by construction instead of by resemblance.

**Careers.** Took a fully-wired, zero-UI backend that three separate config registries asserted was live, and gave it an actual public surface, Studio CRUD, and full relationship-system wiring. Architectural impact: closed a live-leak risk (a public URL that would 404) and gave the relationship pipeline its first `career` branch.

**Relationship Integrity.** A full audit of every relationship kind against the explicit standard that "the graph and the accompanying relationship lists should describe the same underlying data." Found and fixed graph/list drift on five of six detail types and added relationship groupings the original v2.5 audit had flagged but never fixed. Architectural impact: the Evidence Graph's exclusion rules are now consistent across every content type, mirroring a pattern the Homepage had already gotten right.

**Architecture Consolidation.** An explicit no-new-features cleanup pass following a four-way parallel audit. Merged duplicated graph-construction logic, consolidated three independently-maintained type maps into one, extracted two multiply-copied Studio algorithms into shared, newly-tested modules, and corrected six stale documentation claims that this release's own earlier milestones had made false. Architectural impact: this is the milestone that made the rest of the release's work legible — without it, Milestones 6–9 would have been auditing a moving, self-contradicting target.

**Engineering Bootstrap.** Established a standing process — not a feature — for how any session, human or AI, starts working in this repository: required reading order, skill discovery, working assumptions (including the standing caution about this repository's development database configuration), and a pre-implementation checklist. Architectural impact: this is the process artifact this release leaves behind for every future release, independent of Experience v3 itself.

**Design Conformance.** The release's pivotal milestone. An initial audit and implementation strategy recommended removing the entire founder accent/motif system as a design-system violation. A user-directed correction introduced the Drift / Product Identity / Design System Gap framework and required re-evaluating that recommendation rather than executing it. Direct source review reversed it: the founder system, its View Transition continuity, and its cross-reference tier were deliberate, well-governed product identity, not drift. What actually shipped was narrower and lower-risk than either planning pass had proposed: a handful of real fixes (fabricated citation, dead code, missing hover states, inconsistent chip/button fills, timing-token consolidation) plus writing down, for the first time, what the founder system's code comments had been asserting piecemeal. Architectural impact: the three-way classification became the permanent lens for every design-conformance judgment made afterward in this release, and should be for future ones.

**Interaction & Motion Polish.** A dedicated audit against all seven motion-system areas, finding the system already unusually disciplined going in. Two narrow real fixes shipped (a missing disabled-state opacity transition, an over-animated mobile accordion). Architectural impact: this milestone converted the *absence* of new animation into a documented, verified fact rather than an unstated assumption — most of its workstreams closed with "verified correct," not "fixed."

**Premium Finish.** A live first-time-visitor walkthrough of the entire public experience (Home → About → Engineering Profile → Build → Blueprint → Lab → Notes → Services → Contact) plus a static performance-settings check. Zero code changes — nothing found met the bar for a real defect, including a third and final re-examination of a portrait-hierarchy finding that had been carried, undecided, since the design-conformance pass. Architectural impact: this milestone's own conclusion is the reason this release record exists — after three consecutive passes each finding fewer real issues than the last, continuing to search for more work stopped being productive due diligence and started being manufactured work.

**Production Readiness (Milestones 10–11).** The question this release record's first version left open — is the app safe and correct to actually put on the internet, as opposed to well-designed — got asked directly, against real build output and `npm audit` rather than source review alone. It found three genuine release blockers invisible to every prior design-conformance pass, because they weren't design problems: two critical and one high-severity dependency vulnerability, a complete absence of production security headers, and a live WCAG failure on the Career Interest form (`id`/`htmlFor` pointing at each other incorrectly on all 8 fields). All three were closed and re-verified. Fixing the security headers surfaced a second, harder problem: the natural CSP broke Next.js App Router's own inline hydration scripts outright. The stricter, officially-documented fix (nonce + `strict-dynamic`) was implemented, then empirically proven incompatible with this app's deliberate ISR caching architecture — a statically-cached page's HTML has no nonce baked in at all, while per-request middleware stamps a fresh one on top, reproducing the same blank-page failure on every cached route. Architectural impact: `script-src`/`style-src` carry a disclosed, justified `'unsafe-inline'` rather than the theoretical-maximum nonce approach — the correct trade for this app's real rendering model, arrived at by testing the stricter option and rejecting it only after it demonstrably didn't work, not by skipping it.

---

## Architectural Decisions

Decisions future contributors must understand before changing the systems they govern.

**Why two renderers remain (`BlockRenderer` vs. `ProseRenderer`).** These were never meant to be the same component tree — `BlockRenderer` is Studio's authoring-time renderer, admin chrome included; `ProseRenderer` is the public site's own `.public-*` CSS renderer. Merging them would couple public rendering to Studio's editing concerns for no real benefit. Preview parity is solved by having both paths render from the same source through Draft Mode, not by making them the same component. See `docs/architecture/PLANNING.md` §18/§26 and `CMS_PRODUCT_DESIGN.md`'s Preview section for the full architectural rationale. Do not propose merging them without re-opening this decision explicitly, by name.

**Why founder motifs exist, and why they're scoped the way they are.** A founder motif is not decoration; it's an accountable exception to two rules at once — the single-amber-accent rule and the prohibition on engineering-diagram iconography — and it only earns that exception because every motif is required to trace to that specific founder's own documented expertise (`pcbTrace` ↔ Salsabeel, an electronics/embedded engineer; `network` ↔ Rifaque, a platform/orchestration engineer). The scope is deliberately narrow: a founder's own Engineering Profile route (including that route's bespoke composition classes), the About card that links into it, and the compact `FounderCrossLink` tier wherever that founder is credited elsewhere. The Homepage is the one explicit opt-out, held to the strictest reading of the single-accent rule regardless of how the rest of the system resolves. Both the existence and the boundary are documented in `ENGINEERING_IDENTITY.md`'s "Founder identity scope" section — a section this release wrote, because before Milestone 7 the boundary existed only as inference from code comments.

**Why editorial illustration content is not interface chrome.** `DESIGN_SYSTEM.md` §2 draws a content/control distinction: a photograph's natural color isn't a monochrome violation because a photo is content, not a state signal. The founder motif system extends that same distinction to a bounded, named editorial illustration, on the explicit condition that its color never leaks into anything a visitor would parse as chrome — text, borders, list markers, or any control shared with pages that don't own that illustration. This is why the founder-scoped CSS classes (`.founder-eyebrow`, `.founder-decision-list`, `.founder-pinout`, etc.) are bespoke, one-off, and never reused outside their own composition — reuse would be exactly the leak the boundary exists to prevent.

**Why amber retains a single, narrow meaning.** "Amber means this is live, active, or selected — nothing else, ever" is Design Principle 7, and the reason the system works with only one accent color is that scarcity is what makes the signal legible. Every audit pass in this release (7, 8, 9) re-tested this rule rather than assuming it still held, because it is the rule most tempting to quietly erode one "just this once" exception at a time.

**Why motion stays restrained and dependency-light.** The two-band timing system and the near-total absence of animation libraries are not an accident of not having gotten to it yet — Milestone 8 confirmed the system was built this way from the start and found it correct, not incomplete. The one library dependency that exists (`framer-motion`, scoped to the Search palette) is explicitly flagged in `MOTION_GUIDELINES.md` as a boundary, not a foothold — a second consumer should trigger a re-evaluation of the whole approach, not a quiet expansion of it.

**Why certain contextual variants remain separate rather than consolidated.** Milestone 5's consolidation pass and Milestone 7's design-conformance pass both stopped short of merging every visually-similar component into one shared primitive. `.home-technologies`'s several sub-variants (e.g. the one inside `.engineering-card-body` that deliberately strips chrome "to read as a plain, quiet line, not a third row of pill chips") were investigated and left alone, because forcing them into one component would have repeated, one layer down, the exact over-standardization mistake the founder-identity correction had already identified at the system level.

**Why the Content Security Policy uses `'unsafe-inline'` for `script-src` instead of a nonce.** Next.js App Router renders genuine inline `<script>` tags on every route — the React Server Components stream and Suspense-boundary swaps — whose content is real per-request data, so a fixed hash allowlist can't cover them. The only CSP mechanism that permits inline scripts without `'unsafe-inline'` is a nonce, and Milestone 11 built the officially-documented version of it (middleware-generated, threaded automatically into every script Next.js renders — confirmed by diffing the CSP header's nonce against the HTML's `nonce` attributes). It failed for exactly the reason this app has `export const revalidate = 86_400` on nearly every content route: a statically-generated page's HTML is rendered once, at build or revalidation time, with no request and so no middleware involved at all — it ships with no nonce baked in, while middleware stamps a fresh, different one onto that same cached response's header on every later request that serves it. Reproduced live under `next start` before concluding this, not assumed from documentation. Forcing every route dynamic to fix the mismatch would discard the ISR architecture Milestones 5 and 8 already verified as deliberate, for a CSP directive — the wrong trade. `'unsafe-inline'` is therefore the version of this policy that's actually correct for this app's real rendering model. Do not re-attempt the nonce approach without either abandoning ISR entirely or waiting for Next.js's Partial Prerendering to mature enough to reconcile the two.

---

## Lessons Learned

These lessons are written to outlive this specific release and should shape how future HubZero work — on this product and others — gets done.

**Read the implementation before proposing to change it.** The single most consequential moment in this release was a plan to remove the entire founder identity system, built on a secondhand audit summary rather than the actual source. Reading `founder-identity.ts`, `assemble.tsx`, `FounderProfileLink.tsx`, and the founder composition CSS directly revealed a more sophisticated, already-well-governed system than the summary had credited — including a working View Transition continuity nobody had realized already existed. No amount of audit-summary quality substitutes for reading the code a consequential decision is actually about.

**Not every inconsistency is drift.** The Drift / Product Identity / Design System Gap framework exists because "this differs from the surrounding pattern" and "this is a bug" are not the same claim, and treating them as the same claim is how a design-conformance pass turns into an unintentional redesign. The framework's third category matters just as much as the first two: sometimes the implementation is right and the documentation is what needs to catch up (as happened with `--duration-motif`'s justification, which existed only as a CSS comment before Milestone 7 wrote it into `MOTION_GUIDELINES.md` properly).

**Documentation and implementation evolve together, not documentation-then-code or code-then-documentation.** Every genuine design-system exception this release preserved (the founder motif, the editorial-illustration clause, the 900ms motion budget) got a real, permanent, boundary-setting home in the canonical docs at the same time its implementation was confirmed correct — not left as an undocumented exception for the next audit to rediscover from scratch.

**Preserve identity while removing accidental complexity — these are not in tension.** Milestone 7 removed genuinely dead code (`--founder-accent-subtle`, a fabricated documentation citation) in the same pass that preserved and better-documented the system those fixes lived inside. Cleanup and preservation are not opposing instincts; conflating "this looks unusual" with "this is unmaintained" is the actual mistake to avoid.

**Avoid over-standardization.** The corrective lesson from the founder-identity reversal generalizes: forcing every visually-distinct thing into one shared component in the name of consistency can destroy real, considered product decisions as readily as leaving genuine drift unfixed. Consistency (Design Principle 17) and one-size-fits-all are not the same value.

**Audit → verify → implement, in that order, every time.** The releases's most reliable pattern — visible across Milestones 4, 7, and 8 — is that a real, grep-verified or source-read audit consistently outperformed inferring a gap from a summary or from how similar systems "usually" work. Where this pattern wasn't followed (the initial founder-identity plan), it produced the release's one real course-correction.

**Operational discipline matters as much as design discipline.** Running a production build in the same working directory as an active dev server (Milestone 9) corrupted the dev server's cache and cost a recovery cycle. Minor in isolation, but recorded here because the same "read state before acting" discipline that governs design decisions in this release governs shell commands too.

**A fix that passes in one environment isn't verified until it's tried in the one that matters.** Milestone 11's nonce-based CSP passed every check under `next dev` — real browser, zero console errors, correct hydration — and would have shipped as "fixed" on that evidence alone. It broke every statically-cached page specifically under `next start`, because dev mode never actually serves anything from a build-time cache the way production's ISR does. The lesson isn't "test more broadly" in the abstract; it's that dev and production can diverge on the exact mechanism a fix depends on, and the only way to know is to run the fix in both, deliberately, rather than trust that a passing dev check generalizes.

---

## Known Limitations

**Accepted limitations** — permanent by deliberate decision, not gaps to close later:

- `BlockRenderer` and `ProseRenderer` remain two separate components. This is architecture, not debt (see Architectural Decisions).
- No draft/live dual-copy versioning: editing a published entry pulls it from public view until it's re-approved. A stated trade-off from Milestone 1, not a bug.
- The About page's Team Roster is still three static CSS grids, not the single-person "stage" interaction `ENGINEERING_IDENTITY.md` specifies. That document itself marks this "Not implemented" and keeps the design as a target — it was true before this release and remains true after it; no milestone in this release claimed to build it.
- Founder portrait photography is inconsistent across the five founders (different backdrops, lighting, crop framing in the source photographs). The CSS-level treatment (`aspect-ratio`, `object-fit`) is already uniform; the inconsistency lives in the source photography itself and needs new or retouched photography, not a code change.
- No `JobPosting` structured data for Careers — evaluated directly in Milestone 10 and rejected, not merely deferred: `PublicCareerSummary` has no `datePosted` field, which Google requires for a valid `JobPosting`, and no field exists anywhere in the pipeline that could honestly source one. Careers does have `CollectionPage`/`ItemList` schema as of Milestone 10, matching every other collection index — only the per-listing job schema is absent. No résumé file upload either (the backend supports a `resumeUrl` link only).
- `script-src`/`style-src` carry `'unsafe-inline'` in the Content Security Policy, not the theoretical-maximum nonce-based approach — a deliberate Milestone 11 trade after the stricter option was implemented, tested, and found to break every statically-generated page in production (see Architectural Decisions).
- Public forms (Contact, Career Interest) have only honeypot-plus-timing spam resistance, no rate limiting by volume or IP — a real, disclosed gap from Milestone 10's security review, judged a recommendation rather than a blocker given this site's realistic current traffic.

**Future enhancements** — legitimate next work, explicitly not launch-blocking:

- No `loading.tsx` exists for any public route group. Real for perceived performance on a slow response, but building 9+ matching skeleton states is new UI surface, correctly out of scope for a polish pass.
- No exit transition when leaving a founder's profile back to the roster (there's no natural "return to this exact card" destination to morph into without new scroll-to-card logic).
- The Card → Inspector Panel pattern specified in `DESIGN_SYSTEM.md` §7 (a project card opening an in-place overlay, preserving scroll position, rather than navigating) is not implemented anywhere in `src/components/public` — the site currently uses ordinary page navigation plus the `public-settle` transition for every collection-to-detail move. That satisfies the same continuity principle at the motion level but is not the same interaction the design system specifies.
- Exact bundle-size and Lighthouse-style CLS/LCP numbers were not captured this release, following a build-tooling incident in Milestone 9 (see Lessons Learned).
- Live mobile/tablet visual verification was not completed this release — a confirmed browser-automation tooling limitation (viewport resize doesn't affect the real rendered viewport in this environment) blocked it, not a decision to skip it. Mobile readiness currently rests on Milestone 8's code-level audit (touch targets, breakpoints, `.hubzero/design/mobile-experience.md`'s checklist).

---

## Release Verification

Run fresh as of this record's last update (2026-07-29), not recited from an earlier milestone:

- **TypeScript** (`tsc --noEmit`): 0 errors.
- **ESLint** (`eslint .`): clean.
- **Test suite** (`vitest run`): 446/446 tests passing across 70 test files.
- **Production build** (`npm run build`): succeeds; all `revalidate`/`expire` ISR windows confirmed intact from the build's own route table.
- **Dependency security** (`npm audit --omit=dev`): 0 vulnerabilities, as of Milestone 10's `next`/`next-auth` upgrade. (`npm audit` including devDependencies still reports 9 high-severity advisories, all one transitive ESLint-chain dependency with no non-breaking fix available and zero production/runtime exposure — tracked, not treated as a blocker.)
- **Security headers:** `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, and (production-only) `Strict-Transport-Security` all confirmed present in the compiled `routes-manifest.json` and live response headers under both `next dev` and `next start` (Milestones 10–11).
- **Manual verification:** a full live first-time-visitor walkthrough (Home → About → an Engineering Profile → Build → Blueprint → Lab → Notes → Services → Contact) in Milestone 9, confirming the page-transition system, hover states, and Milestone 7/8 fixes all behave correctly in practice, not just in code; repeated across every major public route plus Studio, in both dev and production modes, in Milestone 11 specifically checking for CSP console errors, hydration failures, and broken interactivity.
- **Accessibility:** verified by design/code review against `DESIGN_SYSTEM.md` §12 and `.hubzero/release/RELEASE_CHECKLIST.md` §7 throughout every milestone, plus one real, confirmed WCAG defect found and fixed in Milestone 10 (broken label/input association on the Career Interest form). No automated accessibility tool (e.g. axe-core, Lighthouse a11y audit) was run this release — that remains a gap in verification *method*, not a known outstanding defect.
- **SEO:** technical SEO, metadata, and structured data audited directly against real build output in Milestone 10 (robots.txt, sitemap.xml, canonical URLs, per-page Open Graph/Twitter Card metadata, JSON-LD across every content type) — found already thorough, with two real gaps closed (Careers `CollectionPage` schema, Services footer discoverability) and two more identified and deliberately left unimplemented for lack of real supporting data (Careers `JobPosting` schema, per-listing OG image).
- **Motion:** a dedicated audit (Milestone 8) plus live confirmation (Milestone 9) that `public-settle` and every hover/press/focus interaction behave as `MOTION_GUIDELINES.md` specifies.
- **Design conformance:** a dedicated four-pass effort (Milestone 7) against `DESIGN_SYSTEM.md`, `ENGINEERING_IDENTITY.md`, and `MOTION_GUIDELINES.md`, using the Drift / Product Identity / Design System Gap framework.
- **Documentation:** `DESIGN_SYSTEM.md`, `MOTION_GUIDELINES.md`, `ENGINEERING_IDENTITY.md`, `PLANNING.md`, `CMS_PRODUCT_DESIGN.md`, `PUBLIC_DATA_LAYER.md`, and `RELATIONSHIP_AUDIT.md` were each corrected during Milestones 1–9 to match what the implementation actually does; `docs/operations/ENGINEERING_BOOTSTRAP.md`, `ENGINEERING_SKILLS_ROADMAP.md`, `/privacy`, and `CHANGELOG.md` were newly created across Milestones 6 and 10–12.
- **Remaining blockers:** none. Three real ones were found (Milestone 10's dependency/header/accessibility findings) and closed within the same release, re-verified end to end rather than left as a caveat. This record certifies the branch's engineering, design, and production-readiness quality as of this update — it does not itself constitute a merge, a tag, or a deploy. Those remain the ordinary steps to complete against `.hubzero/release/RELEASE_CHECKLIST.md`'s own Release Approval section outside this document, including the human sign-off fields (Reviewed By, Approved By, Git Tag) that record intentionally leaves blank.

---

## Deferred Work

Listed here with why, so it is never mistaken for a defect that was simply missed:

- **`entry-actions.ts`/`workflow-permissions.ts` reject/override classifier consolidation** — deferred in Milestone 5 after determining the two code paths' semantics aren't actually identical (Head Admin's override intentionally supersedes reject-eligible states); a shared classifier risked a subtle authorization regression on a security-sensitive path for marginal cleanup value.
- **`PUBLIC_SEARCH_GROUPS`'s untyped `type` column** — a theoretical future-proofing gap, not a present defect; left as-is in Milestone 5 rather than typed speculatively.
- **The About Roster Stage interaction** — designed in `ENGINEERING_IDENTITY.md`, never built. Deferred because no milestone in this release scoped it as in-progress work; it remains exactly where it was before this release started.
- **Card → Inspector Panel pattern** — designed in `DESIGN_SYSTEM.md` §7, not built anywhere in the current public component tree. Deferred because the existing page-navigation-plus-settle-transition approach already satisfies the continuity principle the pattern exists to serve, and building the full overlay pattern is new interaction surface, not a conformance fix.
- **`loading.tsx` skeleton states, a founder-profile exit transition, exact bundle/performance metrics, and a live mobile/tablet visual pass** — all identified in Milestone 9 as legitimate remaining work, explicitly not treated as launch-blocking per that milestone's own instruction to distinguish real defects from future ideas.

---

## Experience v3 Legacy

Experience v3 took a platform that had already proven it could be *built* (v2.5's six collections, its Evidence Graph, its Ledger) and proved it could be *trusted and felt*. The first half of this release closed integrity gaps that no design review would ever have found, because they were bugs in what the system claimed about itself — a published entry silently rewritable, a preview that wasn't really a preview, a content type declared live with nowhere for a visitor to actually go. The second half did something harder to measure: it took a design system that had been specified in careful detail but never systematically checked against its own implementation, checked it for real, and in the process discovered that the implementation was in several places *better* than the plan to "fix" it would have left it.

The lasting principle this release establishes is the Drift / Product Identity / Design System Gap framework, and it should outlive Experience v3 itself. Every future audit of this platform — design, architectural, or otherwise — will find things that look inconsistent. The framework's job is to stop that observation from automatically becoming a work item. Something different is not automatically something wrong; it might be the one thing on the page a visitor was supposed to notice.

The second thing this release leaves behind is procedural: the Engineering Bootstrap. Every milestone in this release, including this record, depended on being able to answer "what is actually true about this repository right now" without trusting a prior conversation's memory of it. That question got harder to answer honestly as the release went on, not easier — which is exactly why the bootstrap process exists as a standing artifact rather than a one-time cleanup.

What Experience v4 — or whatever comes after this — should inherit is not a specific component or animation. It's the posture this release ended on: assume the thing in front of you is already good, read it before you propose changing it, and when you can no longer find a real defect after several honest attempts, say so instead of manufacturing the next one.
