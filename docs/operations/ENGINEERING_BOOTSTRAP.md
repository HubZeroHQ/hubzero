# Engineering Bootstrap

This is the canonical way to begin engineering work in this repository. It exists so that every session — regardless of what came before it — starts from the same architectural understanding, without relying on remembering a previous conversation.

Run this bootstrap once at the start of a session before writing any code. It has four parts: repository initialization, skill discovery, working assumptions, and a pre-implementation checklist.

This document is product-repo-owned. It complements `.hubzero/` (HubZero Core's shared, read-only knowledge base) but never restates or overrides it — where the two could conflict, `.hubzero/` wins, per its own README.

---

## 1. Repository initialization

### Required reading, in order

1. **`.hubzero/agents/AGENTS.md`** — HubZero Core's behavioral contract (mandatory for every AI collaborator, on every HubZero product). Defines its own internal read order (`.hubzero/principles.md` → `.hubzero/design/principles.md` → `.hubzero/architecture/principles.md` → the relevant `.hubzero/agents/*.md` lifecycle stage doc) and the seven-stage completion lifecycle. Follow that read order as written; it is not repeated here.
2. **Root `AGENTS.md`** — this product's own entry point: the four permanent content pillars, website/content philosophy, and a pointer back here.
3. **`docs/README.md`** — the index of every architecture, design, product, and operations document this repository maintains. Do not skip this even if a specific doc seems irrelevant to the task — the index itself tells you what exists.
4. **`docs/design/DESIGN_SYSTEM.md`** — required before any UI-facing change, public or Studio.
5. **`docs/architecture/EXPERIENCE_V3_PROGRESS.md`** — the current project stage (see below). Required before any change that touches a system a prior milestone already shaped — which, at this point in the project, is most of the codebase.

### Architecture and design principles

Architecture principles live in `.hubzero/architecture/principles.md` (cross-product) and `docs/architecture/PLANNING.md` + `docs/architecture/PUBLIC_DATA_LAYER.md` (this product's specific data model and read contracts). Design principles live in `.hubzero/design/principles.md` (cross-product) and `docs/design/DESIGN_SYSTEM.md` (this product's specific visual language). In both cases: read the cross-product principle first, then the product-specific implementation of it. Do not treat the product-specific doc as sufficient on its own — it assumes the Core principle rather than restating it, exactly as `.hubzero/agents/AGENTS.md` says it does.

### Current project stage

**Do not hardcode a milestone number as "current" anywhere, including here — that becomes exactly the kind of stale claim Milestone 5 spent an entire pass correcting.** Instead, determine current stage each session by:

1. Reading `docs/architecture/EXPERIENCE_V3_PROGRESS.md` end to end — it is a log, so the last entry is the most recent completed milestone.
2. Running `git status --short` and `git log --oneline -15` to see what's actually committed versus still in the working tree. This repository has a working pattern (established across Milestones 1–5) of shipping a milestone fully, verifying it, and leaving it uncommitted until the user explicitly asks for a commit — a clean `git status` does not necessarily mean nothing has shipped.
3. Cross-checking anything the progress log claims against the actual code before relying on it. The log records what was true when it was written; treat it the way `RELATIONSHIP_AUDIT.md`'s own correction now instructs readers to treat that document — as a snapshot, not a live view.

---

## 2. Skill discovery

This repository has two mirrored skill directories, `.claude/skills/` and `.agents/skills/` (kept byte-identical — diff them if you suspect drift). Skills are loaded on demand via the Skill tool, matched by their `description` frontmatter against the task at hand; they are not preloaded automatically.

### How to determine applicability

1. List the current skill directory contents — do not trust a remembered count or list from a prior session; skills can be added or removed between sessions.
2. Read each candidate skill's frontmatter `description` before invoking it. Do not invoke a skill "just in case" — an irrelevant skill's instructions competing with the task's actual requirements is worse than no skill.
3. State explicitly, in-session, which skill (if any) is being loaded and why — a one-line justification tied to the specific task, not a blanket "loading relevant skills."

### As of this writing

All 14 currently-defined skills (`animation-vocabulary`, `apple-design`, `brandkit`, `design-taste-frontend`, `emil-design-eng`, `find-animation-opportunities`, `full-output-enforcement`, `image-to-code`, `imagegen-frontend-mobile`, `imagegen-frontend-web`, `improve-animations`, `minimalist-ui`, `redesign-existing-projects`, `review-animations`) are scoped to visual design, image generation, or animation/motion work. `review-animations` additionally carries `disable-model-invocation: true` and can only be invoked explicitly, never auto-selected.

**Explicitly state when no skill applies.** For backend, data-model, permissions, relationship-system, or architecture work — which has been the entire content of Milestones 1–5 — none of the 14 current skills are relevant. Say so directly rather than silently loading nothing and leaving it ambiguous whether skill discovery happened at all. The correct sources for that class of work are `.hubzero/architecture/principles.md`, `docs/architecture/`, and this repository's own code — not a packaged skill, since none currently exists for this domain. See **[`docs/operations/ENGINEERING_SKILLS_ROADMAP.md`](ENGINEERING_SKILLS_ROADMAP.md)** for the full classification of every current skill and the named gaps this domain represents.

`full-output-enforcement` is the one exception worth defaulting to regardless of task type — it bans truncation and placeholder patterns generically, with no design-specific content, so it has no downside on backend work either.

---

## 3. Working assumptions

Active constraints that hold for every session in this repository, until a document above states otherwise:

**Architectural rules**
- `src/lib/public/` is the only path public routes read editorial data through (the Public DTO layer, `docs/architecture/PUBLIC_DATA_LAYER.md`). Public code must never query MongoDB directly.
- One Next.js application serves both the public site and the Studio CMS. There is no separate CMS backend or third-party content platform.
- `.hubzero/` is read-only. Never modify, reformat, or delete anything under it — changes there must originate from HubZero Core, not this repository.
- Prefer extending existing shared infrastructure over introducing a parallel utility, config registry, or abstraction — Milestone 5 existed specifically to undo violations of this rule that had accumulated across Milestones 1–4.

**Design rules**
- `docs/design/DESIGN_SYSTEM.md` and `.hubzero/design/principles.md` govern visual decisions. A design skill's prescriptions (e.g. `minimalist-ui`'s specific palette/font rules) do not override this project's own established system — check for a conflict before applying one.

