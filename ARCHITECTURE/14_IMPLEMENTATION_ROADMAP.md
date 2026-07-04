# 14 — Implementation Roadmap

> **Status: Founder Approved — 2026-07-01; amended 2026-07-04.** This roadmap was revised to add a real timeline and resourcing model, absent from the original draft — see `00_FOUNDER_APPROVAL.md` §1 and §3 for the full rationale. New Phase 3a (below) sequences Builds/Labs/Blueprints against this same timeline constraint — see `00_FOUNDER_APPROVAL.md` §8 and `17_COMPANY_STRUCTURE.md`.

> Decision convention: see `01_PRODUCT_VISION.md` §0. This roadmap is for building HubZero v2 from scratch at the repository root — it is not a refactor plan for `client/`, which remains untouched as the legacy reference implementation until the new application is ready to replace it in deployment.

## 0. Timeline and resourcing **[New, 2026-07-01, see `00_FOUNDER_APPROVAL.md` §1]**

- **Builder:** Rifaque, solo. No distributed-team or hired-help capacity is assumed for v1 — every phase below is scoped with that constraint in mind.
- **Deadline:** Hard 3-month target for a production-ready, publicly launched v2, delivered as **milestone-based rolling releases**, not one big-bang ship.
- **What must be done before public launch (the 3-month bar):** the custom CMS core, authentication, the RBAC foundation (`09_CMS_ARCHITECTURE.md` §4), version history, the database architecture, and the full public marketing site — because these are foundational and expensive to retrofit later.
- **What can ship as fast-follow releases after the 3-month mark:** feature-rich but non-essential capability — advanced Notes search, RSS refinements, a recommendation engine, advanced analytics, richer editorial tooling, and similar enhancements. Production quality is non-negotiable for anything that does ship; the deferral is about *scope*, not *quality bar*.
- This section is the answer to a gap in the original roadmap: phases were sequenced but never estimated or resourced. Every phase below should be read against this constraint before adding further scope.
- **[New, 2026-07-04]** The four-pillar company structure (`17_COMPANY_STRUCTURE.md`) is real net-new scope layered on a roadmap that, as of this amendment, hasn't yet shipped Contact, the CMS, or Team/Notes/Careers. Weighed the same way the Notes-MVP decision was weighed above: Labs ships alongside the other Phase 3 pages because it is substantially a *migration* of already-existing content (the IoT Sensor Dashboard currently on the Hardware page), not new-content creation — low cost, in scope. Builds and Blueprints are each gated on real content existing (a finished internal product; a Blueprint with a working live demo) and are treated as fast-follow candidates, same tier as Notes search/RSS refinements, unless that content already exists by the time Phase 3 begins — see Phase 3a below.

## Phase 0 — Project bootstrap

- Initialize the new Next.js application **at the repository root**, not inside `client/` (per the explicit rebuild instruction). `client/` is left in place, unmodified, as the live legacy reference until cutover.
- Set up TypeScript strict mode, Tailwind, the design-token CSS variables from `07_DESIGN_SYSTEM.md`, ESLint.
- Stand up MongoDB (local for dev, managed instance — e.g. Atlas — for staging/prod per `08_TECHNICAL_ARCHITECTURE.md` §8).
- Stand up the chosen auth solution and the CMS framework decision from `09_CMS_ARCHITECTURE.md` §1.
- `next.config.ts` written correctly from day one (with `export default` — `08_TECHNICAL_ARCHITECTURE.md` §7) so this confirmed legacy bug class cannot recur.

**Exit criteria:** empty Next.js app deploys to a staging environment, connects to a real database, has a working login.

## Phase 1 — Data layer and CMS core

