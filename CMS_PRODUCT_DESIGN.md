# HubZero CMS — Product & Information Architecture

**Status:** Reviewed — the five open decisions in Appendix B have been analyzed (problem, options, trade-offs, recommendation) and resolved to a recommended default below. Not yet implemented; pending final sign-off before Phase 2 begins.
**Scope:** The CMS *experience* — navigation, dashboard, collection browsing, document editing, media, search, permissions, and how the product stays stable as it grows. This document does not change the data model. It is the product layer built on top of `PLANNING.md` Part II (§23–41), which remains the source of truth for collections, relationships, the Document Engine schema, publishing workflow, and role capabilities. Every section below cites the `PLANNING.md` section it implements.
**Why now:** Phase 0 (design tokens, DB, auth scaffold) and Phase 1 (collection schemas, Documents collection, reference-ID counters, auth & roles) are merged into `dev`. Phase 2 is the Document Engine editor UI and dashboard shell (`PLANNING.md` §38). This document is meant to be the blueprint that phase builds against, so it's written and reviewed *before* any component exists.
**Working assumption:** five-person team today, hundreds of entries within three years (`PLANNING.md` §40/§41). Every recommendation below is checked against both ends of that range, not just today's volume.

---

## 1. Overall Information Architecture

### Why group at all

`PLANNING.md` §23 draws a hard boundary: the CMS publishes and maintains content — it is not project management, not a CRM, not an ops dashboard. That boundary is the first organizing principle. The twelve items in the prompt aren't twelve equally-weighted destinations; they fall into four functions, plus two structural anchors (Dashboard, Settings):

