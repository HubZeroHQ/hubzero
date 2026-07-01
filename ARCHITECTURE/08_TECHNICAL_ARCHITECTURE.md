# 08 — Technical Architecture

> **Status: Founder Approved — 2026-07-01.** See `00_FOUNDER_APPROVAL.md` §3 (CMS build approach — fully custom, not a configured third-party CMS) and §4 (data retention/backup policy, new §9 below) for revisions incorporated in this session.

> Decision convention: see `01_PRODUCT_VISION.md` §0. New application root is repo root, NOT `client/` (per the rebuild instruction, Step 12) — `client/` remains untouched as the legacy reference implementation until cutover.

## 1. Why a backend is now required

The single biggest technical-architecture change from the legacy system: **the legacy site has no backend, no database, no auth** (`ARCHIVED_PROJECT_ANALYSIS.md` §8, §10, §11) — all content is static JSON/markdown, all forms delegate to third parties (Formspree, FormSubmit.co). This directly contradicts the strong, near-unanimous team desire for a real CMS — **[Consensus]** CSV Q19 (drafts, publishing workflow, role-based access, content approval, autosave, version history all requested across responses) and Q20 (importance of a modern CMS rated 4-5/5 by all four respondents). A static-JSON site cannot support any of that. v2 requires a real application backend.

## 2. Stack decision

