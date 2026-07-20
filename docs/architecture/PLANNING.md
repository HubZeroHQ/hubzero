# HubZero — Website & CMS Planning Document

**Status:** Architecture Approved — Revision 3, final architecture refinement pass complete. Planning is finished; no implementation has begun. See §41 for the approval summary.
**Scope:** Full site (Work, Builds, Blueprints, Labs, Services, Notes) **plus** a first-party CMS that becomes the single source of truth for all of it.
**What changed in this pass:** This was a refinement pass, not a redesign — the direction from Revision 2 stands. Four real architectural issues were found and fixed: (1) "Documents" were modeled inconsistently (bespoke per-collection fields in some places, an implied standalone collection elsewhere) — unified into one polymorphic `documents` collection so any current or future content type can own long-form content with zero schema change. (2) Services was referenced throughout the CMS sections but never actually defined as a collection — fixed. (3) Users (system identity) and Team (public profile) had no defined relationship, which is exactly the kind of duplicated-responsibility risk this review was meant to catch — fixed by making Team an optional public-facing extension of a User, not a parallel record. (4) A CMS editorial-experience section was missing entirely — added. Several smaller simplifications (dropped reference IDs for Leads, simplified Services' publishing workflow, tightened AI provider decoupling, added search-index and index-page scaling notes) are folded in below.

---

# Part I — Website Architecture

## 1. Understanding of HubZero

HubZero is a small, engineering-first studio (currently five people spanning full-stack, UI/UX, data/ML, and embedded/hardware) operating across client work, internal products, reusable foundations, and open research. The website is not a static brochure but the public face of a genuine internal publishing system — the CMS in Part II. The site and the studio's actual working process are meant to be the same system, not two things kept in sync by hand.

## 2. Core Philosophy

Three principles run through every decision in this document:

- **Engineering before aesthetics.** Every visual decision serves a structural or functional purpose first; polish is applied to something real, never used to substitute for it.
- **Evidence before claims.** Nothing is asserted that isn't backed by a real, linkable artifact — a case study, a deployment, a repository, a journal entry. This is the explicit governing rule for the Services page (§13) and for AI-assisted content generation (§31).
- **Systems before pages.** The site is not a set of hand-built pages; it is a set of content collections rendered through shared templates and a shared editing system (the Document Engine, §25). A "page" is a view over the system, not a bespoke artifact.

## 3. Brand Positioning

HubZero positions as a boutique engineering studio, not an agency and not an enterprise vendor — small, rigorous, and evidence-led rather than scale-led. HubZero doesn't just show finished outcomes, it shows its *process* — from idea to research to shipped product to client application to reusable pattern. That process visibility is a first-class part of the brand story (§4).

## 4. The HubZero Lifecycle

The four pillars are not four unrelated sections — they are stages of one recurring process.

```
Idea → Research → Labs → Builds → Work → Blueprints
                            ↑                  |
                            └──────────────────┘
                     (proven patterns feed back into new Builds)
```

- An **idea** becomes **research**.
- Research becomes an active **Lab** — a genuine engineering notebook entry.
- A Lab that reaches a working state **graduates into a Build** (§26.4 defines this at the CMS level).
- Builds inform how HubZero approaches client **Work**.
- Patterns that prove themselves repeatedly across Work and Builds get generalized into reusable **Blueprints** — which, in turn, accelerate future Work and Builds.

Represented deliberately as narrative and data, never as diagram decoration (`DESIGN_SYSTEM.md` explicitly rejects blueprint/circuit-diagram motifs):

1. A short narrative passage on the homepage (§8, step 2) with the five stage-names rendered as real links into their respective pillar indexes.
2. A one-line contextual callout at the top of each pillar index page (e.g., Labs opens with "This is where ideas become research before they're ready to ship").
3. A structural relationship in the CMS itself: a Lab entry references the Build it became; a Work or Build entry can reference the Blueprint it was generalized from (§24). The lifecycle isn't just a story — it's queryable data.

## 5. Complete Information Architecture

```
/                          Home
/work                      Work index
/work/[slug]               Case study
/builds                    Builds index
/builds/[slug]             Product page + technical documentation + case study
/blueprints                Blueprints index
/blueprints/[slug]         Blueprint detail (Blueprint-X-Y)
/labs                      Labs index
/labs/[slug]               Lab journal
/services                  Services (evidence-linked, not a sales page)
/about                     Team (roster "stage" pattern)
/contact                   Contact
/notes                     Engineering journal — CMS-ready at launch, public route phased in later (§14)
/notes/[slug]               Note
/privacy                   Privacy policy (footer-only, non-primary nav)
```

No manually-created pages outside the CMS for any pillar or Notes entry — every collection-backed route above is generated from a CMS collection. Adding a tenth Work entry should never require touching code.

## 6. Navigation Structure

`[Logo]  Work  Builds  Blueprints  Labs  Services  About  [Search ⌘K]  [Contact]`

Seven destinations plus search is genuinely dense for one pill; density is solved through typography, spacing, and responsive behavior — never by hiding or cutting a destination:

- Nav item padding/letter-spacing tighten at laptop widths via `clamp()`, not a breakpoint jump.
- `Search ⌘K` collapses to icon + visible `⌘K` glyph below ~1280px — still a fully visible, labeled affordance, just more compact.
- `Contact` remains the one visually differentiated item (subtle button treatment); `Services` is a normal nav link.
- The pill is allowed to be visually wider on 1440p+ screens than on a 13" laptop, using desktop room that already exists.
- If real measurement in Phase 4 (§38) still shows the pill cramped, the next lever is label text (already minimal) before any structural change — hiding a destination stays off the table.

## 7. Search as a Core Feature (Command Palette)

The palette indexes, in one flat searchable set: every Work/Build/Blueprint/Lab/Notes (once public) entry, every Service, Team members, Technologies/tags, and static pages. It's generated directly from the same CMS collections that render the pages — no separately hand-maintained search index, and no result that doesn't correspond to something real.

**Scaling note (added in this pass):** the palette's index carries only lightweight fields — title, type, slug, tags/technologies — never full Document bodies (§25). At today's content volume this can ship as a small build-time index; as collections grow into the hundreds (§40), the same lightweight shape moves behind a server-side search endpoint with zero change to the palette's UX or API contract. Because the index is collection-driven rather than page-driven, Notes and future content types join search automatically the moment they're published.

## 8. Homepage Narrative

1. **Identity** — a short, confident statement of what HubZero is. No stats row, no logo wall.
2. **What HubZero builds** — narrative passage introducing the lifecycle (§4) as five linked stage-names.
3. **The four pillars** — a compact orientation grid defining what Work, Builds, Blueprints, and Labs each *are*.
4. **Featured Work** — one real case study, in depth.
5. **Featured Build** — one real build, in depth.
6. **Featured Blueprint** — one real blueprint, in depth.
7. **Inside the Lab** — one genuinely active Labs entry, framed as a peek into an engineering notebook.
8. **Services** — the evidence-linked services summary (§13), linking into `/services`.
9. **Engineering philosophy** — the three principles from §2, stated directly to the visitor in HubZero's own voice.
10. **Team** — a short teaser linking into the full roster stage on `/about`.
11. **Contact** — direct, plain close.

Each step uses a distinct compositional rhythm so scrolling keeps revealing new *kinds* of content.

## 9. Work Section Architecture

Index with chip filters and metadata-revealing card hover; detail pages are full, real, indexable URLs (`/work/[slug]`) rather than overlay modals, for SEO (One Purpose Per Page, sitemap inclusion, shareability). Every Work entry is a CMS collection item (§26.1) whose case study body is authored through the Document Engine (§25) — the Work index is, literally, a live view of the collection.

## 10. Builds Section Architecture — Significantly Richer

A Build page is engineering product documentation, not a landing page:

- Overview, why it exists, product philosophy, architecture, technologies, screenshots, technical decisions, challenges, lessons learned, deployment (live status indicator), repository (when public), future roadmap, related Labs, related Work.

At the CMS level, this depth is handled by letting a Build entry own **two Documents** — one in the `caseStudy` role (overview, why it exists, philosophy, outcome-facing narrative) and one in the `technical` role (architecture, technical decisions, challenges) — both authored in the same block editor via the general ownership model in §25, not a bespoke second field or a second editor.

## 11. Blueprints Section Architecture — Launch Pillar

Blueprints ships at launch, even with a single genuine entry. The index page carries an honest, plain status line that the library is actively growing. No fabricated or placeholder blueprints are ever published — if zero real blueprints exist the day the site would otherwise launch, launch is blocked on producing at least one (see §39, Risks).

Each entry includes: Blueprint name, permanent reference ID (§27), Architecture (X), Design Language (Y), description, features, technologies, status, a live deployment URL (first-class and prominent on the page), preview assets, and a complete case study document.

## 12. Labs Section Architecture — Engineering Notebook, Not a Showcase

Each Lab entry exposes: current stage, problem statement/objective, technical approach and architecture being explored, research notes and findings, experiments, blockers, future direction, and graduation criteria.

At the CMS level (§26.4), this is a small set of structured fields (stage, objective, next milestone, graduation criteria) plus one Document in the `journal` role that accumulates findings/experiments/blockers as blocks over time rather than being rewritten. A full marketing-style case study is deliberately not required while a Lab is active.

## 13. Services Strategy

The page is called **Services**, not Capabilities — plain nouns, no relabeling of standard destinations (`DESIGN_SYSTEM.md` §13). It must not become a traditional agency sales page: every service listed links immediately to the real Work case studies, Builds, Labs, and Blueprints that prove HubZero does this. At the CMS level, Services is now an explicit, defined collection (§26.7) — small and low-volume — whose entries carry relational links into Work/Builds/Blueprints/Labs rather than duplicating any of that content, so the evidence links can never go stale relative to what the site actually contains.

## 14. Notes (Engineering Journal) — Site Surface

A fifth content collection (§26.5) — a public engineering journal written in engineers' voice. Not part of the seven-item launch navigation (§6) and not one of the four permanent pillars defined by `AGENTS.md`. The CMS collection, schema, and Document Engine integration ship from day one so the internal publishing workflow is real and usable immediately; the public `/notes` route and its nav/search presence are phased in once there's a real, non-empty body of published Notes to show (§38).

## 15. Individual Page Outlines

| Page | Primary purpose | Key sections |
|---|---|---|
| Home | Explain the studio, then prove it | Identity, lifecycle, the four pillars, featured Work/Build/Blueprint, inside the Lab, Services, philosophy, team, contact |
| Work index | Browse client work | Filter chips, project grid — a live view of the Work collection |
| Work detail | Prove a specific outcome | Hero, case study document, reference ID |
| Builds index | Browse shipped products | Status-aware product grid |
| Builds detail | Document a shipped product fully | Overview, philosophy, architecture, tech, screenshots, technical decisions, challenges, lessons, deployment, repo, roadmap, related Labs/Work |
| Blueprints index | Browse reusable foundations, launch pillar | X/Y filter chips, grid, "library is growing" status line |
| Blueprints detail | Let a visitor experience a foundation directly | Audience, architecture, design philosophy, features, prominent live preview link, tech stack, case study |
| Labs index | Show active engineering research | Stage-led list, one-line lifecycle callout |
| Labs detail | Expose genuine engineering thinking | Stage, objective, approach, journal, graduation criteria |
| Services | Evidence-linked service list | Each service + its linked Work/Builds/Blueprints/Labs |
| About | Meet the team | Roster "stage" pattern |
| Contact | Convert, feed Leads collection | Plain form, honest 3-step status on submit |
| Notes index (phased) | Browse the engineering journal | Filter by topic/tag |
| Note detail (phased) | One journal entry | Document body, reference ID |
| Privacy | Legal | Plain text, footer-only link |

## 16. Content Strategy

- Real content only, always — applies with equal force to Blueprints (§11) and Notes (§14).
- Legacy project triage (still open, restated in §40): which past projects are Work vs Builds vs excluded.
- Voice: direct, confident, unembellished, verb-first — Labs/Notes shift further toward genuine engineer-to-engineer writing.
- Reference IDs (§27) are real content metadata, styled with the existing IBM Plex Mono "system voice" (e.g., a small `HZ-WK-014` badge beside a case study title).

## 17. Design Direction

- The lifecycle passage (§4) and Services evidence-links (§13) render as text and real links using the existing typographic hierarchy — never an illustrated diagram.
- Reference ID badges adopt the existing mono metadata treatment (`DESIGN_SYSTEM.md` §3, §9).

## 18. Component Architecture

Shared library: `Nav`, `CommandPalette`, `Button`, `Input`, `PillarCard`, `FilterChip`, `Tag`, `StatusIndicator`, `TeamRosterStage`, `Footer`, `ImageSlot`, `Form`, page-transition wrapper, plus:

- `ReferenceIdBadge` — mono-styled permanent ID display, used across every pillar detail page.
- `LifecycleLinks` — the inline linked stage-names used on the homepage and pillar index callouts.
- `BlockRenderer` — the single component tree that renders a Document (§25) into the design system's existing typographic language — the one guarantee that CMS-authored content and hand-designed pages never visually diverge.
- `EvidenceLinkList` — the repeated pattern on the Services page tying one service to its linked evidence.

`PillarDetailLayout` is extended, not replaced, per pillar's needs (Builds renders two Documents, Labs renders structured fields plus a journal Document, Blueprints adds the live-preview element).

## 19. SEO Strategy

`Organization`/`Website`/`BreadcrumbList` sitewide, per-item structured data, real indexable URLs for every pillar entry, honest metadata. Blueprints' live-preview links are marked up distinctly from the canonical detail page. Notes, once public, follow the same article-shaped structured data pattern and join the sitemap/internal-linking graph immediately on going public. Reference IDs are never used as slugs or keywords — they're a separate, permanent, displayed-but-not-routed identifier.

## 20. Accessibility Strategy

Full keyboard operability, visible focus rings, contrast minimums, reduced-motion support, alt text, aria-labels, 44px touch targets. Any AI-inserted image placeholder (§31) must be visually and semantically distinguishable from real published imagery using the existing `ImageSlot` empty-state pattern.

## 21. Performance Strategy

RSC by default, `next/image`, SSG/ISR for pillar and detail pages, scoped client components. Page regeneration is driven by CMS publish events (on-demand ISR revalidation, §28) rather than time-based polling.

**Scaling note (added in this pass):** index pages (Work, Builds, Blueprints, Labs, Notes) paginate server-side once a collection exceeds a comfortable single-page grid — never a client-side fetch-all — consistent with the "hundreds of entries" three-year horizon in §40.

## 22. Responsive Layout Strategy

1300px capped container, large-screen side margins used deliberately, `clamp()` typography, single-column collapse below ~900px. The nav density solution in §6 is part of this strategy, not a special case.

---

# Part II — CMS Architecture

## 23. CMS Philosophy & Scope

The CMS is a first-class part of HubZero, designed alongside the website. It is explicitly **not** a project management tool, an ERP, or an internal operations dashboard — its entire purpose is to publish, organize, maintain, and manage HubZero's public-facing content.

Initial scope: **Leads, Work, Builds, Blueprints, Labs, Team, Services, Notes**, plus the two structural systems everything else depends on: the **Document Engine** (§25) and its polymorphic **Documents** collection. Analytics dashboards, marketing automation, and internal wikis are explicitly out of scope and should not be absorbed into this system later without a separate decision.

## 24. Content Model Overview

The CMS is modeled around reusable content entities and their relationships, not around individual pages. Two kinds of entity exist:

- **Collection entries** — Work, Builds, Blueprints, Labs, Notes, Team, Services, Leads, Users, Media, Taxonomy. Structured, typed metadata + relations.
- **Documents** — the long-form body content owned by a collection entry, authored through the single shared Document Engine (§25). Documents are their own collection, not a field bolted onto each owner — see §25 for why this matters.

Core relationships:

| Relationship | Cardinality | Notes |
|---|---|---|
| User → Team | 1 to 0..1 | A CMS user's public-facing profile, if they have one — see §26.6/§26.9 for why these are two collections, not one. |
| Lab → Build | 0..1 | Set when a Lab graduates (§26.4); the Lab's journal Document remains attached and visible on both entries as historical record. |
| Build → Lab | 0..1 (inverse) | "Related Labs" on a Build page (§10). |
| Build ↔ Work | many-to-many | A Build can inform multiple client projects; a Work entry can reference the Builds/patterns it drew on. |
| Work/Build → Blueprint | many-to-many, optional | Set when a pattern is generalized into a reusable foundation (§4). |
| Service → {Work, Build, Blueprint, Lab} | many-to-many | The evidence links on `/services` (§13); Services never duplicates content, only references it. |
| Collection entry → Document(s) | 0..N | Any entry can own zero or more Documents, distinguished by `role` (e.g. `caseStudy`, `technical`, `journal`) — see §25. Not a special case per collection; a general rule that happens to produce two Documents for Builds today. |
| Note → {Work, Build, Blueprint, Lab} | many-to-many, optional | A Note can reference the entries it discusses. |
| User → Documents/Notes authored | 1-to-many | Authorship and permission checks (§29) key off the system identity (User), not the public profile (Team) — not every author necessarily has a public Team page. |
| Lead → User | 0..1 | Assignment for follow-up (§26.8). |

## 25. The Document Engine

No separate editors exist for Work case studies, Build documentation, Blueprint case studies, Lab journals, or Notes. All of them are authored through one shared, reusable block-based system: the Document Engine.

**Ownership model (unified in this pass):** a Document is its own top-level MongoDB collection, not a bespoke field on each owning collection. Every Document record carries `ownerType` (`Work` | `Build` | `Blueprint` | `Lab` | `Note` | `Team` | …), `ownerId`, and `role` (e.g. `caseStudy`, `technical`, `journal`, `profile`). A collection entry doesn't have "a case study" as a special field type — it owns one or more Documents queried by owner. This replaces the earlier per-collection special case (Builds having two named document fields) with one general rule: *any entry can own zero or more Documents, distinguished by role.* It's also precisely the mechanism that lets Engineering Profiles, changelogs, and announcements (§36) reuse the engine later — a new document type is just a new `role` value (or a new lightweight owning collection), never a schema change to an existing one.

This ownership model also has a direct performance benefit at scale (§40): index/list queries (Work index, Builds index, …) never need to load full block bodies, only owner metadata — Documents are fetched separately, only when rendering a detail page.

**Publishing status lives on the owner, not the Document.** A Document has no independent status field — visibility is governed entirely by its owning entry's status (§28). This avoids a redundant, easily-desynced second status field and keeps "is this thing published" a single-source-of-truth question.

**Storage model:** a Document is schema-driven, structured JSON — never arbitrary HTML. Each Document is an ordered array of blocks, each block a discriminated `{ type, id, data }` object validated against a shared schema (e.g., Zod) on both write and read. This is also the contract AI generation must produce output against (§31) — there is exactly one content shape in the whole system.

**Block catalog (v1, extensible):**

| Block | Purpose |
|---|---|
| Heading | Section structure |
| Paragraph | Body prose |
| Markdown | Escape hatch for quick structured text |
| Rich Text | Inline-formatted prose |
| Quote | Editorial emphasis, pull quotes |
| Code | Syntax-highlighted code samples |
| Image | Single Cloudinary-backed image |
| Image Gallery | Multiple images |
| Video Embed | External video |
| Divider | Visual/structural break |
| Callout | Flagged note |
| Table | Structured tabular data |
| Ordered List / Unordered List / Checklist | Structured lists |
| File Attachment | Downloadable reference material |
| Metrics / Statistics | Real, sourced numbers only — never fabricated, per §2 |
| Timeline | Sequenced events |
| Technology Stack | Structured tech list, linked into the shared taxonomy (§26.11) |
| Links | Related-resource links |
| References | Citations/sources |

New block types are added purely as new entries in the schema's discriminated union plus a corresponding `BlockRenderer` case (§18) — no redesign of storage, the editor shell, or existing documents.

**Rendering:** the same `BlockRenderer` renders a Document in both the CMS's live preview and the public site — one pipeline, so authored content can never visually drift from hand-built pages.

## 26. Collections

### 26.1 Work
Metadata: title, slug, reference ID (§27), client type, category/tags, timeline, role, technologies, status (§28), related Build/Blueprint links, hero image (Cloudinary). Owns: one Document (`caseStudy`).

### 26.2 Builds
Metadata: title, slug, reference ID, deployment state (live/retired), live URL, repo URL (optional), technologies, originating Lab (optional), related Work (optional). Owns: two Documents (`caseStudy`, `technical`) via the general ownership model in §25.

### 26.3 Blueprints
Metadata: name (enforced `Blueprint-X-Y` format at the schema level), reference ID, Architecture (X), Design Language (Y), description, feature list, technologies, status, live deployment URL (required, prominent), preview assets. Owns: one Document (`caseStudy`). Naming validation happens at write time.

### 26.4 Labs
Structured fields: stage (Exploring / Building / Testing), objective, next milestone, graduation criteria. Owns: one Document (`journal`) that accumulates findings/experiments/blockers over time. **Graduation mechanic:** an explicit "Graduate to Build" CMS action creates a new Build entry pre-linked to the originating Lab and carries the journal Document over as a read-only historical record visible from both entries.

### 26.5 Notes (Engineering Journal)
Metadata: title, slug, reference ID, author (**User**, not Team — see §24), tags/technologies, related collection entries (optional), status (full Draft → In Review → Approved → Published → Archived workflow, §28). Owns: one Document (`body`).

### 26.6 Team
Public-facing profile content. Fields: name, role, bio, group (Founders / Operating Team / Engineering Team — adjustable, not hardcoded), portrait (Cloudinary), `publicProfile` boolean, `userId` (optional link back to the corresponding Users record, §26.9 — optional because a public profile and a system login are two different concerns; most of today's five people have both, but neither implies the other). Only appears on the public `/about` roster once `publicProfile` is explicitly set. This is also the extension point Engineering Profiles will use later (§36).

### 26.7 Services
Small, low-volume collection — HubZero's service lines (e.g. "Web & Full-Stack Engineering," "AI/ML," "Embedded & Hardware Integration"). Fields: title, short description, evidence links into Work/Builds/Blueprints/Labs (§13, §24). Given its low volume and low change-frequency, Services uses a simplified two-state status (Draft/Published) rather than the full five-state workflow in §28 — the review overhead of the full workflow isn't earned by a handful of entries maintained directly by Admins/Head Admin.

### 26.8 Leads
Deliberately minimal, not a CRM: contact details, message, source (captured automatically from the originating page/referrer), status (New / Contacted / Closed — three states, not a sales pipeline), assignment (**User**), internal notes, follow-up status. **Leads do not receive a public reference ID (§27)** — they're an internal operational record with no citation or public-display purpose, so MongoDB's own identifier is sufficient; adding a `HZ-LD-###` scheme designed for published content would be unneeded complexity here.

### 26.9 Users
System identity for CMS access — the account that logs in, holds a role (§29), and is the actor behind authorship/assignment fields sitewide. Never rendered publicly by itself (public presentation is what Team, §26.6, is for). Backed by an Auth.js-style session model consistent with `AUTH_SECRET`/`AUTH_TRUST_HOST` (§34).

### 26.10 Media
Every uploaded asset is a Cloudinary reference (public ID, URL, transformation metadata, alt text, reuse tags), never a locally stored file. One Media record can be reused across multiple Documents/entries.

### 26.11 Taxonomy (Tags / Categories / Technologies)
One shared collection referenced by Work, Builds, Blueprints, Labs, and Notes, rather than each maintaining its own free-text tag list — each entry carries a `kind` discriminator (`technology` | `category` | `topic`) so one collection can power distinct filter facets (a Work category chip vs. a Build's tech stack) without becoming undifferentiated tag soup. This is what powers "search by Technology" (§7) and keeps filter chips consistent across every pillar.

### 26.12 Documents
The polymorphic long-form content collection described fully in §25 — listed here for completeness of the collection inventory. `{ ownerType, ownerId, role, blocks[] }`, no independent status field.

## 27. Reference ID Strategy

Every published-content entry receives a permanent, CMS-generated reference identifier: `HZ-{COLLECTION}-{NNN}`.

| Collection | Prefix | Example |
|---|---|---|
| Work | `WK` | `HZ-WK-001` |
| Build | `BL` | `HZ-BL-001` |
| Blueprint | `BP` | `HZ-BP-001` |
| Lab | `LB` | `HZ-LB-001` |
| Note | `NT` | `HZ-NT-001` |
| Team (internal) | `TM` | `HZ-TM-001` |

Leads and Users do not receive reference IDs (§26.8, §26.9) — the scheme exists for content that is published, cited, or displayed, not for internal operational/identity records.

IDs are generated server-side via an atomic, per-prefix counter (`findOneAndUpdate` increment on a small counters collection) so simultaneous creations can never collide. Once assigned, an ID is permanent — it never changes even if the entry's title or slug changes, and is never reused. IDs are visible inside the CMS on every entry and, where appropriate, displayed publicly as a small mono badge (§17, §18) beside the entry's title.

## 28. Publishing Workflow

`Draft → In Review → Approved → Published → Archived (optional)` — one shared state machine used across Work, Builds, Blueprints, Labs, and Notes (Services uses the simplified two-state variant noted in §26.7).

- **Draft** — actively being written.
- **In Review** — submitted for review; visible to Admins/Head Admin in a review queue.
- **Approved** — cleared to publish, not yet live.
- **Published** — live; triggers on-demand ISR revalidation (§21).
- **Archived** — removed from public view without deleting the record.

Enforced most strictly on Notes — public engineering writing under the HubZero name, so not every Team Member can publish directly (§29 defines exactly who can move an entry through which transition).

## 29. Permissions Model (User Roles)

| Capability | Head Admin | Admin | Team Member |
|---|---|---|---|
| Create/edit any collection entry | Yes | Yes | Own entries + assigned entries only |
| Move Draft → In Review | Yes | Yes | Yes |
| Move In Review → Approved | Yes | Yes | No |
| Move Approved → Published (publish) | Yes | Yes | No |
| Unpublish / override any entry, including another Admin's | Yes | No | No |
| Manage Users and roles | Yes | No | No |
| Manage system configuration (env-level settings, integrations) | Yes | No | No |
| Repository ownership / final authority | Yes | No | No |

*(Simplified in this pass: Admin's publish capability is unqualified "Yes" across all collections, matching the "full content management" description below — the earlier "within owned collections" phrasing implied a per-Admin ownership boundary that was never actually requested and only added ambiguity.)*

- **Head Admin** — complete system control, repository owner, final publishing authority. This account belongs to Rifaque.
- **Admins** — intended for HubZero's founders; full content management across all collections, but cannot override Head Admin ownership or another Admin's published content without Head Admin escalation.
- **Team Members** — intended for future employees; can create and edit content within their permissions but cannot publish directly or touch system configuration.

Flat three-tier system today, designed to extend (e.g. a future collection-scoped "Reviewer" role) without restructuring, since permissions are checked per-capability against a role, not hardcoded per collection.

## 30. CMS Editorial Experience

Added in this pass — the review asked explicitly for an editor's-eye view, which the previous revision didn't cover at all.

- **One dashboard, one mental model.** A single landing view lists all collections (Work, Builds, Blueprints, Labs, Notes, Services, Team, Leads), each with entry counts by status. There is no separate "app" per collection to learn.
- **Creating content is one obvious action per collection** — a "New Entry" button that opens the same form shell every time: structured metadata fields at the top, the Document Engine editor below when the collection owns one (§25). An editor who has created a Work entry already knows how to create a Note.
- **Relationships are pickers, not IDs.** Every relational field (originating Lab, related Work, evidence links on a Service) is a searchable select showing real titles, never a raw ObjectId to paste in. Reverse relationships render automatically from the same underlying reference — e.g. a Lab that graduated shows "Graduated to: [Build]" without a second field anyone has to maintain.
- **Reference IDs are read-only.** Assigned automatically on first save (§27); never a decision an editor has to make.
- **Workflow is a small stepper, not a dropdown of five states.** The status control only ever shows the valid next transition(s) for the current role (§28, §29) — a Team Member sees "Submit for review," not a free choice among all five states.
- **AI assistance is opt-in, not the default path.** The "Generate Content" action (§31) lives as one toolbar entry inside the block editor — the blank editor with a cursor is what an editor sees first, not a generation prompt. This is a deliberate interface choice reinforcing that the AI is an assistant, not the default way content gets made.
- **The interface stays engineering-focused:** no widgets, no vanity metrics, no dashboard chrome beyond what's needed to see status and get to an entry — calm and minimal, per the founder's stated bar, and consistent with `DESIGN_SYSTEM.md`'s content-before-decoration principle applied to the admin surface, not just the public one.

## 31. AI-Assisted Content Generation

An assistive feature inside the Document Engine's editor — a **Generate Content** action — never a publishing mechanism. Every generated block lands as Draft content a human must review, edit, and explicitly move through §28's workflow.

**Inputs:** free-form text, long engineering notes, project summaries, meeting notes, pasted documentation, uploaded files, uploaded reference images.

**File understanding:** Markdown, PDF, DOCX, TXT, and similar technical/reference documents. Text is extracted server-side and used purely as generation context for that one request — uploaded reference documents are **temporary generation inputs**, discarded after the request; they never become permanent Media (§26.10) or get written to the database.

**Output requirements — the core guardrail:** the AI never generates arbitrary HTML or Markdown as final output. It generates only structured blocks conforming exactly to the Document Engine's schema (§25), validated server-side before ever reaching the editor; anything that doesn't validate is rejected, not silently coerced.

**Image placement:** when reference images are supplied, the AI determines where they logically belong. When no suitable image exists, it inserts an explicit, clearly-labeled placeholder (visually distinct per §20) rather than fabricating or silently omitting — the author must see and resolve every placeholder before publishing.

**Philosophical guardrail:** because §2 makes "evidence before claims" governing, fabricated outcomes, metrics, or claims in AI drafts are a hard failure, not a style issue — the human review checkpoint at Approved (§28) is where this gets caught before Published.

## 32. AI Provider Architecture

The language model is interchangeable infrastructure, not a hardcoded editor dependency. The CMS talks to an internal AI service layer through its own vocabulary — `GenerationRequest` in, `GenerationResult` out, both defined in HubZero's schema terms, never Gemini's request/response shapes. Today's `GeminiProvider` is solely responsible for translating to and from Gemini's actual API shape *inside* the provider; nothing Gemini-specific (its request format, its content-part structure, its safety settings shape) ever crosses the interface boundary into the editor or the database. Swapping providers later means implementing the same `ContentGenerationProvider` interface — zero changes to the editor or the block schema it targets.

Each request assembles: structured project/entry metadata, uploaded free-form text, extracted document content, uploaded image metadata, requested content type, desired tone, and the supported Document Engine block schema. The provider is expected to return only structured block objects matching that schema — the service layer, not the model, is the enforcement point (§31), so a misbehaving provider fails safely rather than corrupting content.

## 33. Media Management

Cloudinary is the sole media storage provider (§26.10) — the CMS never stores image files locally or in the database. The CMS layer manages upload, optimization, transformation, metadata, and reuse. Every image referenced from Work, Builds, Blueprints, Labs, Team, Services, and Notes originates from Cloudinary and is stored in the database only as a reference, never as binary data.

## 34. Database Architecture

MongoDB, with collections modeled around the reusable content entities in §24/§26 — Users, Team, Leads, Work, Builds, Blueprints, Labs, Notes, Services, Documents, Media references, Taxonomy, and reference-ID counters (§27) — rather than around individual pages. Indexing: unique index on each collection's `slug`; unique index on `referenceId` where applicable; compound index on Documents' `(ownerType, ownerId)` for fast owner lookups; indexes on `status` (§28) and taxonomy references (§7). Relationships (§24) are modeled as ObjectId references rather than embedding, since most are queried independently (e.g. "all Notes referencing this Build" is a real query, not just a display convenience).

## 35. Environment Configuration

| Variable | Purpose | Exposure |
|---|---|---|
| `MONGODB_URI` | Database connection | Server-only |
| `NEXT_PUBLIC_SITE_URL` | Absolute URL generation (OG tags, canonical URLs, sitemap) | Public |
| `AUTH_SECRET` | CMS session/auth signing | Server-only |
| `AUTH_TRUST_HOST` | Auth host trust config | Server-only |
| `CLOUDINARY_CLOUD_NAME` | Media provider config | Server-only |
| `CLOUDINARY_API_KEY` | Media provider auth | Server-only |
| `CLOUDINARY_API_SECRET` | Media provider auth | Server-only |
| `GEMINI_API_KEY` | AI provider auth for `GeminiProvider` (§32) | Server-only |

No AI, database, or media credential is ever exposed to the client — every call happens through server-side routes/actions, consistent with the AI service-layer boundary in §32.

## 36. Future Extensibility

Not implemented now — this section confirms the architecture above doesn't need redesigning when these arrive:

- **Engineering Profiles (v5.1)** — attaches to Team (§26.6) as an additional owned Document (`role: profile`) plus reuse of the existing `publicProfile`-style visibility flag. One new `role` value, one new public route — not a schema migration.
- **Technical documentation, changelogs, announcements** (raised directly in this review's future-growth question) — each is either a new `role` on an existing collection (e.g. a Build's changelog as `role: changelog`) or, where it needs its own metadata (an Announcement's publish date, audience), a small new collection that owns exactly one Document — never a new editor, never a new block schema.
- **Version history, collaboration, commenting, translations** — all become additions to the Document Engine's storage/rendering layer (§25), inherited by every current and future owner simultaneously, rather than a feature that has to be re-built per content type.

---

# Part III — Delivery

## 37. Technical Architecture (Stack Summary)

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion, per `DESIGN_SYSTEM.md` §14.
- **CMS/backend:** Next.js server routes/actions as the CMS API surface, MongoDB as the database, Auth.js-style session auth for CMS users only (no public visitor accounts).
- **Media:** Cloudinary, referenced not stored.
- **AI:** Gemini today, behind the interchangeable provider interface (§32).
- **Rendering:** SSG/ISR for all public pages, revalidated on publish events (§21, §28).

## 38. Phased Implementation Roadmap

| Phase | Scope |
|---|---|
| 0 | Design tokens, Tailwind theme, fonts **+** MongoDB connection, Auth.js scaffold, environment/secrets wiring |
| 1 | Core content schemas (Work/Builds/Blueprints/Labs/Notes/Team/Services/Leads/Users/Media/Taxonomy), the polymorphic Documents collection, reference-ID counters |
| 2 | Document Engine editor UI + shared `BlockRenderer` + base CMS dashboard shell (collection list views, relation pickers, status steppers, §30) |
| 3 | Auth & roles (Head Admin/Admin/Team Member), permissions middleware, publishing workflow state machine |
| 4 | Global site chrome: nav (7 items, §6), collection-driven command palette (§7), footer, page transitions — validate nav density with real content before locking label text |
| 5 | Component library: cards, chips, tags, status indicators, `ReferenceIdBadge`, `LifecycleLinks`, `EvidenceLinkList` |
| 6 | Home + About, populated live from the Team collection |
| 7 | Work: CMS-driven index + case study template, seeded with 1–2 real, triaged entries |
| 8 | Builds: two-Document structure (§10), seeded with QueryCraft and ZeroLink |
| 9 | Blueprints, launch pillar (§11) — gated on at least one real, deployed blueprint existing |
| 10 | Labs: engineering-notebook structure (§12), seeded with genuinely active work; graduation-to-Build mechanic |
| 11 | Services: evidence-linked, CMS-driven page (§13) |
| 12 | Leads: contact form → Leads collection, assignment/status, notification on submission |
| 13 | AI-assisted generation (§31, §32) — layered on top of a stable Document Engine, not before |
| 14 | Notes goes public (`/notes`, nav/search inclusion) once real published content exists |
| 15 | Verification pass: SEO, accessibility, performance, mobile experience, product polish, release checklist |

## 39. Risks, Assumptions, and Recommendations

- **Legacy project triage** — still needs sign-off before Phase 7/8 content seeding.
- **Blueprints launch gate** — no real blueprint exists yet; Phase 9 content cannot go live without at least one real, deployed foundation.
- **Review workflow bottleneck** — with five people wearing both Admin and Team-Member-shaped hats in practice, the Notes review gate should be watched for friction once real usage patterns appear, not assumed correct from the plan alone.
- **AI generation cost/availability** — external Gemini dependency; the provider abstraction (§32) mitigates lock-in but not availability, so Phase 13 should never be treated as launch-blocking.
- **Fabrication risk in AI drafts** — the single highest reputational-risk failure mode if an invented metric slipped through; the human review checkpoint (§28, §31) is the control and should be treated as non-negotiable.
- **Search index scaling** — addressed directly in this pass (§7); revisit the build-time-index-to-server-endpoint transition once collection sizes actually approach the volumes discussed in §40, not preemptively.
- **Schema evolution discipline** — MongoDB's flexibility cuts both ways; the Document Engine (§25) and shared Taxonomy (§26.11) are the specific mechanisms meant to prevent collections drifting back into page-specific special cases — new content needs should extend those first.

## 40. Open Decisions Requiring Sign-off

1. **Legacy project triage** — which existing projects map to Work vs Builds vs exclusion.
2. **First real Blueprint** — what it is and when it can realistically be built, since Phase 9 is gated on it.
3. **Nav density outcome** — confirm the §6 approach once built and measured.
4. **Team grouping** — confirm "Founders / Operating Team / Engineering Team" (§26.6) or provide the real structure.
5. **Notes launch timing** — confirm the phased approach (§14/§38 Phase 14).
6. **AI provider budget/quota expectations** — confirm Gemini usage limits so Phase 13 scope can be sized correctly.

## 41. Architecture Approved — Final Summary

This refinement pass found and fixed four real architectural issues rather than confirming the previous revision as-is:

1. **Documents unified.** Long-form content (case studies, technical docs, Lab journals, Notes) is now one polymorphic `documents` collection (`ownerType`, `ownerId`, `role`) instead of inconsistent bespoke fields — the mechanism that makes the Document Engine genuinely reusable for anything HubZero adds later (Engineering Profiles, changelogs, announcements) without touching existing schemas, and that keeps list-page queries cheap as content scales into the hundreds.
2. **Services formally defined.** It existed only as a cross-reference before; it's now a real, minimal collection (§26.7) with a deliberately lighter two-state workflow, matching its actual size and change frequency.
3. **Users and Team decoupled.** System identity (who can log in and what they can do) and public presentation (who's shown on `/about`) are now explicitly two collections linked by an optional reference, not two records that could silently drift out of sync.
4. **CMS editorial experience specified.** The plan previously described only data; §30 now describes what it actually feels like to create, edit, and publish something — the dimension the founder specifically asked to be evaluated.

Smaller simplifications: Leads no longer carry an unnecessary public reference ID; the Admin permissions table no longer implies an undefined "owned collections" boundary; the AI provider interface is explicitly specified in HubZero's own vocabulary so Gemini's API shape can never leak into the editor; and both the command palette and index pages now have an explicit answer for what happens as content grows from tens to hundreds of entries.

The architecture is sound at the scale discussed (hundreds of Work entries, dozens of Builds, hundreds of Blueprints, years of Notes, a larger public team) without requiring speculative infrastructure today — every extension point named in this review (Engineering Profiles, changelogs, announcements, additional roles) is reachable through mechanisms already in the design (a new `role` value, a new lightweight collection, a new permission check), not through a future redesign.

**Both the website architecture (Part I) and the CMS architecture (Part II) are approved. Implementation may begin at Phase 0.**
