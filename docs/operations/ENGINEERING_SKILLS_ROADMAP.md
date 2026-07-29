# Engineering Skills — Audit and Roadmap

This document classifies the skills currently defined in `.claude/skills/` / `.agents/skills/` (the two directories are kept byte-identical) and names the gaps in that library relative to what this repository's engineering work actually consists of. It is a roadmap, not an implementation — no new skill has been built from this document. See `docs/operations/ENGINEERING_BOOTSTRAP.md` Part 2 for how to perform skill discovery in a given session; this document is the standing audit that discovery points back to.

**Keep this current the same way `EXPERIENCE_V3_PROGRESS.md` is kept current:** when a skill is added, removed, or its classification changes, update the table below in the same session — don't let this drift into another stale-documentation finding.

---

## Classification

| Skill | Class | Why |
|---|---|---|
| `full-output-enforcement` | **Core** | Generic output-completeness discipline with no design-specific content. Has no downside on backend, data-model, or documentation work — the majority of this repository's actual engineering surface. The one skill in the library worth treating as a default rather than a match against task type. |
| `apple-design` | Specialized | Deep, technically precise (gesture/spring physics, Pointer Events, interruptibility). Fires only when building or reviewing gesture-driven, spring-animated UI — none exists in this codebase yet. |
| `emil-design-eng` | Specialized | General UI polish/interaction-craft review, with a mandated before/after table format. Fires only on interaction-polish review work. |
| `animation-vocabulary` | Specialized | Narrow terminology lookup. Fires only on "what's this animation called" questions. |
| `find-animation-opportunities` | Specialized | Read-only opportunity-finder, explicitly restrained by design (rejects most candidates). Fires only when asked what could be animated. |
| `improve-animations` | Specialized | Read-only audit-and-plan-only skill for existing motion code; explicitly does not implement. Fires only on "audit/improve the animations" requests. |
| `review-animations` | Specialized | Review-only, `disable-model-invocation: true` — cannot auto-fire under any circumstance, must be explicitly named. Fires only on explicit invocation reviewing a motion-bearing diff. |
| `brandkit` | Specialized | Brand-identity deck/logo image generation. Fires only on brand-system requests, which this repository has not had. |
| `imagegen-frontend-mobile` | Specialized | Mobile app screen image generation only (no code). Not applicable — this product has no mobile app surface. |
| `imagegen-frontend-web` | Specialized | Per-section website reference image generation only (no code). Fires only when a new page/section needs visual direction from scratch. |
| `image-to-code` | Specialized | Image-first design-to-code pipeline for new visual sections. Fires only on greenfield visual builds; every UI change in Milestones 1–5 extended an already-established design system instead. |
| `design-taste-frontend` | Specialized, **overlaps with `redesign-existing-projects`** | Its own scope statement includes "redesigns" as one of three covered scenarios, duplicating `redesign-existing-projects`'s entire reason for existing. See Consolidation below. |
| `redesign-existing-projects` | Specialized, **overlaps with `design-taste-frontend`** | Same overlap, from the other direction — an existing-codebase audit-and-upgrade skill that `design-taste-frontend`'s brief-inference step also claims to handle. |
| `minimalist-ui` | **Obsolete for this project** | Prescribes a specific visual language (warm monochrome, named fonts, bento grids) that conflicts with this product's own established design system (`docs/design/DESIGN_SYSTEM.md`). Not merely irrelevant like the others — actively wrong if ever invoked here. Not recommended for deletion from the shared library (it may be correct for a different HubZero product), but should never fire in this repository; flagged so a future session doesn't invoke it by pattern-matching the words "minimalist" or "clean" in a request. |

### Candidates for consolidation

- **`design-taste-frontend` + `redesign-existing-projects`** — real, described overlap (see table above). Worth either merging into one skill with a "greenfield vs. existing-codebase" branch, or tightening each one's scope statement so they're mutually exclusive. Not resolved here — this is a roadmap item, not an instruction to merge them unilaterally.
- **`apple-design` + `emil-design-eng`** — partial overlap (both cover interruptibility, transform-origin, easing) from two different named philosophies at different depths. Lower priority than the pair above since the depth difference (gesture/spring physics math vs. general UI polish) is real, not just incidental duplication.

---

## Missing engineering skills

None of the current skills address the domain Milestones 1–5 actually lived in: backend data modeling, relationship-graph integrity, publish/review workflow, permissions, or documentation-vs-code reconciliation. The gaps below are named directly from that experience, not speculatively.

1. **Architecture consolidation audit** — the Milestone 5 workflow (parallel read-only agents auditing repository/projection/permission/config-registry layers for duplicate utilities, dead abstractions, and config drift, each finding grep-verified before acting) was improvised from scratch. Packaging it as a skill would make it repeatable and would encode the risk-calibration judgment calls Milestone 5 had to make ad hoc (e.g., when a found duplication is too close to a security-sensitive path to safely consolidate).
2. **Relationship / evidence-graph integrity audit** — this project's specific pipeline (`assertionsFrom` → `normalizeRelationshipAssertions` → `createGraphQuery` → `projectEvidence`/`projectTrace`, `EvidenceGraph`/`RelationshipGroup` drift-checking) is exactly what Milestone 4 audited by hand. A packaged skill, with the graph/list-drift pattern and the "don't duplicate a credit at two visual weights" precedent encoded as worked examples, would reduce the risk of the kind of test-writing mistake Milestone 4 made and caught mid-session.
3. **Publish/review workflow audit** — the capability-table-driven state machine (`docs/architecture/PLANNING.md` §28/§29-style rules, `lib/studio/workflow-permissions.ts`) governs every collection identically. A skill encoding those rules explicitly would make calls like Milestone 5's "leave `classifyBackwardTransition` unconsolidated, the semantics aren't actually identical" faster and less dependent on one session's close reading.
4. **Documentation-vs-code reconciliation** — a repeated, now-named pattern across this repository: `PLANNING.md`, `CMS_PRODUCT_DESIGN.md`, `RELATIONSHIP_AUDIT.md`, and `ENGINEERING_IDENTITY.md` all carried claims contradicted by actual code, found and fixed by hand in Milestone 5. A skill that greps every `Status: Implemented` / `Resolved` / "the same X renders both Y and Z" claim in `docs/` against the current codebase would generalize that pass into something repeatable rather than a one-time cleanup.
5. **Feature completion audit** — Milestone 3 (Careers) started from a fully-wired backend with zero UI, discovered by a prior repository audit rather than by any systematic check. A skill that, given a collection/content type, verifies UI exists on both Studio and public sides, is wired into every config registry consistently, and participates in the relationship system, would catch this class of gap earlier and for any future collection, not just Careers.
6. **Repository bootstrap verification** — the inverse of `docs/operations/ENGINEERING_BOOTSTRAP.md`: a skill that checks whether a session actually followed the bootstrap (required docs read, skill discovery performed and stated, working assumptions acknowledged) rather than relying on the session to self-report honestly. This is the one gap that's about enforcing the other five, not adding new audit coverage.

None of these six are implemented by this milestone. They are named here so a future session (or a human deciding what to build next) doesn't have to re-derive them from scratch, consistent with this whole milestone's purpose.
