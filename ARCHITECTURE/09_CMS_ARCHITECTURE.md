# 09 — CMS Architecture

> **Status: Founder Approved — 2026-07-01; amended 2026-07-04, 2026-07-06.** §1, §3, and §4 below were substantially revised in the founder-approval session — see `00_FOUNDER_APPROVAL.md` §3 for the full rationale. The Payload-CMS framing originally in §1 is superseded; the department-based role model originally in §4 is replaced entirely. §2's collections table was extended 2026-07-04 with Builds and Blueprints, and the Labs/R&D row updated to reflect its new status as a permanent pillar — see `00_FOUNDER_APPROVAL.md` §8 and `17_COMPANY_STRUCTURE.md`. **2026-07-06:** every narrative collection's fixed markdown fields (`problem`/`approach`/`result`, `description`, `body`, `customizationNotes`) were replaced by a single ordered `content` (editorial blocks) field, plus `summary`/`featured`/`readingTimeMinutes`/`contributors` — see `20_CONTENT_BLOCKS.md`, the canonical spec; §2's table below reflects the new shape.

> Decision convention: see `01_PRODUCT_VISION.md` §0. This is the single most consensus-backed requirement in the entire planning dataset — CSV Q19-22 show every respondent wanting real CMS workflow features, rated 4-5/5 importance by all four.

## 1. Build approach: fully custom, not a configured third-party CMS **[Amended 2026-07-01]**

The original framing here weighed a managed headless CMS (Sanity, Payload, etc.) against a custom admin panel and leaned toward Payload as the presumed engine. The founder's explicit direction supersedes that: **build a fully custom CMS and admin platform for HubZero**, on Next.js App Router + MongoDB. Mature, battle-tested libraries are reused for generic infrastructure only — authentication, the rich-text editor, uploads, validation — but all business logic, workflows, dashboards, permissions, and content management are hand-built around HubZero's specific model. This is deliberately a long-term internal platform, not a configured instance of someone else's CMS. The requirements in this document are the spec for that custom build.

## 2. Content types (collections)

| Collection | Fields (summary) | Workflow |
|---|---|---|
| **Case Studies** | client, industry, practice area (Software/Hardware/Both/AI), summary (card blurb), **content (ordered editorial blocks — `20_CONTENT_BLOCKS.md`)**, tech tags, cover image, contributors (Team Members), featured flag, reading time (computed), slug, status | Draft → Review → Published (content approval, **[Consensus]** Q19) |
| **Builds** *(new, 2026-07-04)* | title, tagline (card blurb), practice area, **content (ordered editorial blocks)**, tech tags, cover image, contributors, featured flag, reading time (computed), launch date, live URL (optional), repo URL (optional), graduated-from-Labs reference (optional), slug, status | Draft → Review → Published; completed, first-party HubZero products — no `client` field, the structural difference from Case Studies (`17_COMPANY_STRUCTURE.md` §2, §4) |
| **Labs / R&D Projects** *(new, 2026-07-01; generalized 2026-07-04)* | title, summary (card blurb), practice area (Software/Hardware/AI), **content (ordered editorial blocks)**, tech tags, cover image, contributors, featured flag, reading time (computed), disclosure that it is non-client/internal work, **stage** (active/archived/graduated), **graduated-to-Build reference** (optional), slug, status | Draft → Published; now a permanent top-level pillar covering all exploratory engineering, not only the Hardware & Embedded page's interim proof mechanism (`00_FOUNDER_APPROVAL.md` §2, §8) |
| **Blueprints** *(new, 2026-07-04)* | unique Blueprint ID, slug, name, category, summary (card blurb), **content (ordered editorial blocks, including customization notes as blocks)**, tech stack, preview URL, demo deployment URL, cover image, contributors, featured flag, reading time (computed), **demo status** (live/stale/retired), status | Draft → Review → Published; publishing is gated on `demoStatus: 'live'` — a Blueprint with a stale or nonexistent demo is not shown publicly (`05_CONTENT_STRATEGY.md` §2b) |
| **Team Members** | name, username, role, bio, photo, skills, social links, core-member flag, profile-visible flag | Draft → Published |
| **Testimonials** | quote, attributed name, title, company (optional), linked case study (optional) | Draft → Published; schema rejects unattributed entries (`05_CONTENT_STRATEGY.md` §3) |
| **Services** | title, practice area, description, capability list | Draft → Published (low edit frequency) |
| **Notes** | title, summary, **content (ordered editorial blocks)**, author (ref to Team Member), contributors (additional Team Members), category, tags, cover image, featured flag, reading time (computed), slug, status | Draft → Review → Published |
| **FAQs** | question, answer, category | Draft → Published |
| **Career Listings** | title, description, requirements, status (open/closed) | Draft → Published |
| **Leads** (contact submissions) | name, email, company, project type, budget range, message, status (new/contacted/closed), source page | System-generated, not authored — admin-viewable and updatable |
| **Site Settings** | founding year, current stats (real numbers only, `05_CONTENT_STRATEGY.md` §3), social links, footer content | Single-document, founder/core-team edit only |