- Implement the schemas in `11_DATABASE_ARCHITECTURE.md`, including the responsibility-based `User.role` model and `LabsProject` collection (both amended 2026-07-01). **[Amended 2026-07-04]** The `Build` and `Blueprint` collections, and `LabsProject`'s `stage`/`graduatedToBuildId` fields, are part of this same schema pass — implementing them now costs little extra once the other collections are being built, even though the *public pages* for Builds/Blueprints are sequenced later (Phase 3a) and gated on real content.
- Build the admin panel core (`12_ADMIN_PANEL_SPECIFICATION.md`): auth-gated `/studio`, the Head Admin / Admin / Teammate RBAC model with the Team Lead dynamic permission, the Case Studies and Team Members screens first (the two collections every other phase depends on).
- Implement draft/published workflow with company-content approval, autosave, and version history for every content type from day one — as generic, reusable mechanisms, not bespoke per collection (`09_CMS_ARCHITECTURE.md` §3, amended 2026-07-01).
- Stand up the automated backup/retention policy (`08_TECHNICAL_ARCHITECTURE.md` §9) alongside the database itself, not as an afterthought.

**Exit criteria:** a Head Admin user can create, save as draft, submit for review, approve, and publish a Case Study end-to-end with version history visible, and a scheduled backup has run successfully at least once.

## Phase 2 — Marketing site shell