| Group | Contains | Why it's one group |
|---|---|---|
| **Dashboard** | Dashboard | Not a collection — the single entry point, answering "what needs me right now" across every group below it. |
| **Content** | Work, Builds, Blueprints, Labs, Notes | Every one of these is a `PublishableEntity` (`cms.ts`) that runs the same five-state workflow (§28) and owns at least one Document authored through the same editor (§25). If it goes through Draft → In Review → Approved → Published, it lives here. Ordered to match the public nav (§6) an editor already knows: Work, Builds, Blueprints, Labs, then Notes (different cadence — an internal journal, not a launch pillar, §14). |
| **Studio** | Team, Services | Content *about* HubZero itself rather than things HubZero produced. Both are low-volume, low-change-frequency (§26.6, §26.7 — Services explicitly uses the simplified two-state workflow because "the review overhead of the full workflow isn't earned by a handful of entries"). Grouping them together, separate from Content, keeps the five-state-workflow collections visually and mentally uniform. |
| **Leads** | Leads | Deliberately its own top-level item, not folded into Studio or Content. It's the one collection that behaves like an inbox — new items arrive from outside, need triage, and age matters (§26.8). Burying an inbox inside a folder is the single most common way internal tools make daily-use collections invisible; it stays flat and visible instead. |
| **Library** | Media, Taxonomy | Neither is authored as a standalone narrative — both are shared resources *referenced from* Content and Studio entries (§26.10, §26.11: one Taxonomy collection powers every collection's filter chips; one Media collection is reused across Documents). Grouping them signals "supporting material," not "content in its own right." |
| **Settings** | Users, system configuration | Administrative surface, visibility gated to Head Admin for the roster/role parts (§29) and to Head Admin/environment owners for system config. Kept separate from Content/Studio so an Admin or Team Member's sidebar never has to visually coexist with controls they can't use. |

**Documents is deliberately not a nav item.** It's a real collection (§26.12) but it's polymorphic and always accessed through its owner (`ownerType`/`ownerId`/`role`) — there is no reason to ever browse "all Documents" as a flat list; that would just be every Content entry's body content with the metadata stripped off. It surfaces inside a Content entry's detail view, never in the sidebar.

### The tree

```
Dashboard

Content
├── Work
├── Builds
├── Blueprints
├── Labs
└── Notes

Studio
├── Team
└── Services

Leads

Library
├── Media
└── Taxonomy

Settings
├── Users            (Head Admin only)
└── System            (Head Admin only)
```

Two levels, maximum. No collection is ever nested under another collection — a Lab that graduated to a Build is a *relationship* (§24), shown as a linked reference on both entries, never a parent/child nav position. This is the same "avoid unnecessary nesting" instruction applied structurally: depth doesn't buy clarity here, it costs a click on every single visit, forever, for a five-person team that will open this sidebar dozens of times a day.

---

## 2. Navigation

### The standard this has to hit

`.hubzero/design/navigation.md` already answers the "which pattern" question for this product category before we even get to specifics: *"Internal dashboard — navigation usually needs to be persistent and low-friction, since the same operator returns to it dozens of times a day. Optimizing for confidence at first sight matters far less than optimizing for the hundredth use."* The CMS is exactly that product. Every choice below is checked against the hundredth-use bar, not the first-impression bar the marketing site correctly optimizes for.

### Approaches considered

| Approach | Fit |
|---|---|
| **Floating/adaptive nav** (marketing-site pattern) | Wrong tool here — its entire value is first-impression confidence, which an internal tool used dozens of times a day doesn't need and shouldn't pay motion/attention cost for. |
| **Top tab bar** (one tab per group) | Runs out of room fast — six groups today, and §36 already commits to adding modules (Engineering Profiles, changelogs) without restructuring. A tab bar has no graceful way to hold a seventh item; a sidebar does. |
| **Mega-menu / mixed sidebar+dropdowns** | Adds a hover/click layer between the user and the collection they already know they want — pure friction for a five-person team, all of whom will have this memorized within a week. |
| **Persistent left sidebar** | Matches the internal-dashboard guidance directly: always visible, zero interaction cost to switch collections, scales by adding a line, not a structural change. |

**Recommendation: persistent left sidebar**, collapsible to icon-only for screen width, never auto-hiding. Groups render as labeled sections (Content, Studio, Library, Settings); Dashboard and Leads sit un-grouped at the top since they're single destinations, not collections of destinations.

### Top bar

Minimal, and it does exactly three jobs: **where am I** (breadcrumb), **get me anywhere** (search trigger), **act right now** (contextual New/Publish button + user menu). No global stats, no notification bell doubling as a second inbox — Leads is already the inbox; a second one would compete with it.

### Breadcrumbs

`Group > Collection > Entry title (HZ-XX-000) > Document role`, only as deep as the current view actually is:

```
Content > Work > Northwind Platform Migration (HZ-WK-014) > Case Study
```

Every crumb before the last is a real link — clicking "Work" returns to the filtered/sorted list state the user left, not a reset list (state preservation matters more than it sounds like for someone triaging fifty in-review entries and jumping in and out of several).

### Global search & command palette

One index, two entry points — a `⌘K` palette and the top-bar search field open the same component. This deliberately mirrors the public site's collection-driven search (§7): same idea (index the CMS's own collections rather than maintaining a second parallel search structure), but the CMS index additionally includes every status (not just Published) and the two internal-only collections (Users, Leads), filtered by the viewer's permissions (§29) before results render. Full design in §7 below.

### Quick actions

A single **"New"** control in the top bar, contextual to wherever the user currently is — inside Work, it creates a Work entry; from the Dashboard, it opens a type picker. Same shell every time (§30: "an editor who has created a Work entry already knows how to create a Note"), so this is one button whose target changes, not twelve different buttons to learn.

### Recent & pinned items