## 3. Workflow features — hybrid model for MVP **[Amended 2026-07-01, see `00_FOUNDER_APPROVAL.md` §3]**

Every content type supports **Draft** and **Published** states, shipped in the MVP, not deferred:

- **Company-wide content** (pages, services, company portfolio/case studies, navigation, SEO, site settings) requires **Admin or Head Admin approval** before publishing.
- **Personal content** — Teammates can create and edit their own Notes drafts and portfolio content freely, and submit for approval, but **cannot publish directly** unless explicitly granted.
- **Admins** can publish and manage all content, including approving Teammate submissions.
- **Version history is built from day one, for every content type** — treated as fundamental infrastructure, not an optional or deferred feature. Every publish creates a retrievable version; Admin/Head Admin can view and roll back.
- **Publishing workflow** triggers ISR revalidation of the relevant public page on Publish (per `08_TECHNICAL_ARCHITECTURE.md` §4) — replacing the legacy's manual rebuild-and-deploy requirement for any content change.
- **Autosave** — editor state persists on an interval so in-progress edits aren't lost — directly replaces the legacy blog editor's all-or-nothing "download a `.md` file or lose your work" model (`ARCHIVED_PROJECT_ANALYSIS.md` §3.9).
- **Explicitly deferred past MVP:** scheduled publishing, multi-stage approval chains, inline comments on drafts, and real-time collaborative editing.

## 4. Role-based access model — responsibility-based RBAC **[Replaced entirely, 2026-07-01, see `00_FOUNDER_APPROVAL.md` §3]**

The original department-based model (Founder, Core Team, Design, Developers, Content, Marketing, PM — one role per team function) is rejected. **Department membership is metadata, not a permission source.** Permissions are based on responsibility and authority, not which team someone sits on:

| Role | Scope | Can publish directly | Can manage users/roles/settings |
|---|---|---|---|
| **Head Admin (Founder)** | Unrestricted: users, roles, permissions, site/CMS/nav/SEO settings, media library, all company pages, all services, all portfolio content (company + individual), all Notes, Notes approval, draft management, publishing workflow, analytics, contact submissions, feature flags, future modules. Cannot be modified by other users. | Yes, everything | Yes |
| **Admin (Core Team)** | Company pages, services, company portfolio, all Notes, media, testimonials, careers, contact info, content SEO. Can approve Notes drafts. Can edit only their **own** individual portfolio, not another user's. | Yes, for company content | No — cannot manage users, roles, permissions, or system settings |
| **Teammate** (default) | Own profile, own portfolio, own Notes drafts (create/edit/submit for approval), personal media uploads. | No — unless explicitly granted | No |

**Dynamic permissions, not additional roles.** Some responsibilities are deliberately not modeled as permanent roles — they're assignable/removable permissions layered on any primary role:

- **Team Lead** — e.g. Admin + Team Lead, or Teammate + Team Lead. Grants: create projects, assign members, track project progress, manage project-specific files and discussions, view project analytics, close projects.
- The permission system is built so future dynamic permissions (Notes Reviewer, Recruiter, HR, Finance, Sales, Client Manager, Moderator, Support, Event Manager) can be added later **without redesigning the architecture** — this is a structural requirement, not a nice-to-have.

## 5. Authoring experience **[Amended 2026-07-06 — see `20_CONTENT_BLOCKS.md`]**

Every narrative collection's long-form content (case study, note, Labs/Build/Blueprint write-ups) is authored as an ordered sequence of editorial blocks (heading, paragraph, image, gallery, quote, callout, code, divider, metrics, timeline, video, spacer, two-column, markdown, raw HTML), not a fixed set of named markdown fields — `20_CONTENT_BLOCKS.md` is the canonical spec. The Markdown and quick-writing needs this section originally described are preserved as two of the fifteen block types (`markdown` for a full document in one block, `paragraph`/`quote`/`callout` for shorter inline prose) — the markdown-first writing experience isn't lost, it's one tool among several the author now chooses per block instead of the only option. The legacy "download a file and email it" workflow remains eliminated (`ARCHIVED_PROJECT_ANALYSIS.md` §3.9, §9.6) — nothing about the block system reintroduces it.

## 6. Frontend rendering consistency **[Amended 2026-07-06]**

**[Objective practice]** One rendering pipeline is used for every markdown-bearing block (the `markdown`/`paragraph`/`quote`/`callout` block types all route through the same `<RichText>` component, `components/marketing/rich-text.tsx`, built on `react-markdown`) for both the CMS preview and the actually-published page — fixing the confirmed legacy bug where these were two different pipelines producing visibly different output (`ARCHIVED_PROJECT_ANALYSIS.md` §16 problem #9). The generic `<ContentRenderer>`/`<BlockRenderer>` (`20_CONTENT_BLOCKS.md` §7) is the equivalent one-pipeline guarantee extended to every non-markdown block type (image, gallery, metrics, timeline, etc.) — one renderer, reused by every narrative collection's detail page, not a per-page reimplementation.