- `(marketing)` route group with the shared layout (Navbar/Footer) per `08_TECHNICAL_ARCHITECTURE.md` §5.
- Design system components (`07_DESIGN_SYSTEM.md` §5): `HeroSection`, `GlassCard`, `GradientButton`, `SectionGrid`, `TagPill`, `FormField`.
- Navigation/footer per `03_INFORMATION_ARCHITECTURE.md` §2-3, sourced from one shared config (fixes the legacy's mismatched desktop/mobile nav bug class structurally).

**Exit criteria:** a visitor can navigate the full site IA with placeholder/seed content and every link resolves correctly.

## Phase 3 — Public pages, in order of business value

1. **Home** (`06_PAGE_SPECIFICATIONS.md` Home) — the highest-leverage page; blocked on at least one real, complete case study existing (Phase 1 deliverable) so the featured-case-study section isn't empty at launch.
2. **Work index + case study detail** — the core trust-building content type; populate with the team's existing best real project(s) (e.g. Bhatkal Time Luxe, rewritten to the new case-study template rather than the legacy one-off page) plus any others that meet the "major project" bar (`05_CONTENT_STRATEGY.md` §2).
3. **Services overview + Software + Hardware** — particularly the Hardware & Embedded page, which has no legacy content to draw from and needs real authorship from Salsabeel's domain knowledge, plus a **Labs & R&D summary linking to the canonical `/labs` entry** (`06_PAGE_SPECIFICATIONS.md` Hardware & Embedded — **[Amended 2026-07-04]**, no longer a fully embedded section, see Phase 3a below).
4. **Contact** — structured intake, Server Action, Lead collection wired to the admin inbox, plus the no-fixed-price/self-qualification framing above the form (`06_PAGE_SPECIFICATIONS.md` Contact, `12_ADMIN_PANEL_SPECIFICATION.md` §2).
5. **About, Team** — founding year confirmed as **2024** (`06_PAGE_SPECIFICATIONS.md` About), core-members-only team page, Founder + co-founders leadership structure.
6. **FAQs, Privacy, Terms, 404** — lower individual effort, round out launch completeness; Privacy Policy content rewritten to be factually accurate against whatever analytics is actually shipped (`13_SEO_STRATEGY.md` §6).
7. **Careers** — needed for the recruiting journey but not blocking client-facing launch; can ship slightly after the core site if needed.

**Note on sequencing logic:** this order is itself a product decision, not just a build-order convenience — it puts the pages that make the core differentiation claim (Home, Work, Services) ahead of supporting pages (About, Careers), consistent with "the public website should prioritize potential clients" (`01_PRODUCT_VISION.md` §1, the explicit operating mandate).

## Phase 3a — Company pillars: Builds, Labs, Blueprints **[New, 2026-07-04, see `00_FOUNDER_APPROVAL.md` §8]**

Sequenced after the core Phase 3 pages (which make the primary client-facing claim) and before Notes, since these three pillars support the same "is this company real and capable" trust job, one level down. Each pillar is content-gated, not calendar-gated — a pillar's public pages ship only once it has real content, per `05_CONTENT_STRATEGY.md` §2a/§2b and the zero-fabrication discipline already governing every other content type.

1. **Labs** (`/labs`, `/labs/[slug]`) — lowest-risk of the three, because real content already exists: the IoT Sensor Dashboard currently embedded on the Hardware & Embedded page. This phase is substantially a *content migration* (move the existing write-up to its own canonical `/labs/[slug]` entry, update Hardware to summarize-and-link per `06_PAGE_SPECIFICATIONS.md`) rather than new-content creation — ship this one alongside Phase 3 if the timeline allows.
2. **Builds** (`/builds`, `/builds/[slug]`) — gated on at least one real, complete internal product existing to publish. If none exists yet when this phase is reached, this is a content dependency to flag explicitly rather than a coding task to schedule — do not ship `/builds` with placeholder entries.
3. **Blueprints** (`/blueprints`, `/blueprints/[slug]`) — highest build cost of the three, since it requires the live-preview/demo-deployment infrastructure in `11_DATABASE_ARCHITECTURE.md` and an ongoing operational commitment to keep demos live (`05_CONTENT_STRATEGY.md` §2b). Sequence last among the three, and treat demo-uptime monitoring as a standing cost this phase commits the team to, not a one-time build.
4. **Nav promotion** — once a pillar has ≥1 published entry, promote it from footer to primary nav per `03_INFORMATION_ARCHITECTURE.md` §2, updating `config/nav.ts` (the single shared source) so desktop and mobile update atomically.

**Exit criteria:** Labs is live with the migrated content; Builds and Blueprints are either live (if content existed at this phase) or explicitly logged as blocked on content, not silently skipped.

## Phase 4 — Notes (full platform, shipped in the MVP) **[Amended 2026-07-01, see `00_FOUNDER_APPROVAL.md` §3]**

The original CSV-consensus reading ("maybe in the future," not required for launch) is superseded: the **complete Notes platform ships in the MVP** — public index/note templates, unified rendering pipeline, categories, tags, SEO, search, RSS, and author profiles — populated at launch with **3-5 cornerstone articles** that demonstrate real expertise. This is a genuine scope addition against the original "infrastructure now, content later" sequencing, and should be weighed against the Phase 0 timeline constraint (§0 above) — if the 3-month bar is at risk, Notes search/RSS refinements are the first candidate to push into a fast-follow release, since the core CMS collection and basic templates are the part every other phase already assumes exists.

## Phase 5 — SEO, performance, accessibility pass

- Full metadata audit per `13_SEO_STRATEGY.md` §2, structured data verification (actually render and validate JSON-LD, given the legacy site shipped broken structured data for an unknown length of time without anyone noticing it was a no-op).
- Image optimization enabled and verified against the actual deployment target (`08_TECHNICAL_ARCHITECTURE.md` §7, §8).
- Accessibility audit against the baseline in `07_DESIGN_SYSTEM.md` §6 (contrast, focus states, alt text, reduced-motion, form labeling) — an area the legacy site never addressed at all.
- `prefers-reduced-motion` verified across all shipped motion.

## Phase 6 — Content population and launch readiness

- Real case studies (minimum 1-3, per `05_CONTENT_STRATEGY.md` §2) fully written and approved through the CMS workflow before launch — not placeholder content.
- Real testimonials only, or the section omitted (`05_CONTENT_STRATEGY.md` §3) — zero fabricated names ship.
- Founder reviews and confirms: founding year, current real stats, positioning copy against the "could a competitor say this" test (`05_CONTENT_STRATEGY.md` §4).
- Internal team (core members) onboarded to `/studio` with correct roles assigned.

## Phase 7 — Cutover

- DNS/deployment switched from the legacy `client/` build to the new root-level application.
- Legacy `client/` directory remains in the repository as historical reference (consistent with `ARCHIVED_PROJECT_ANALYSIS.md` being preserved as historical documentation) but is no longer deployed.
- 301 redirects configured for any legacy URL that changed shape under the new IA (e.g. `/web-development` → `/services/software`, `/work/bhatkaltimeluxe` → `/work/bhatkal-time-luxe`) to preserve any existing inbound links/SEO equity.

## Roadmap items explicitly deferred past v1 (with reason)

| Deferred item | Reason | Reference |
|---|---|---|
| Client portal / authenticated client area | No strong CSV demand; premature before lead generation itself is proven | `04_USER_JOURNEYS.md` §3 |
| Multi-language support | Founder decision, no consensus to override it | `05_CONTENT_STRATEGY.md` §7 |
| CRM integration | Premature at current/expected lead volume | `10_FEATURE_SPECIFICATION.md` §6 |
| Payment gateway | No current business model requires it | `10_FEATURE_SPECIFICATION.md` §6 |
| Live chat / AI chatbot | Solving a problem (engagement) before the core positioning problem (differentiation, per `01_PRODUCT_VISION.md` §4) is solved | `10_FEATURE_SPECIFICATION.md` §6 |
| Additional integrations beyond Analytics/Auth/internal notifications | Sequenced by founder priority, not rejected | `10_FEATURE_SPECIFICATION.md` §6 |
| Newsletter / generic email capture | MVP conversion goal is qualified project inquiries, not list growth; architecture stays extensible for this later | `00_FOUNDER_APPROVAL.md` §4 |
| Advanced Notes search, RSS refinements, recommendation engine, advanced analytics, richer editorial tooling | Core Notes platform and basic CMS/RBAC ship in the 3-month MVP; these are the explicit fast-follow candidates if the deadline is at risk | `00_FOUNDER_APPROVAL.md` §1 |
| Legal entity registration (Pvt Ltd / LLP) | Planned once HubZero reaches consistent client revenue; site represents current unregistered status accurately in the meantime | `00_FOUNDER_APPROVAL.md` §1 |

## Definition of done for "HubZero v2 MVP is launched" **[Amended 2026-07-01; amended 2026-07-04]**

1. Every page in `03_INFORMATION_ARCHITECTURE.md` §1 exists, is reachable, and contains real (not placeholder) content, including the migrated Labs entry (`/labs/[slug]`) and 3-5 cornerstone notes. **[Amended 2026-07-04]** Builds and Blueprints are conditional on Phase 3a: required for MVP launch only if real content exists by then (per `05_CONTENT_STRATEGY.md` §2a/§2b); otherwise they are logged as an explicit, founder-acknowledged fast-follow, not silently dropped from scope.
2. The admin panel supports the full content lifecycle (draft → approve → publish → version history, per the hybrid workflow in `09_CMS_ARCHITECTURE.md` §3) for Case Studies, Builds, Team Members, Testimonials, Notes, Labs/R&D Projects, and Blueprints, under the Head Admin / Admin / Teammate RBAC model.
3. Zero fabricated testimonials, zero unverifiable stats, ship. Legal/company-status copy (About, Terms, footer) accurately reflects HubZero's current unregistered status.
4. All ten confirmed legacy bugs/bad-practices in `10_FEATURE_SPECIFICATION.md` §5 are verifiably fixed, not just "should be fixed."
5. Lighthouse/Core Web Vitals and an accessibility audit pass the baseline in `07_DESIGN_SYSTEM.md` §6.
6. Automated database backups are running and have been test-restored at least once (`08_TECHNICAL_ARCHITECTURE.md` §9).
7. The founder has reviewed and approved the homepage hero claim ("Building technology that solves real problems," per `00_FOUNDER_APPROVAL.md` §5), the Services split, and the Work case studies as accurately representing the company.

**Founder Approval:** all decisions in this roadmap and the 13 documents it references were confirmed by the founder on 2026-07-01 — see `00_FOUNDER_APPROVAL.md` for the complete decision log.