- **Recent** — the last ~10 entries the user opened, kept per-user, shown in the command palette's empty state and as a collapsible sidebar section. No configuration needed; it's just a MRU log of detail-view visits.
- **Pinned** — user-chosen, persistent across sessions (e.g., a Lab someone checks daily, or the Blueprint they're mid-edit on). Pin/unpin from the entry's detail view or from a palette result. Kept intentionally simple: personal, not shared/team-visible pins — a shared "team pinboard" is a real feature but not one anything in the current scope asks for, and it would need its own ownership/visibility model to do properly.

### Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `⌘K` / `Ctrl+K` | Open command palette |
| `/` | Focus top-bar search |
| `g` then a letter (`g w`, `g b`, `g l`, `g n`, `g t`, …) | Jump straight to a collection (Work, Builds, Labs, Notes, Team, …) |
| `c` | New entry in current collection |
| `Esc` | Close palette/overlay, or step up one breadcrumb level if nothing's open |
| `Alt+↑` / `Alt+↓` | Reorder the focused block in the document editor (§5) |

This list is intentionally short at launch. `PLANNING.md`'s own bias — "every abstraction must earn its place" — applies to shortcuts too; more get added once real daily usage shows where the friction actually is, not speculatively now.

---

## 3. Dashboard

### What it refuses to be

No page-view counters, no "entries this month" bar chart, no vanity roll-up. `PLANNING.md` §30 already sets this bar for the whole CMS surface — "no widgets, no vanity metrics... calm and minimal" — the Dashboard is where that principle is tested hardest, because a dashboard is exactly where meaningless charts accumulate by default in most admin tools. Every widget below is a **live, filtered view into a real collection**, not a summary statistic. Clicking a widget's content always lands on the exact list-view filter that produced it — the Dashboard has zero data of its own; it's a set of saved entry points into Content/Leads.

### Widgets, mapped directly to the six required questions

| Question | Widget | What it shows |
|---|---|---|
| What needs my attention? | **Needs Your Attention** | Role-aware: a Team Member sees their own Draft entries with reviewer feedback attached, and anything assigned to them; an Admin/Head Admin sees the In Review queue filtered to collections they can act on. |
| What is waiting for review? | **In Review Queue** | Every In Review entry across Content, grouped by collection, each row showing *time in review* (e.g. "3 days") so staleness is visible without anyone having to ask — this is the one place age is surfaced as a first-class signal, because a stuck review is a real operational problem, not a vanity number. |
| What has changed? | **Recent Activity** | A compact chronological feed of status transitions and edits — "Sultan moved HZ-WK-014 → In Review", "Fatima published HZ-NT-009." This is the "what changed" answer; it's an activity log, not a metric. |
| What was recently published? | **Recently Published** | Last ~10 Published entries across every Content collection, each linking straight to its live page — lets someone confirm what actually went out without checking the public site by hand. |
| What drafts exist? | **Your Drafts** | Draft-status entries owned by the current user, sorted by `updatedAt` — surfaces half-finished work before it's forgotten. |
| What activity happened recently? | *(same as Recent Activity above — one widget answers both "changed" and "activity" rather than duplicating the same feed twice under two labels.)* |

One additional widget, justified by §26.8 rather than invented: **New Leads** — a count and short list of Leads still in `new` status, visible to whoever has Leads visibility (§8). Leads is the one collection where "how many things are waiting, untriaged" is itself the actionable fact, not a vanity count — it's the same shape as the In Review Queue widget, just for a different collection.

### Layout (wireframe-level, not visual design)

```
┌─────────────────────────────────────────────────────────┐
│  Needs Your Attention                                    │
│  (role-scoped list — the one section every role sees     │
│   something different in)                                │
├───────────────────────────────┬───────────────────────────┤
│  In Review Queue              │  New Leads                │
│  (Admin/Head Admin; Team      │  (Admin/Head Admin, or a   │
│   Member sees only own)       │   Team Member if assigned) │
├───────────────────────────────┼───────────────────────────┤
│  Your Drafts                  │  Recently Published        │
├───────────────────────────────┴───────────────────────────┤
│  Recent Activity (feed)                                   │
└─────────────────────────────────────────────────────────┘
```

A Team Member's Dashboard is the same layout with fewer rows in the shared widgets, not a different page — consistent with the "one dashboard, one mental model" principle already stated in §30.

---

## 4. Collection Experience

### One pattern, applied everywhere

Every Content/Studio/Leads collection — Work, Builds, Blueprints, Labs, Notes, Services, Team, Leads, and (with permission) Users — uses the exact same browsing shell. An editor who's used Work already knows Notes. The shell:

| Element | Behavior (same everywhere) |
|---|---|
| **List view** | Dense table, not cards — metadata-heavy entries with reference IDs, statuses, and relations scan faster as rows than as tiles. (Exception: Media, §6 — genuinely visual content gets a grid.) Default sort: `updatedAt` descending, so "what did someone just touch" is the default view, matching the Dashboard's own bias toward recency over any other ordering. |
| **Filters** | Faceted chips above the table: status (always present — it's the shared workflow, §28), plus each collection's own facets (below). Reuses the same `FilterChip` component the public site already has (§18), so the visual language of "this is a filter" never has to be relearned between the public site and the CMS. |
| **Search** | A per-collection search box scoped to title/slug/reference ID, instant-filter client-side at today's volume, moving server-side as a collection grows past a comfortable single-page size — the same scaling posture already committed to for the public site's index pages (§21) and command palette (§7), applied here instead of invented fresh. |
| **Sorting** | Any column header sorts; `updatedAt desc` is the default, `referenceId` and `status` are the other two sorts anyone will actually reach for. |
| **Bulk actions** | Multi-select via row checkboxes → bulk taxonomy tag assignment, bulk archive, bulk status transition — but only ever offering transitions valid for the acting role (§29), exactly like the single-entry stepper. Bulk-publish is allowed (an Admin can already publish one at a time; batching doesn't grant new power) but always shows an explicit confirmation naming the count and collection before committing, since it's the one bulk action that's genuinely hard to walk back quietly. |
| **Quick actions** | Per-row hover actions: Open, Duplicate as new Draft, Copy reference ID, View live (Published entries only), Archive. |
| **Detail view** | One consistent shell: header (title, `ReferenceIdBadge`, status stepper, Save/Preview/next-transition actions) → structured metadata form → relationship pickers → owned Document(s) below, tabbed by role when an entry owns more than one (Builds: Case Study / Technical, §10, §26.2). |

### Per-collection deltas

The pattern above is fixed; only the *facets* and *fields* differ, which is the point — nothing structural changes per collection, only content:

| Collection | Distinct list facets | Notable relationship pickers |
|---|---|---|
| Work | Category/tag, technology, timeline | Related Builds, related Blueprints |
| Builds | Deployment state (live/retired), technology | Originating Lab, related Work |
| Blueprints | Architecture (X), Design Language (Y) | Preview assets |
| Labs | Stage (Exploring/Building/Testing) | Graduated-to-Build (read-only, reverse relation) |
| Notes | Author, tag/technology | Related entries (Work/Build/Blueprint/Lab) |
| Services | *(none — low volume, browse the full list)* | Evidence links (Work/Build/Blueprint/Lab) |
| Team | Group (Founders/Operating/Engineering) | Linked User (optional) |
| Leads | Status (New/Contacted/Closed), assignee | Assigned User |
| Users | Role | Linked Team profile (reverse, read-only) |

**Relationships are always pickers, never IDs** — a searchable select showing real titles and reference IDs, exactly as already specified in §30. Reverse relationships (a Lab's "Graduated to: Build X", a User's linked Team profile) render automatically from the same underlying reference and are never a second field anyone has to keep in sync by hand.

---

## 5. Document Editing Experience

This is the one editor in the entire CMS — Work case studies, Build docs, Blueprint case studies, Lab journals, and Notes all open the same shell (§25). The design goal stated in the brief — *encourage thoughtful engineering writing, not blogging* — shows up as a deliberate absence of blog-editor conventions: no floating format bubble that follows the cursor everywhere, no cover-image-first template, no "reading time" estimate.

### Layout

```
┌─ Header: Title · HZ-BL-008 · [Draft → In Review] · Save · Preview ─┐
├──────────────────────────────┬──────────────────────────────────────┤
│                               │  Outline (auto-generated from        │
│   Block canvas                │  Heading blocks — click to jump)     │
│   (linear, capped line-       ├──────────────────────────────────────┤
│   length, generous vertical   │  Document tabs (Builds only):        │
│   rhythm — a page to write    │  Case Study / Technical              │
│   on, not a form to fill in)  ├──────────────────────────────────────┤
│                               │  Block inspector (settings for       │
│                               │  the currently selected block)       │
└──────────────────────────────┴──────────────────────────────────────┘
```

Main canvas is the writing surface; the right rail is entirely secondary — outline for navigating a long technical document, document-role tabs where an entry owns more than one Document, and a contextual inspector for whichever block is currently selected (e.g. a Table block's row/column controls, a Code block's language picker). Nothing in the right rail is required reading to write a paragraph.

### Block insertion

A `+` affordance between any two blocks opens a command menu (type-to-filter or browse by category) covering the full 21-block catalog already defined in `src/lib/documents/blocks.ts`, grouped so the menu itself teaches the taxonomy:

| Category | Blocks |
|---|---|
| Text | Heading, Paragraph, Rich Text, Markdown, Quote, Callout |
| Code | Code |
| Media | Image, Image Gallery, Video Embed |
| Structure | Divider, Table, Ordered List, Unordered List, Checklist |
| Reference & Data | File Attachment, Metrics, Timeline, Technology Stack, Links, References |

New block types (§25: "purely as a new entry in the schema's discriminated union") slot into one of these five categories — the menu doesn't need restructuring when a 22nd block ships, only one more row in whichever category fits.

### Block organization

Drag handle for mouse reordering; `Alt+↑`/`Alt+↓` for keyboard reordering (accessibility parity is not optional per `.hubzero/architecture/principles.md` — "Accessibility by Default"). Long blocks (Table, Image Gallery, Checklist with many items) are collapsible in place so a long technical document stays scannable while editing.

### Reusable blocks

The current schema (`blocks.ts`) has no "saved/synced block" concept — every block is local to its own Document. Rather than inventing a synced-block system the schema doesn't support, v1 ships the honest, smaller version: **copy a block, paste it into another document** (a plain duplicate, not a live link back to the original). A true reusable-block library (edit once, updates everywhere it's used) is a real future capability but belongs with the other "additions to the Document Engine's storage layer" already flagged for later in §36 (version history, collaboration) — it should be designed once, alongside those, not bolted on early as a one-off.

### Media insertion

Opens the Media Library picker (§6) rather than a bare file-drop — search or filter existing Cloudinary assets first, upload new only when nothing existing fits. Alt text is required *at insertion time* in the UI, not just enforced later by the schema's `altText: z.string().min(1)` — the editor should never let someone reach Save with an image block missing alt text, since catching it at the point of insertion is cheaper for the author than catching it at a validation error three scrolls later.

### References vs. relationship pickers

Two visually and conceptually distinct things that are easy to conflate, so the editor keeps them separate:
- **Relationship pickers** (metadata panel, §4) — structural links the data model understands: "this Work references these Builds."
- **References block** (in-document) — citations/evidence inside the prose itself, in service of §2's "evidence before claims" — a specific claim in paragraph three needs a specific source, which is a narrower and more precise thing than "this whole entry relates to that Build."
- **Links block** — plain in-document links to related resources, no citation weight implied.

### AI generation

One toolbar entry, **"Generate content"** (§30/§31) — never triggered automatically, never the first thing an author sees on a blank document. Opens a side panel for inputs (free text, pasted notes, uploaded reference files/images, desired tone); output lands as new blocks inserted at the cursor, each visually flagged (subtle left-border treatment + label, distinct from the `ImageSlot` placeholder pattern already used for missing images, §20) until the author has explicitly reviewed or edited it. A Metrics block generated by AI still carries the schema's required `source` field — the editor should refuse to let a generated Metrics block save with an empty source, same as a human-authored one, since §2's "evidence before claims" is a hard rule for AI drafts by explicit design (§31), not a soft one.

### Preview

Toggles the canvas into the exact `BlockRenderer` (§18/§25) the public site uses — literally the rendered page, not an approximation of it. This is the single mechanism that makes "what I see in the editor" and "what ships" the same guarantee already promised in §25.

### Publishing workflow

The status stepper in the header shows only the transition(s) valid for the acting role (§28/§29/§30) — never a five-option dropdown. One addition worth making explicit here that `PLANNING.md` doesn't fully spell out: when an entry is sent back from In Review to Draft, the reviewer should be able to attach a short note explaining why — a bare rejection with no reason is one of the most common sources of review-cycle friction in any editorial tool, and the cost of adding one optional text field to an existing transition is low.

**Resolved (Appendix B, decision 1):** editing an already-**Published** entry saves and goes live immediately — no forced re-review, no new reference ID, no slug change. This stays gated to Admin/Head Admin, who already hold unqualified publish authority (§29), so a stricter gate on *editing* than on *publishing* would be an inconsistency the plan never intended. Any editor can still invoke an explicit **"Submit for Re-review"** action on a Published entry when they judge the change substantial enough to want a second pair of eyes — the safety net stays reachable without being forced on every typo fix, which matters given §39's own flagged risk of review-gate friction on a five-person team wearing dual Admin/Team-Member hats. A full draft/live revision split (edits held separately until explicitly published) was considered and rejected for v1 — it's real versioning infrastructure, and §36 already reserves that for a later, deliberate addition alongside collaboration/commenting, not something to build piecemeal into the publishing model now.

---

## 6. Media Experience

Cloudinary is the only place a byte of image data ever lives (§26.10, §33) — the CMS holds references, never binaries.

- **Upload** — drag-drop or file picker, uploads directly to Cloudinary using signed parameters issued by a server route (the API secret never reaches the client, per the env-exposure table in §35). Progress indicator during upload; alt text is requested immediately after upload completes, before the asset is considered usable anywhere.
- **Folders** — one level only, matching "avoid unnecessary nesting": a lightweight tag corresponding to where the asset is mainly used (`work/`, `builds/`, `blueprints/`, `team/`, `general/`), not a deep folder tree. Cloudinary's own `public_id` prefixing is sufficient for this; no additional folder-hierarchy data model is needed.
- **Metadata** — alt text (required), reuse tags (free-form labels), dimensions (read from Cloudinary's upload response, not entered by hand), and a reverse **"used in"** list showing every Document/entry currently referencing the asset — this is what makes safe replacement or deletion possible at all.
- **Reuse** — the Media Library is a first-class searchable picker, reachable from any Image/Gallery block insertion and from any field that stores a Cloudinary reference directly (Team portraits, Blueprint preview assets, Work hero images). Search matches filename, alt text, and reuse tags.
- **Optimization** — the CMS never re-implements Cloudinary transformations; it stores the reference and lets the existing delivery pipeline (`next/image` + Cloudinary, §21/§37) handle responsive sizing, format, and quality at render time. Inside the editor, previews use a reasonably-sized derived transform rather than the original upload, so the editor stays fast regardless of source file size.
- **Image selection** — a grid picker (the one place Media departs from the table-first convention in §4, because images are inherently visual) with hover metadata (dimensions, reuse count) and inline upload.
- **Replacement (resolved, Appendix B decision 2)** — "Replace image" on an inserted block swaps the reference without touching the block's `id` or position, preserving document structure, and **always inserts a new Media record** rather than mutating the shared one in place — otherwise replacing an image in one Build's technical doc could silently change a hero image on an unrelated Work entry, the same "coupling unrelated state" failure mode `.hubzero/architecture/principles.md` warns against by name. The interface shows a plain usage-count warning ("used in 3 other places") so the editor knows they're touching only this one reference — not a decision prompt on every replace, since the overwhelmingly common case is an asset used nowhere else. A genuine "replace this file everywhere it's used" (e.g. a logo refresh) is a separate, deliberate action that lives in the Media Library itself, operating on the asset directly — never the default block-level Replace.

---

## 7. Search

The CMS search is the same philosophy as the public site's (§7) — one index generated from the real collections, never a separately hand-maintained shadow index — applied to a CMS user who needs to see *everything*, not just what's Published.

| It understands | How |
|---|---|
| Work, Builds, Blueprints, Labs, Notes | Title, slug, tags/technology — every status, not just Published (the key difference from the public-site index). |
| Team | Name, role, group — jumps to the profile or to content authored by that person. |
| Services | Title, description. |
| Documents | Full-text within block content — a heavier query than metadata matching, so this tier runs through the server-side search endpoint already planned for at scale (§7's scaling note), not the lightweight build-time index, from day one for the CMS (unlike the public palette, which only needs that tier once volume grows). |
| Media | Alt text, reuse tags, filename. |
| Technologies (Taxonomy) | Typing a technology name surfaces every Work/Build/Blueprint/Lab/Note tagged with it — the same mechanism that drives filter chips (§26.11), reused for search instead of duplicated. |
| Reference IDs | Treated as a priority exact-match lane above fuzzy text — typing `HZ-WK-014` (or a loose `wk 14`) jumps straight to that entry, since a reference ID is a permanent, precise identifier by design (§27) and deserves to behave like one in search. |

**Command palette integration:** search-as-you-type *is* the palette's primary mode — there's no separate "search page" to open first. Results group by entity type, each row showing the entity icon, title, reference ID, and status badge, so an editor can tell a Draft from a Published match without opening either. When the palette is opened empty (no query yet), it shows Recent items, Pinned items, and the handful of quick actions from §2 ("New Work entry," "Go to Leads") — the same component serves navigation, search, and action-launching, rather than three separate UI surfaces doing overlapping jobs.

Search results respect the viewer's permissions exactly as list views do (§8) — a Team Member without Leads visibility never sees a Lead surface in search results either, since a search shortcut that bypasses the permission model would be a real gap, not a convenience.

---

## 8. Permissions

The rule stated in the brief — *users should naturally understand what they can and cannot do* — is implemented by **hiding what a role can't reach, not disabling it**. A grayed-out "Publish" button invites "why can't I click this"; its absence doesn't. This section translates the capability matrix already defined in §29 into what's literally different on screen.

| | Head Admin | Admin | Team Member |
|---|---|---|---|
| Sidebar | Full tree, incl. Settings | Content, Studio, Leads, Library — **Settings hidden entirely** | Content, Studio (read) — **Leads and Settings hidden unless assigned** |
| Collection list rows | All entries, full actions | All entries, full actions | All entries visible (small-team transparency), but edit affordances appear only on entries they authored or are assigned to |
| Status stepper | Every transition, on any entry | Draft → In Review → Approved → Published, on any entry | Only "Submit for Review" — no Approve/Publish control ever renders (§30) |
| Unpublish / override | Yes, on anyone's entry | No | No |
| Bulk actions | All | All (own-authorization scope) | Limited to entries they could individually edit anyway |
| Users & roles | Full management | Not visible | Not visible |
| Leads | Full visibility, reassign | Full visibility, reassign | Only Leads explicitly assigned to them |
| Dashboard | Full In Review Queue across all collections | Full In Review Queue | "Needs Your Attention" scoped to own Drafts + feedback; no queue-wide view |

**Head Admin** — this account belongs to Rifaque (§29); complete system control, final publishing authority, the only role that can override another Admin's published content.
**Admin** — intended for HubZero's founders; full content management including publish, everywhere, but Settings and Users stay structurally invisible to this role, not just access-controlled.
**Team Member** — intended for future hires; can create and move content into review, but never sees a control for a transition they're not allowed to make. Read visibility into the wider Content tree stays intentionally open (a five-person studio has no reason to compartmentalize *seeing* each other's work, only *changing* it) — Leads is the one exception, since it can carry unvetted external contact information and defaults to Admin+-only unless a Lead is explicitly assigned.

---

## 9. Future Growth

The test for this whole document is whether it needs a redesign when the next module lands. It shouldn't, and here's why for each named case:

- **Engineering Profiles (v5.1)** — `PLANNING.md` §36 already frames this as an *additional owned Document* on Team (`role: profile`), not a new collection. In the IA, it's a nested view under **Studio → Team**, not a new top-level group or sidebar item — the IA absorbs it as a sub-view of something that already exists, which is exactly the proof that the two-level nesting rule in §1 has room without growing a third level.
- **Additional document types** (changelogs, announcements) — a changelog is a new `role` on an existing owner (a Build's changelog tab appears next to Case Study/Technical, same shell as §4's per-entry document tabs). An Announcement, needing its own metadata (publish date, audience), is a small new collection that owns exactly one Document — it slots straight into **Content**, since "runs the publishing workflow and owns a Document" is the actual membership test for that group, not a fixed enumerated list.
- **New collections generally** — group membership in §1 is defined by *function* (workflow-driven content vs. studio-facing vs. shared library vs. admin), so any new collection has an obvious home the moment its function is known. If a group's list ever grows past a comfortable single glance (Content passing roughly seven items, say), the fix is progressive disclosure *within* that group — a collapsible sub-list — never a new hierarchy level.
- **Multiple reviewers** — §29 already states the flat three-tier system is "designed to extend... without restructuring." The UI mechanism that makes this true: the status stepper (§5, §8) already renders "valid transitions for this role" from a capability table, never from a hardcoded role name. Adding a collection-scoped Reviewer role is a new row in that table, not a new component.
- **Richer editorial workflows** (multiple approvals, scheduled publishing) — additions to the existing five-state workflow (§28) as new states or a parallel field (e.g. an approval count), inheriting the same stepper UI every current collection already uses, rather than a second workflow engine living beside the first.

The information architecture in §1 is stable specifically because it was built on *function*, not on today's literal list of twelve names — a thirteenth collection or a new document role is a data problem, answered by an existing pattern, not a navigation problem requiring a new decision.

---

## Appendix A — Representative User Flows

**A team member drafts and submits a Note**
1. `c` from anywhere in Content, or the top-bar **New** while inside Notes → same form shell as any collection (§4): metadata fields, then the block editor below.
2. Writes using the block catalog (§5); inserts a Code block and a Links block; runs "Generate content" once on a rough paragraph, reviews and edits the flagged AI blocks before keeping them.
3. Status stepper shows exactly one available action: **Submit for Review**. Clicks it.
4. Entry now appears in every Admin's Dashboard **In Review Queue** and the author's own **Needs Your Attention**.

**An Admin reviews and publishes a Work entry**
1. Opens the **In Review Queue** widget on the Dashboard, or searches the reference ID directly via `⌘K`.
2. Reviews the Case Study document in Preview mode (real `BlockRenderer` output).
3. Either **Approves** → **Publishes** (triggers on-demand ISR revalidation, §21/§28), or sends it back to Draft with a short note — the author sees that note the next time they open the entry.

**A Lab graduates to a Build**
1. From the Lab's detail view, an explicit **"Graduate to Build"** action (§26.4) — not a manual create-new-Build-and-link workflow.
2. A new Build entry is created, pre-linked to the originating Lab; the Lab's journal Document carries over as a read-only historical record, visible from both entries' detail views without either side maintaining a second field.

**An editor replaces a hero image**
1. Opens the Work entry's metadata panel, clicks the current hero image.
2. Media Library picker opens already scoped to "used elsewhere" warnings; editor searches for the new asset or uploads one, confirms alt text.
3. New reference replaces the old one on this entry only — the prior asset, if used elsewhere, is untouched (§6).

---

## Appendix B — Resolved Decisions (formerly Open, Requiring Sign-off)

Following the same pattern `PLANNING.md` §40 already uses for the data-model layer, these were product-layer decisions this document originally flagged rather than silently assumed. Each has now been reviewed — problem, options, trade-offs, recommendation — and resolved to the default below, pending final sign-off before Phase 2 build starts.

1. **Editing a Published entry** — **Resolved: goes live immediately**, no forced re-review, restricted to Admin/Head Admin as already gated by §29. A manual "Submit for Re-review" action remains available for edits the author judges substantial. A full draft/live revision split was considered and deferred to whenever version history is designed (§36), rather than built ad hoc now. See §5.
2. **Replacing a shared Media asset** — **Resolved: replacement always creates a new record**, scoped to the one reference being edited, with a usage-count warning shown rather than a decision prompt. A separate, explicit "replace this file everywhere" action lives in the Media Library itself for the rare deliberate global swap. See §6.
3. **Reviewer rejection notes** — **Resolved: optional**, not required. A single skippable text field on the In Review → Draft transition, surfaced to the author and on their Dashboard. See §5.
4. **Team Member read-visibility scope** — **Resolved: full transparency.** Team Members read everything in Content/Studio; edit affordances stay limited to authored/assigned entries. Leads remains the deliberate exception (assignment-scoped), since it holds external, unvetted contact data rather than internal editorial work. See §8.
5. **Reusable blocks** — **Resolved: copy/duplicate only for v1.** True synced reusable blocks (edit once, updates everywhere) are deferred alongside version history/collaboration (§36), designed once as a bundle rather than retrofitted piecemeal. See §5.

---

**The navigation/IA (§1–2), the core experiences (§3–7), the permissions model (§8), and the five decisions above are proposed for final review here.** Nothing in this document has been implemented. Once approved, this becomes the blueprint Phase 2 (`PLANNING.md` §38) builds against.