| Concern | Legacy | v2 | Rationale |
|---|---|---|---|
| Framework | Next.js 15 (App Router) | Next.js (latest stable App Router) | Already the right choice; legacy's problems are usage patterns, not the framework |
| Language | TypeScript 5 (strict) | TypeScript (strict) | Keep — no reason to change |
| UI | React 19 | React (latest stable) | Keep |
| Styling | Tailwind CSS 4 | Tailwind CSS (latest) | Keep — token system formalized per `07_DESIGN_SYSTEM.md` |
| Database | None | MongoDB | **[Consensus]** CSV Q22: 3 of 4 respondents explicitly answered "Hybrid (MongoDB + MDX)" when asked where content should live; this is followed as written. See §3 for the hybrid storage model and §6 for an honest tradeoff note. |
| Auth | None | Auth solution with role-based access (e.g. Auth.js/NextAuth or a managed provider) | Required for the admin panel (`12_ADMIN_PANEL_SPECIFICATION.md`) — **[Consensus]** CSV Q19 role-based access, Q25 authentication flagged as a needed integration by 3 of 4 respondents |
| Mutations | None (third-party form POSTs) | Next.js Server Actions | Modern App Router pattern — replaces the legacy's blind dependence on Formspree/FormSubmit for primary lead capture (`06_PAGE_SPECIFICATIONS.md` Contact); a Route Handler is used only where a true webhook/external-callback endpoint is needed (e.g. a transactional-email provider's delivery webhook), not for ordinary form submission |
| Markdown/content | `remark` + `remark-html` (published posts) vs. full remark/rehype (editor preview) — two different pipelines producing different output (`ARCHIVED_PROJECT_ANALYSIS.md` §16 problem #9) | One unified remark/rehype pipeline (remark-gfm, rehype-highlight) used everywhere content is rendered | **[Objective practice]** — fixes a confirmed bug where editor preview and published output visually differ |
| Animation | GSAP + Framer Motion, both loaded broadly | Framer Motion as default; GSAP only if a genuinely complex scroll choreography need arises | See `07_DESIGN_SYSTEM.md` §4 |

## 3. Hybrid content storage model (MongoDB + MDX)

Per the consensus decision in §2, content splits into two tiers:

- **Structured, frequently-queried data → MongoDB.** Case studies (metadata + body, since body is also frequently edited by non-developers via the CMS — see note below), team members, testimonials, services, FAQs, leads/contact submissions, blog post metadata. This is exactly what a CMS needs: queryable, filterable, editable through an admin UI without a code deploy.
- **Long-form rich body content → stored as MDX-compatible rich text inside MongoDB documents**, not as files in the repository. **[Objective practice clarification]** — the CSV phrase "Hybrid (MongoDB + MDX)" most plausibly describes *MongoDB as the source of truth with MDX/Markdown as the body-content format*, not literally storing some content in the database and other content in the git repository's filesystem (the legacy model). A git-filesystem-based content store (the legacy `content/blog/*.md` approach) is structurally incompatible with the team's own stated requirements — drafts, role-based publishing approval, and non-developer editing all require the content to live somewhere a web UI can read and write to directly, which a developer-only git repository is not. This document interprets "hybrid" as **database-backed storage using a markdown/MDX-compatible rich-text format**, which satisfies both the "developer-familiar markdown authoring experience" half of the request and the "CMS with workflow" half, without the contradiction of requiring a git commit to publish a draft.

## 4. Rendering strategy

- **Static generation with on-demand revalidation (ISR)** for all public marketing pages — case studies, services, about, team. Content changes infrequently relative to traffic, so this preserves the legacy site's good instinct toward static generation (`ARCHIVED_PROJECT_ANALYSIS.md` §2 notes blog pages already use `generateStaticParams`) while making freshness automatic: publishing in the CMS triggers revalidation, no manual rebuild/redeploy required (directly fixing the legacy's `npm run build && ./deploy.sh` manual workflow for content updates, `ARCHIVED_PROJECT_ANALYSIS.md` §1 Build Process, §9.6).
- **Server Components by default.** The legacy codebase over-uses `'use client'` on components with no actual client-side behavior (`CTASection.tsx`, `Home.tsx` — `ARCHIVED_PROJECT_ANALYSIS.md` §16 problems #14, #21). v2 starts every component as a Server Component and only adds `'use client'` when a specific hook or browser API is actually used.
- **No client-side data fetching for content that's known at request time.** The legacy `/team` page fetches JSON client-side with no loading state (`ARCHIVED_PROJECT_ANALYSIS.md` §3.4, §7.3, §16 problem area) — this becomes a Server Component reading from the database directly.
- **The admin panel (`/studio`)** is the one part of the application that is necessarily client-heavy and dynamic (forms, live preview, drag-and-drop ordering) — it is excluded from static generation and sits behind auth middleware.

## 5. Layout architecture

Adopts the legacy analysis's own recommended fix (`ARCHIVED_PROJECT_ANALYSIS.md` §17, "Use Nested Layouts") rather than every page manually importing Navbar/Footer (§16 problem #15):

```
app/
├── (marketing)/
│   ├── layout.tsx          ← Navbar + Footer, applies to all public pages
│   ├── page.tsx             ← Home
│   ├── services/
│   ├── work/
│   ├── about/
│   ├── team/
│   ├── contact/
│   ├── blog/
│   └── careers/
├── studio/
│   ├── layout.tsx           ← Admin shell, auth-gated
│   └── ...
└── api/                      ← Route Handlers only where genuinely needed (webhooks, RSS)
```

Username-based portfolio routing uses a single dynamic route (`team/[username]/page.tsx`) reading from the database, eliminating the legacy pattern of 5 nearly-identical hand-written page files (`ARCHIVED_PROJECT_ANALYSIS.md` §16 problem #16, §17).

## 6. Honest tradeoff note on MongoDB

**[Objective practice, stated transparently rather than silently overridden]** A relational database (e.g. Postgres) with a typed ORM is the more common modern Next.js pairing for this kind of structured, relationship-heavy content (case studies belong to clients, tag to services, link to team members) and would give stronger compile-time guarantees. The team's own stated preference, 3 of 4 respondents, was specifically MongoDB — per `01_PRODUCT_VISION.md` §0 this is followed as the team's consensus technical preference. MongoDB is fully capable of supporting this data model (it is widely used for exactly this kind of content-driven site); the practical mitigation for the relational-integrity tradeoff is to use a schema-validating ODM (e.g. Mongoose with strict schemas, or a typed query layer) so the lack of enforced foreign keys doesn't become a data-integrity problem in practice.

## 7. SEO/metadata correctness (carrying forward confirmed legacy bugs as must-fix architecture rules)

- `next.config.ts` **must** include `export default` — the legacy config silently dropped `trailingSlash` and `images.unoptimized` settings because of a missing export statement (`ARCHIVED_PROJECT_ANALYSIS.md` §16 problem #1, confirmed critical bug). This is a one-line difference with site-wide consequences; v2's config is covered by a type check that would fail to compile without the export.
- Structured data (Schema.org JSON-LD) is injected via `generateMetadata`'s `other` field or a `<Script>` component — never `next/head`, which is a confirmed no-op in the App Router and silently dropped all portfolio page structured data on the legacy site (`ARCHIVED_PROJECT_ANALYSIS.md` §16 problem #2).
- `next/image` optimization is enabled (legacy disabled it site-wide via `images.unoptimized: true` because it deployed on self-hosted NGINX without an image-optimization layer, `ARCHIVED_PROJECT_ANALYSIS.md` §13) — v2's deployment target should support a Next.js-compatible image loader (self-hosted `sharp`-based optimization or a CDN loader) rather than disabling optimization outright. See `13_SEO_STRATEGY.md` and `14_IMPLEMENTATION_ROADMAP.md` for deployment implications.

## 8. Deployment

No CSV signal contradicts the legacy deployment model (self-hosted Ubuntu + NGINX + Cloudflare, `ARCHIVED_PROJECT_ANALYSIS.md` §1) and self-hosting is consistent with the founder's existing operational setup — kept as the default assumption, with the only required change being a real CI/CD step (the legacy `npm run build && ./deploy.sh` manual process is replaced by an automated pipeline that also handles the new database migration/seed step and environment-variable management the legacy site never needed). Database hosting: a managed MongoDB instance (e.g. Atlas) is recommended over self-hosting Mongo on the same box as the web server, to avoid coupling app deploys to database uptime.

## 9. Data retention & backup policy **[New, 2026-07-01, see `00_FOUNDER_APPROVAL.md` §4]**

Defined as a v1 launch requirement, not deferred:

- **Automatic backups:** daily incremental, periodic full backups of the production database, covering CMS content and media alongside lead/contact data.
- **Restoration testing:** backups are periodically test-restored, not assumed to work.
- **Retention:** lead/contact data is retained only for legitimate business purposes and deleted on request where required.
- **Security baseline:** passwords always securely hashed; no sensitive data stored unnecessarily; access to any of the above restricted through the RBAC model in `09_CMS_ARCHITECTURE.md` §4.
- **Scope discipline:** the policy is kept simple and documented now, with room to scale in formality as HubZero grows (e.g. toward a real DPA/compliance program once handling larger client data volumes).
