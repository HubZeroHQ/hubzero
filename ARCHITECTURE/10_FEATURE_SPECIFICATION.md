# 10 — Feature Specification

> **Status: Founder Approved — 2026-07-01; amended 2026-07-04.** See `00_FOUNDER_APPROVAL.md` for the full decision log — §3 (Notes moved to MVP scope), §4 (data retention/backup added, newsletter capture explicitly deferred), §8 (four-pillar company structure) affect this document.

> Decision convention: see `01_PRODUCT_VISION.md` §0. Cross-references the legacy feature checklist (`ARCHIVED_PROJECT_ANALYSIS.md` §18) and disposes of every item explicitly — nothing carries forward by default silence.

## 1. Carried forward as-is (the legacy got these right)

- Static generation for content pages, dynamic per-post/case-study metadata (`generateStaticParams`, `generateMetadata`) — `08_TECHNICAL_ARCHITECTURE.md` §4.
- Dark-mode-first OKLCH token system, with light mode finally wired up (`07_DESIGN_SYSTEM.md` §2).
- Sitemap/robots.txt generation (`next-sitemap` or equivalent) — `13_SEO_STRATEGY.md`.
- PWA manifest — low effort, no downside, kept.
- Geist Sans/Mono typography base — `07_DESIGN_SYSTEM.md` §1.
- The command-terminal easter egg on individual portfolio pages — genuinely distinctive, kept as personality, demoted in priority (`06_PAGE_SPECIFICATIONS.md`, Team profile).

## 2. Rebuilt (concept kept, implementation replaced)

- **Contact form** — third-party POST → Server Action + database-backed lead capture with structured fields (`06_PAGE_SPECIFICATIONS.md` Contact, `09_CMS_ARCHITECTURE.md` §2 Leads).
- **Team directory** — client-fetched JSON → server-rendered from CMS, core-members-only (`06_PAGE_SPECIFICATIONS.md` Team).
- **Portfolio pages** — 5 duplicate hand-written files → single dynamic route + CMS data (`06_PAGE_SPECIFICATIONS.md` Team profile, `08_TECHNICAL_ARCHITECTURE.md` §5).
- **Notes publishing** — Monaco editor + file download + manual deploy → CMS workflow with autosave/drafts/approval (`09_CMS_ARCHITECTURE.md`).
- **Case studies** — one hardcoded page → CMS-driven template supporting unlimited entries (`06_PAGE_SPECIFICATIONS.md` Work detail).
- **Structured data (JSON-LD)** — broken `next/head` usage → `generateMetadata` (`08_TECHNICAL_ARCHITECTURE.md` §7).
- **Theme toggle** — built but disabled → finished and shipped (`07_DESIGN_SYSTEM.md` §2).

## 3. New (did not exist in legacy)

- Authentication + role-based admin panel (`12_ADMIN_PANEL_SPECIFICATION.md`).
- Database (MongoDB) as content source of truth (`08_TECHNICAL_ARCHITECTURE.md` §3).
- Hardware & Embedded service page (`06_PAGE_SPECIFICATIONS.md`).
- FAQs content type.
- Careers page.
- Terms of use page.
- Lead status tracking (new/contacted/closed) for the team's own follow-up process.
- Version history / content rollback, built from day one for every content type (`09_CMS_ARCHITECTURE.md` §3, amended 2026-07-01).
- Labs / R&D content type — originally scoped as interim hardware-capability proof (`00_FOUNDER_APPROVAL.md` §2), generalized 2026-07-04 into the permanent Labs pillar covering all exploratory engineering (`00_FOUNDER_APPROVAL.md` §8).
- Defined data retention & automated backup policy for the database (`08_TECHNICAL_ARCHITECTURE.md` §9, new 2026-07-01).
- **[New, 2026-07-04]** Builds content type — completed, first-party HubZero products (`17_COMPANY_STRUCTURE.md` §2).
- **[New, 2026-07-04]** Blueprints content type — reusable, customizable production-ready foundations with live-demo infrastructure (`17_COMPANY_STRUCTURE.md` §2, `11_DATABASE_ARCHITECTURE.md`).

## 4. Explicitly removed (not carried forward, with reason)