**Release requirements**
- `src/config/public-site.ts`'s `PUBLIC_SITE.release` flags (`live`, `search`, `feed`, `contact`) gate what's publicly discoverable independently of what content exists. A route or feature existing in code does not mean it's meant to be live yet — check the relevant flag.
- `PUBLIC_ENTITY_ROUTES` (same file) is the source of truth for "does this route actually exist and get indexed." `PUBLIC_NAVIGATION`'s `enabled` field answers a different question (nav/footer visibility only) and must not be read as a release signal — this exact conflation was a real bug fixed in Milestone 5.

**Operational caution**
- This repository's local environment configuration has, at times, pointed at a real (possibly production) database rather than an isolated development instance. Never run a seed, migration, or bulk-write script against the configured database without first confirming with the user which database it actually points to.
- Do not fabricate test credentials to exercise an authenticated flow live (Studio login, preview approval) against that database. Where a milestone's own verification couldn't cover this, its progress-log entry says so explicitly rather than silently skipping it.
- Never commit or push without the user's explicit request, even after a milestone is fully verified. The established pattern across Milestones 1–5 is: implement, verify, report, stop — leaving the working tree uncommitted until told otherwise.

---

## 4. Pre-implementation checklist

Confirm all four before writing code:

- [ ] **Architecture understood** — the relevant sections of `.hubzero/architecture/principles.md` and this repository's own `docs/architecture/` docs for the system being touched have been read, not assumed from a prior session's memory.
- [ ] **Applicable documentation read** — `docs/README.md`'s index has been checked for a document covering the area of the task, and `docs/architecture/EXPERIENCE_V3_PROGRESS.md` has been checked for whether a prior milestone already shaped this exact area.
- [ ] **Applicable skills loaded** — skill discovery (Part 2) has been performed and its outcome stated, including the explicit "no skill applies" case.
- [ ] **Implementation plan complete** — the scope of the change is stated before code is written: what will change, what won't, how it will be verified (typecheck/lint/test at minimum), and what — if anything — is being deliberately deferred and why.

If any box can't honestly be checked, that is the signal to keep reading rather than start implementing.

---

## Verification of this document

- Every path referenced above (`.hubzero/agents/AGENTS.md`, root `AGENTS.md`, `docs/README.md`, `docs/design/DESIGN_SYSTEM.md`, `docs/architecture/EXPERIENCE_V3_PROGRESS.md`, `docs/architecture/PLANNING.md`, `docs/architecture/PUBLIC_DATA_LAYER.md`, `.hubzero/architecture/principles.md`, `.hubzero/design/principles.md`, `src/config/public-site.ts`) was confirmed to exist at the time this document was written.
- This document makes no claim about `.hubzero`'s contents beyond what its own README already states publicly, so it cannot drift from a Core update the way a duplicated summary could.
- The one section most likely to go stale is the "As of this writing" skill list in Part 2 — it is explicitly marked as a snapshot, with the actual required action (list the directory yourself) stated first.
