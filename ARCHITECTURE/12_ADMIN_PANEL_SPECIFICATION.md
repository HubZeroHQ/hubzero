# 12 — Admin Panel Specification

> **Status: Founder Approved — 2026-07-01.** §1-3 below updated to match the responsibility-based RBAC and hybrid workflow model in `00_FOUNDER_APPROVAL.md` §3, replacing the original department-based role references.

> Decision convention: see `01_PRODUCT_VISION.md` §0. Located at `/studio`, excluded from sitemap/robots (`03_INFORMATION_ARCHITECTURE.md` §5) — this is the system that replaces the legacy's entirely-manual, developer-bottlenecked publishing process (`ARCHIVED_PROJECT_ANALYSIS.md` §9.6).

## 1. Who uses it and what they see

Per `09_CMS_ARCHITECTURE.md` §4's responsibility-based role model, the dashboard surfaces only what a role can act on — a **Teammate** sees only their own profile, portfolio, and blog drafts; an **Admin** sees company content and blog approval queues but not user/role management; a **Head Admin** sees everything, including Users and Site Settings. Any user can additionally carry the **Team Lead** dynamic permission, which surfaces a project-tracking view regardless of their primary role.

## 2. Core screens

- **Dashboard** — at-a-glance: new leads count, content awaiting review (for Admins/Head Admin), recent activity.
- **Leads inbox** — list of contact submissions (`11_DATABASE_ARCHITECTURE.md` §1 Lead), filterable by status/project type, with the structured intake fields (project type, budget range) visible inline so the team can triage without opening email — directly serves the founder's stated qualification criteria (`01_PRODUCT_VISION.md` §3).
- **Case Studies** — list + editor (rich text for problem/approach/result, media upload, tag selection, status transitions, version history view).
- **Labs / R&D Projects** *(new, 2026-07-01)* — list + editor for internal/personal embedded projects shown on the Hardware & Embedded page as interim proof (`00_FOUNDER_APPROVAL.md` §2); simple draft/publish, no approval step required.
- **Team Members** — list + editor, including the `isCoreMember` / `profileVisible` toggles that implement the consensus decision to show only core members publicly (`06_PAGE_SPECIFICATIONS.md` Team), and leadership-title fields supporting the Founder + co-founders structure.
- **Testimonials** — editor with required name/title fields enforced at the form level, not just the schema, so an editor cannot even attempt to save a placeholder/unattributed entry (`05_CONTENT_STRATEGY.md` §3).
- **Services, FAQs, Career Listings** — simpler list+editor screens, lower workflow overhead; Services `practiceArea` field accepts new verticals without a schema change (`00_FOUNDER_APPROVAL.md` §6).
- **Blog** — editor with the same unified markdown/MDX rendering used on the public site (`09_CMS_ARCHITECTURE.md` §6), live preview, autosave. Shipped in full for MVP, not deferred (`00_FOUNDER_APPROVAL.md` §3).
- **Site Settings** — Head Admin only; founding year (2024), real stats, social links.
- **Users** — Head Admin only; invite/manage admin accounts, assign primary role and dynamic permissions (e.g. Team Lead).

## 3. Approval workflow UI — hybrid model **[Amended 2026-07-01]**

Company-wide content (pages, services, company portfolio/case studies, nav, SEO, site settings) requires Admin/Head Admin approval before publishing: a submitter moves a draft to "In Review"; an Admin/Head Admin sees it in a review queue, can request changes (with a comment, returning it to Draft) or publish it directly. Teammates' own blog and portfolio drafts follow the same submit-for-approval path but can never be self-published. Version history is visible on every content item regardless of collection, built from day one rather than added later (`09_CMS_ARCHITECTURE.md` §3). Scheduled publishing, multi-stage approval, inline comments, and collaborative editing are explicitly out of scope for this UI in v1.

## 4. Autosave and version history UI

Editor screens autosave on an interval and on blur, with a visible "saved" indicator (replacing the legacy blog editor's all-or-nothing download model). Every published version is listed on the content item with a timestamp and editor name; a Head Admin or Admin can view a diff-style comparison and roll back — satisfying the version-history request (CSV Q19) concretely rather than as an abstract promise.

## 5. Authentication

Email/password or SSO-style login (provider choice is an implementation detail, not a business decision) gated by `08_TECHNICAL_ARCHITECTURE.md`'s auth solution. No public self-registration — accounts are created by a Head Admin via the Users screen, consistent with this being an internal tool, not a public product.

## 6. What the admin panel is explicitly not

Not a client-facing portal (see `04_USER_JOURNEYS.md` §3 — explicitly out of v1 scope), not a project-management tool (leads are tracked, but task/sprint management for delivering client work is a separate concern the team already may use Slack/Discord/a PM tool for, per CSV Q25 — the admin panel does not try to replace that), not a general-purpose website builder (page layouts are defined in code per `08_TECHNICAL_ARCHITECTURE.md`; the CMS manages content within those layouts, consistent with the **[Consensus]** CSV Q18 answer — "only important pages," not every page — being editable from the dashboard).