| Legacy feature | Reason removed |
|---|---|
| Testimonial carousel (3 hardcoded, 2 with placeholder names) | Fabricated social proof — `05_CONTENT_STRATEGY.md` §3 |
| Home page stat grid (100% satisfaction, ~12 teammates, 24/7 availability) | Unverifiable numbers — `05_CONTENT_STRATEGY.md` §3 |
| "Hubzero Family Guide" decorative cards | Generic filler content superseded by featured case study — `06_PAGE_SPECIFICATIONS.md` Home |
| 4 standalone shallow service pages (web-dev, ui-ux, branding, seo) | Merged into 2 substantive practice-area pages — `06_PAGE_SPECIFICATIONS.md` |
| `MarkdownPreview.tsx`, `src/lib/markdownToHtml.ts` | Confirmed dead code, never imported — `ARCHIVED_PROJECT_ANALYSIS.md` §12, §16 problem #12 |
| `src/data/team.json` (orphaned duplicate) | Confirmed unused, contradicted the active data file — `ARCHIVED_PROJECT_ANALYSIS.md` §10, §16 problem #11 |
| Blog editor (Monaco + download workflow) | Replaced entirely by CMS — `09_CMS_ARCHITECTURE.md` |
| `bcryptjs`, `dotenv`, `express`, `mongoose`(legacy unused version), `nodemailer` as dead deps | Confirmed unused in legacy; v2 introduces its own backend deps deliberately rather than inheriting unused ones — `ARCHIVED_PROJECT_ANALYSIS.md` §8 |
| Decorative, unlinked Discord/YouTube/Instagram footer icons | Either link to real maintained accounts or remove — `03_INFORMATION_ARCHITECTURE.md` §3 |
| "Join Hubzero Team" recruiting CTA embedded in home page | Moved to dedicated Careers page, out of primary client-facing flow — `06_PAGE_SPECIFICATIONS.md` Home, Careers |

## 5. Bug fixes carried in as non-negotiable architecture rules

(All sourced from `ARCHIVED_PROJECT_ANALYSIS.md` §16, confirmed during the legacy audit — not opinions, structural corrections.)

1. `next.config.ts` must have `export default` — `08_TECHNICAL_ARCHITECTURE.md` §7.
2. Structured data via `generateMetadata`, never `next/head` — `08_TECHNICAL_ARCHITECTURE.md` §7.
3. Nav link destinations must come from one shared config consumed by desktop and mobile — `03_INFORMATION_ARCHITECTURE.md` §2.
4. No hardcoded username lists that drift from the actual data source (legacy `CommandTerminal.tsx` `TEAM_USERNAMES` included two non-existent users) — username lists are always derived from the database query, never duplicated as a literal array.
5. No debug `console.log` statements in shipped components.
6. No browser-native `alert()` for user feedback — use a proper toast/notification component.
7. Contact form spam protection enabled (legacy explicitly disabled it via `_captcha: false`).
8. Footer/nav links point to their actual correct destination (legacy "Work with Us" incorrectly pointed to `/contact` instead of `/work` in two separate places).
9. No `'use client'` on components with no client-side behavior.
10. All images carry meaningful `alt` text; accessibility baseline per `07_DESIGN_SYSTEM.md` §6.

## 6. Integration roadmap (v1 vs. later)

**[Founder decision]** CSV Q25 shows wide variance in desired integrations — Rifaque selected a moderate set (Google Analytics, Authentication, Project Management, Slack/Discord); Sultan selected a much larger set including CRM, Payment Gateway, Live Chat, AI Chatbot; Salsabeel and Iyad fell in between. Per `01` §0, the founder's narrower, more immediately-actionable set governs v1 scope — broader integrations are not rejected, they are sequenced:

**v1 (launch):**
- Analytics (privacy-disclosure-accurate, fixing the legacy Privacy Policy contradiction — `06_PAGE_SPECIFICATIONS.md` Privacy)
- Authentication (required for the admin panel regardless of any integration preference — `12_ADMIN_PANEL_SPECIFICATION.md`)
- Internal notification on new lead (Slack/Discord webhook, or email — low-effort, high-value for the team's own workflow)

**Roadmap (post-v1, sequenced by founder priority + actual demand):**
- Project management tool integration (e.g. linking a published case study to its internal project record)
- CRM (once lead volume justifies it — premature at launch volume)
- Payment gateway (no current business model requires online payment collection — revisit if retainer/subscription billing becomes real)
- Live chat / AI chatbot (Sultan's most ambitious asks — explicitly deferred; a chatbot before the core positioning and case-study content exists would be solving the wrong problem first)
- Newsletter / generic email capture (**[Amended 2026-07-01]** explicitly skipped for MVP — the only conversion goal at launch is a qualified project inquiry through the contact form, not list growth; the architecture stays extensible so nurture mechanisms can be added once there's a consistent content strategy and audience, see `00_FOUNDER_APPROVAL.md` §4)
