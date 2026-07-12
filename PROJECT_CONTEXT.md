# PROJECT_CONTEXT.md

> **⚠️ Design reset — 2026-07-12.** The public marketing website direction this document describes (homepage, services/work/about/contact pages, navigation, hero, page structure, design system, motion, roadmap for those pages) has been archived — see `ARCHIVE/README.md`. Many `ARCHITECTURE/01`–`07`, `10`, `13`–`17` documents referenced below now live under `ARCHIVE/ARCHITECTURE/` and are historical reference only, not implementation guidance. The new marketing-site direction starts fresh in `DESIGN/NEXT`. The CMS/backend/admin sections below (`08`, `09`, `11`, `12`, `18`–`20`, and the repo-structure/git-workflow/coding-standards sections) are unaffected and remain current.

> Single source of truth for any new Claude Code session (or new engineer) picking up HubZero v2 with zero prior context. This document summarizes and cross-references `ARCHITECTURE/`, the current codebase, and decisions made outside those docs — it does not replace `ARCHITECTURE/`, which remains the authoritative spec for anything this document only summarizes.
>
> Last compiled: 2026-07-03, immediately before this repository was transferred from a personal GitHub account to the HubZero GitHub organization and re-cloned into a fresh working directory.

---

## 1. Project Overview

**HubZero is a small, founder-led engineering studio** that designs and builds digital and embedded products for businesses that need both software and hardware-adjacent engineering — and treats every engagement as a long-term relationship, not a one-off delivery.

- **Legal status:** Currently an **unregistered engineering organization**. Registration (Pvt Ltd / LLP) is planned once the company reaches consistent client revenue. The site must never imply "Inc.," a registration number, or legal-entity language that overstates current status.
- **Founded:** 2024 (this is the one correct founding year — the legacy site contradicted itself between 2023 and 2024; 2024 is final).
- **Who builds it:** Rifaque (founder), solo, for the v2 rebuild. No distributed team or hired help is assumed for v1 scope decisions.
- **Leadership:** Founder + co-founders (a small named leadership team, not a single-founder narrative). Current co-founders and their domains are listed in `src/app/(marketing)/about/page.tsx`.

### Vision

3-year vision, in the founder's own words: _"a large organization of engineers with many contracts with brands, providing engineering solutions."_ HubZero v2 is built **as if the company framing is already true** — written forward from where the team wants to be, not backward from where it currently is (the internal team itself is not unanimous that HubZero is "a company" yet; the website is the forcing function that makes it one).

### Business goals

The website exists to **generate qualified leads, build trust, and establish HubZero as a premium engineering company.** Every public page is checked against: does this make it more believable HubZero is a real, capable, combined software/electronics team — or does it dilute that with generic agency language? Priority order (from `ARCHITECTURE/01_PRODUCT_VISION.md` §7):

1. Make a potential client believe, within 15 seconds, HubZero is real and capable.
2. Prove it with a small number of real, well-documented case studies (not a high-volume portfolio).
3. Give the client a low-friction, intent-revealing way to start a conversation.
4. Give the internal team a CMS so non-developers can publish without a developer redeploying the site.
5. Stay out of the way of 1–3: no decorative complexity, no content for its own sake.

### Brand positioning

Confident, precise, slightly understated — closer to a credible B2B engineering/consulting firm than a "fun SaaS startup." Every sentence is checked against: **"could a competitor's website say this exact sentence and be equally true?"** If yes, cut it and replace with something specific. Never leads with price. Never uses "innovative," "cutting-edge," "solutions," "digital transformation," or an emoji. Full voice rules: `ARCHITECTURE/02_BRAND_STRATEGY.md`.

The homepage hero is **not** a slogan — it states plainly what HubZero does and who it helps (approved register: _"Building technology that solves real problems."_). The combined CSE+ECE claim is real and load-bearing but sits just below the hero, not in it (`ARCHITECTURE/00_FOUNDER_APPROVAL.md` §5).

### Target clients

Two co-equal ideal-client profiles (never dilute one for the other):

1. **Established brands / growing businesses** needing a production website, ongoing SEO, and a maintenance relationship.
2. **Startups / SMBs with a hardware-adjacent need** who often don't yet know if their problem is software, hardware, or both.

Primary target market is **English-speaking global clients**. Business development is currently India-based, but the site must never read as India-only (no region-locked SEO, no INR-only pricing language).

### Differentiators

1. **Combined software + electronics capability** (CSE + ECE) — most small competing agencies are software-only.
2. **Founder-led accountability** — the person building the client relationship can often also touch the code/hardware.
3. **Selectivity** — HubZero turns down ill-defined or low-trust projects; the case studies shown are high-signal, not high-volume.

Pricing is never the headline. The honest internal finding (`01_PRODUCT_VISION.md` §4) was that the team's own weakest answer to "why choose us" was "nothing, except pricing" — the whole brand/content strategy exists to make that untrue in practice by keeping the three differentiators above visible everywhere.

---

## 2. Repository Structure

| Path                               | Status                    | Purpose                                                                                                                                                                                                                                 |
| ---------------------------------- | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/`                             | **Active**                | The v2 Next.js application. Everything under active development lives here.                                                                                                                                                             |
| `ARCHITECTURE/`                    | **Active, authoritative** | 17 numbered spec documents (`00`–`16`) governing every product/design/technical decision for v2. Read before implementing anything. See §3.                                                                                             |
| `client/`                          | **Legacy — read-only**    | The pre-v2 Next.js site. Kept only as feature/content reference until cutover (`ARCHITECTURE/14` Phase 7). **Never add new work here.**                                                                                                 |
| `docs/research/`                   | **Active**                | Supporting research documents — e.g. the Bhatkal Time Luxe case-study analysis. See §7.                                                                                                                                                 |
| `docs/team-planning-responses.csv` | **Reference**             | The 4-respondent internal survey that `ARCHITECTURE/01`–`14` were derived from. Cited throughout those docs as CSV Q-numbers.                                                                                                           |
| `assets/`                          | **Active**                | Design-source originals (never served directly, never modified in place). See §9.                                                                                                                                                       |
| `public/`                          | **Active**                | Public-facing served copies of brand/case-study/team assets, referenced by the app.                                                                                                                                                     |
| `ARCHIVED_PROJECT_ANALYSIS.md`     | **Historical reference**  | A complete line-by-line audit of the legacy `client/` site (structure, bugs, dead code). Several of its findings are carried forward into `ARCHITECTURE/` as must-fix rules — it is not itself a spec, just the evidence base.          |
| `.nexus/`                          | **Unused scaffold**       | Empty template files (`architecture.md`, `constraints.md`, `current-focus.md`) from an unrelated tool. Not populated, not part of the actual workflow — ignore.                                                                         |
| `next-prompt.md`                   | **Scratch, gitignored**   | Where the founder drops the brief for the _next_ milestone before a session starts (e.g. the About page brief). Not committed; check it at the start of a session for standing instructions, but don't treat its absence as meaningful. |

**Do not confuse `client/` with `src/`.** `client/` is the old, pre-rebuild Next.js app — it is not deployed, not built by the current `npm` scripts, and should never receive new features. `src/` at the repo root is the only active application.

---

## 3. Architecture Documents — What Each One Governs

All 17 documents live in `ARCHITECTURE/` and are **Founder Approved as of 2026-07-01** (`15` carries a narrower "Round 2, approved in principle" status specifically for homepage-style visual execution — see below). Read them; this section only orients you to which one to open for a given question.

| Doc                                 | Governs                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`00_FOUNDER_APPROVAL.md`**        | **Wins all conflicts.** The authoritative decision log from the founder-approval session. Anything in `01`–`14` that this contradicts has already been updated to match — this doc explains _why_. Start here to understand what changed and when.                                                                                                                                                                                                                                                                                                                                                                                   |
| `01_PRODUCT_VISION.md`              | What HubZero is, who it's for, the positioning statement, what's explicitly NOT part of the brand.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `02_BRAND_STRATEGY.md`              | Voice, tone, visual identity direction, naming conventions ("HubZero" not "Hub Zero"), the industry-research synthesis behind "what makes a site feel premium."                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `03_INFORMATION_ARCHITECTURE.md`    | Sitemap, primary nav, footer, URL/routing conventions, depth/breadth rules.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `04_USER_JOURNEYS.md`               | Per-audience journeys (client, existing client, recruit, partner, internal CMS user) and what pages each needs.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `05_CONTENT_STRATEGY.md`            | Content types and policy — case-study bar, zero-tolerance testimonial/stat fabrication policy, Notes scope, FAQ content, multi-language (English-only).                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `06_PAGE_SPECIFICATIONS.md`         | Per-page spec with an explicit legacy verdict (Keep/Merge/Split/Replace/Remove/Rebuild) for every page in the sitemap.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `07_DESIGN_SYSTEM.md`               | Base typography/color/spacing/motion/accessibility tokens and the original component vocabulary (`GlassCard`, `GradientButton`, `SectionGrid`, `TagPill`, `FormField`). **Partially overridden by `15` for homepage-style pages** — see below.                                                                                                                                                                                                                                                                                                                                                                                       |
| `08_TECHNICAL_ARCHITECTURE.md`      | Stack decisions (Next.js/TS/Tailwind/MongoDB/Server Actions), hybrid content storage model, rendering strategy, deployment, backup/retention policy.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `09_CMS_ARCHITECTURE.md`            | Custom CMS build approach, content collections, workflow (draft/review/publish), the responsibility-based RBAC model.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `10_FEATURE_SPECIFICATION.md`       | Explicit disposition of every legacy feature (kept/rebuilt/new/removed) and the ten confirmed legacy bugs now treated as non-negotiable architecture rules.                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `11_DATABASE_ARCHITECTURE.md`       | MongoDB collection shapes, relationships/integrity approach, indexing, seed data.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `12_ADMIN_PANEL_SPECIFICATION.md`   | `/studio` screens, per-role dashboard views, approval-workflow UI, autosave/version-history UI.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `13_SEO_STRATEGY.md`                | Per-page-type metadata/structured-data strategy, sitemap/RSS, content-led SEO angle, analytics/privacy alignment.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `14_IMPLEMENTATION_ROADMAP.md`      | Timeline (solo builder, 3-month hard deadline, milestone releases), phase-by-phase build order, definition of done for v2 launch. **Read this to know what phase the project should be in.**                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| **`15_HOMEPAGE_DESIGN.md`**         | Homepage-specific (and, by extension, any similarly editorial page's) visual/narrative architecture. **Explicitly overrides `07`'s component vocabulary** for pages built in this visual language — no `GlassCard`/`GradientButton`/card-grid `SectionGrid`/`TagPill` on the homepage or About-style pages. Base tokens (color, type scale, spacing scale, motion timing) from `07` are _not_ overridden, only the component-level "legacy signature in moderation" instruction is. Introduces the "editorial, not agency-site" model: narrative beats with designed transitions, not stacked self-contained sections. See §5 below. |
| `16_RESPONSIVE_DESIGN_STANDARDS.md` | Founder directive (objective engineering practice, not a business-preference item). Each breakpoint tier is its own deliberate composition; never derive mobile/tablet by reflowing desktop. See §10 below.                                                                                                                                                                                                                                                                                                                                                                                                                          |

**`19_CMS_FOUNDATION.md`** (CMS architecture — collections, permissions, generic engine, media) and **`20_CONTENT_BLOCKS.md`** (2026-07-06 — every narrative collection's editorial block content model: `content: Block[]` replacing fixed markdown fields, card metadata, team contributors, the homepage feature system) join this table as of the CMS build; both are implemented, not proposals — see `18_ARCHITECTURE_CHANGELOG.md` for the full session-by-session history of what shipped. **§6 below ("Current Website Status") predates the entire CMS/backend build and is stale for anything CMS-related** — trust `18`/`19`/`20` and the actual code, not §6, for CMS/data-layer state.

**Practical reading order for a new session:** `00` (what changed and why) → `14` (what phase you're in) → the specific numbered doc for whatever page/feature you're touching → `15`/`16` if you're touching visual/responsive work on any marketing page → `19`/`20` for anything CMS/content-model related.

---

## 4. Design System

Full token values live in `ARCHITECTURE/07_DESIGN_SYSTEM.md`; this is a summary, not a duplicate.

- **Typography:** One primary family pairing — Geist Sans (body/UI, the workhorse) and Geist Mono (reserved for genuinely technical content: code, stack names, dates, metadata — never decorative). Instrument Serif was added specifically for the homepage/editorial visual language (`15`) at a small, named set of slow-down moments (e.g. one italicized hero word, one case-study pull-line) — **not** a per-section default. 2–3 weights max (Regular/Medium/Semibold), tight modular scale, larger body text than instinct suggests (17–18px).
- **Spacing:** "Spend money on emptiness" — generous section padding (96–128px desktop, upper end as default), one primary idea per section. On editorial-style pages (`15`), section height is a _downstream result_ of content and narrative weight, not a fixed padding value repeated uniformly.
- **Color philosophy:** OKLCH dark-first token system (near-monochrome base: background/surface/border/text/muted-text), with a working light-mode toggle. **One accent color** used only for primary CTA, active/focus states, and the brand mark. The signature blue→violet→gold gradient exists as exactly one named token, used in at most 1–2 places per page (never a section background, never a decorative filler).
- **Responsive philosophy:** See §10 — each breakpoint tier is its own composition; decorative absolutely-positioned elements must be anchored to the content grid (`<Container>`), never the raw viewport.
- **Motion philosophy:** Purposeful, brief (200–400ms, ease-out, 8–16px travel), never decorative-by-default. On the homepage/editorial pages specifically: one orchestrated sequence on load (hero linework → headline → subhead → credibility strip), then near-silence below the fold — the test is "if asked what animated, the honest answer should be 'I'm not sure, I was reading.'" `prefers-reduced-motion` is respected everywhere (`src/lib/motion.ts`).
- **Editorial philosophy (homepage and similarly-styled pages, per `15`):** The page is one continuous narrative arc, not stacked independent sections. No two adjacent beats share a composition, but they also share no hard boundary (no full-width rules, no abrupt background blocks) — transitions are designed with the same intent as the beats themselves. A mandatory "uniqueness test" gates every beat: _could this appear on another agency's site by swapping the logo?_ If yes, redesign it.
- **Visual language:** Circuit-trace motif (thin-line schematic pattern, low-opacity, single accent color) used sparingly and only where it earns its place — currently restricted to two appearances on the homepage (hero, How We Work connective line). Explicitly rejected everywhere on editorial-style pages: glassmorphism cards, gradient-filled buttons, generic 2/3-card grids, browser-chrome mockups, stock photography, abstract illustrations, testimonial carousels, blur orbs, icon-grid-with-vague-claims.
- **Conventions:** WCAG 2.1 AA contrast baseline, visible focus states on every interactive element, meaningful `alt` text on all images, `aria-label` on icon-only buttons, color is never the sole signal of state.

**Note:** `07`'s original component vocabulary (`GlassCard`, `GradientButton`, `SectionGrid`, `TagPill`) still applies to non-editorial, utility-style UI (forms, admin panel, generic list/detail layouts) — it is only overridden for pages explicitly built in the `15` editorial visual language (currently: Home, About; check before assuming Services/Work follow the same rule — verify against the actual page source, since this line moves as more pages get built).

---

## 5. Folder Conventions

- **Pages:** `src/app/(marketing)/**/page.tsx` — all public marketing routes share `(marketing)/layout.tsx` (Navbar + Footer). Root-level `src/app/{error,loading,not-found}.tsx` handle App Router special files outside the marketing group. A future `src/app/studio/` (admin, auth-gated) and `src/app/api/` (webhooks/RSS only) do not exist yet — see §6.
- **Components:** `src/components/` split by role — `brand/` (logo), `layout/` (navbar, footer, mobile nav, page shell), `marketing/` (hero, case-study, how-we-work, what-we-do, cta-close, circuit motif, reveal-on-scroll), `providers/` (theme provider), `ui/` (the generic design-system component library — button, card, input, grid, container, etc.), `work/` (work-grid for the `/work` index).
- **Configs:** `src/config/` — `site.ts` (company metadata, social links — currently all `null`, see §14), `nav.ts` (single shared nav data structure consumed by desktop + mobile, per the structural fix in `03_INFORMATION_ARCHITECTURE.md` §2), `case-studies.ts` (static case-study summary list for `/work` — pre-CMS, see §8), `brand.ts` (brand asset path config with usage notes per asset).
- **Assets:** `assets/` = design-source originals (never served, never edited in place). `public/` = the served copies the app actually references. `src/config/brand.ts` is the single source of truth for brand asset paths — reference it, don't hardcode `/brand/...` paths inline.
- **Research:** `docs/research/` — case-study analysis documents and similar founder-provided source material for content that will become public copy.
- **Architecture:** `ARCHITECTURE/00`–`16`, numbered and read in that order for a full pass; see §3 for a governance map instead of reading all 17 cold.

---

## 6. Current Website Status

### Completed (built and merged to `dev`)

| Route                     | Notes                                                                                                                                                                                                                                                                                                                    |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/` (Home)                | Hero, What We Do, Featured Case Study, How We Work, CTA Close — built to the `ARCHITECTURE/15` Round 2 editorial spec.                                                                                                                                                                                                   |
| `/services`               | Services overview, splits into Software / Hardware & Embedded.                                                                                                                                                                                                                                                           |
| `/services/software`      | Software Engineering practice page.                                                                                                                                                                                                                                                                                      |
| `/services/hardware`      | Hardware & Embedded practice page, including the founder-approved **Labs & R&D** section (interim credibility proof — real, disclosed non-client work, never implied to be paid client work).                                                                                                                            |
| `/work`                   | Case-study index, filterable by practice-area tag, currently listing one real entry.                                                                                                                                                                                                                                     |
| `/work/bhatkal-time-luxe` | Full case-study detail page, built from real assets and the research doc in `docs/research/`. **Currently a hand-written route, not a dynamic `/work/[slug]`** — see Known Issues.                                                                                                                                       |
| `/about`                  | Editorial narrative page (Engineering philosophy → Why HubZero exists → How we think → Software × Hardware → Labs & Engineering Curiosity → Founders → closing CTA), explicitly _not_ a traditional "About Us" (no mission/vision/values/timeline/awards boilerplate). Real founder/co-founder names, roles, and photos. |
| 404 / error / loading     | Basic App Router special-file handlers exist at `src/app/{not-found,error,loading}.tsx`.                                                                                                                                                                                                                                 |

### Missing entirely (not yet built)

- `/contact` — the primary conversion page. **Highest-priority gap**: without it there is no working lead-capture path anywhere on the live site.
- `/team` and `/team/[username]`
- `/notes` and `/notes/[slug]`
- `/careers`
- `/privacy`, `/terms`
- `/studio` (the entire CMS/admin panel — auth, RBAC, all content-management screens)

### Not started at all (infrastructure)

No database, no authentication, no Server Actions, no CMS. `package.json` has zero MongoDB/auth/ODM dependencies — the entire current build is a static, config-driven front-end (content lives in `src/config/*.ts` and hardcoded page copy, not a database). This corresponds to **Phase 0–1 of `ARCHITECTURE/14_IMPLEMENTATION_ROADMAP.md` not having started yet** — the roadmap explicitly sequences the CMS/data-layer/auth foundation _before_ most public pages, but in practice the public marketing shell has been built first. Be aware of this gap rather than assuming any backend exists.

---

## 7. Current Features (by page)

- **Homepage:** Six-beat narrative (`src/components/marketing/{hero-section,what-we-do,case-study,how-we-work,cta-close}.tsx`), circuit-motif component, scroll-reveal wrapper (`reveal.tsx`), theming via `next-themes`.
- **Services:** Overview page linking to two co-equal practice pages; software page folds in UI/UX, backend, AI/automation as integrated capabilities (not separate nav destinations, per `03`); hardware page carries the Labs/R&D interim-proof section.
- **Work:** Index page (`work-grid.tsx`) reads from `src/config/case-studies.ts` (a static array — not yet CMS-backed); one real case study, structured so adding a second is an array addition to the config plus a new route, not a template rewrite.
- **Case study detail (Bhatkal Time Luxe):** Full problem → approach → result narrative, real screenshots, explicitly states the actual stack (**Next.js 16, App Router, React 19, no separate backend — Route Handlers colocated in the same app**) — see §7.1 below for an important discrepancy to be aware of.
- **About:** Editorial narrative built to a specific founder brief (see `next-prompt.md` history / git log `cff01b3`) — deliberately avoids cards, mission/vision/values boilerplate, skill bars, and stock imagery; alternates narrative prose, imagery, pull quotes, and a real Founders section with names/roles/photos.
- **Shared shell:** Navbar + mobile nav driven by the single `src/config/nav.ts` structure (structurally prevents desktop/mobile link drift — a confirmed legacy bug class), footer sourced from the same config, announcement banner component, skip-nav for accessibility.

### 7.1 Known discrepancy — case-study tech stack facts

`ARCHITECTURE/15_HOMEPAGE_DESIGN.md` (§7, §11) still describes the Bhatkal Time Luxe case study as **"MERN + Imgix, built Apr–May 2025 (~6 weeks)"** — this was written before the real research doc and real assets existed and is **not correct**. The authoritative facts are:

- `docs/research/PROJECT_CASE_STUDY_ANALYSIS_BHATKAL_TIME_LUXE.md` — the real project analysis, which also explicitly flags that the "April 2025" development-period figure could not be verified against the project's own git history (earliest commit found was 2025-06-24) and asks the founder to confirm it against external records before it ships in permanent public copy.
- `src/app/(marketing)/work/bhatkal-time-luxe/page.tsx` — the actually-implemented page, which correctly states Next.js 16 / React 19, no separate backend.

**Treat the research doc and the implemented page as authoritative for any case-study fact.** `ARCHITECTURE/15`'s §7/§11 copy is a stale draft placeholder that was never corrected after real content landed — flag it for a documentation fix rather than treating it as ground truth if you encounter it.

---

## 8. Case Studies — Conventions for Future Entries

**Content policy** (`ARCHITECTURE/05_CONTENT_STRATEGY.md` §2): not every completed project becomes a case study — only ones with a real named client (or honest, specific anonymization), a clear problem statement, a specific technical approach, and a measurable or honestly-described result. Required fields: client, industry/type, practice-area tag, problem, approach, result, optional attributed quote, optional ongoing-relationship note. **Zero fabricated names, zero invented metrics — ever.**

**Where things live today (pre-CMS, static approach):**

- Summary metadata: add an entry to the `caseStudies` array in `src/config/case-studies.ts` (slug, client, title, one-line honest result, practice tag, cover image reference).
- Detail page: currently a hand-written route per case study (`src/app/(marketing)/work/[slug-literal]/page.tsx`), **not yet the dynamic `/work/[slug]` template** `ARCHITECTURE/06` specifies for the CMS-backed future state. Until the CMS exists, follow the existing hand-written-page pattern, but keep the eventual migration to a true dynamic route in mind.
- Source research: a project case-study analysis document in `docs/research/` (see the Bhatkal Time Luxe example) — this is where raw project facts, feature lists, and any founder-verification flags live before being distilled into public copy.
- Design-source screenshots: `assets/case-studies/[slug]/` (originals, never served directly).
- Served copies: `public/case-studies/[slug]/` (what the app actually references via `next/image`).

---

## 9. Assets

- **`assets/`** holds design-source originals — never served directly by the app, never edited in place once exported. This is the "master" folder for anything design produces.
- **`public/`** holds the public-facing served copies referenced by the running app (`public/brand/`, `public/case-studies/`, `public/team/`). Treat `public/` as a build artifact of `assets/`, not a second source of truth — if a served asset needs to change, update the design source and re-export, don't hand-edit the public copy in isolation.
- **Logo conventions** (`src/config/brand.ts` is the single source of truth — reference it, don't hardcode paths):
  - `icon.png` — transparent background, safe on any/theme-dependent background. Use this (or the theme-adaptive `Logo` component) for in-app chrome like the navbar.
  - `icon.svg` — **not a real vector.** It's a PNG wrapped in an `<image>` tag with an opaque white background baked in by the export tool. Do not render it in the app (it shows a white box in dark mode) until design provides a true transparent vector.
  - `primary.png`, `primary-horizontal.png`, `wordmark.png` — full lockups flattened onto an **opaque dark navy canvas**, not transparent. Reserved for guaranteed-dark contexts (OG image, hero/marketing moments) — never for chrome that must adapt to light theme.
- **Collaboration/co-branding lockups:** none exist in the repository yet. If/when a client or partner co-branding asset is needed, follow the same `assets/` (source) → `public/` (served) split and add the path to `brand.ts` rather than hardcoding it inline.

---

## 10. Responsive Standards (summary — see `ARCHITECTURE/16` for the full spec)

**Core rule:** responsive design is not shrinking or reflowing a desktop layout — each breakpoint tier (Desktop: 1080p/1440p-primary/4K-ultrawide; Tablet: iPad Mini/Air/Pro, portrait _and_ landscape; Mobile: small/standard/large phone) is composed as its own deliberate layout. If a composition weakens at some width, that breakpoint gets redesigned, not patched with wrapper divs or shrunk type.

**The specific engineering trap already found once** (in the hero's circuit motif): any `absolute`-positioned decorative element anchored against a viewport-width ancestor with a fixed offset (`-right-24`, etc.) holds its distance from the _viewport_ edge, not the _content_ edge — this looks fine at 1080p by accident and visibly drifts at 1440p+/4K/ultrawide. **Fix is always structural:** position the element inside the same `<Container>` the content it relates to lives in. Before adding any absolutely/fixed-positioned decorative element, ask whether its offset is measured against the content grid or the viewport.

**Approval gate:** no marketing section is "done" until checked at least once per breakpoint tier (including both tablet orientations), ideally on a real display for the desktop tier — DevTools zoom/scaling can hide exactly this class of bug.

This is a founder directive treated as objective engineering practice — not a stylistic preference subject to negotiation.

---

## 11. Motion Standards (summary — see `ARCHITECTURE/07` §4 and `ARCHITECTURE/15` §8)

Framer Motion is the default animation library (already a dependency). GSAP is not used at all currently and should only be introduced if a genuinely complex scroll-choreography need arises that Framer Motion can't reasonably handle — it is not the default for "fade in on scroll."

Rules: section-entry motion is brief (200–400ms, ease-out, 8–16px travel) and supports reading order — it is never a blanket "make it feel alive" wrapper applied to everything. Motion with an actual informational job (a metric counting up, a filter transition, form validation feedback) is encouraged. No autoplay decorative loops, no parallax for its own sake, no scroll-jacking. `prefers-reduced-motion` must be respected everywhere motion is used (`src/lib/motion.ts` is the shared utility for this).

On homepage-style editorial pages specifically: exactly one orchestrated on-load sequence (hero linework draws in, then headline/subhead, then the credibility strip continuing the same sequence), then near-silence below the fold.

---

## 12. Coding Standards

- **TypeScript strict mode.** No implicit any, no unnecessary type assertions.
- **Server Components by default.** Only add `'use client'` when a component actually uses a hook or browser API — this directly corrects a confirmed legacy over-use pattern.
- **No client-side fetching for data known at request time** — read from the data source directly in a Server Component once a backend exists; don't reach for `useEffect` + fetch as a default.
- **Single shared config for anything that has both a desktop and mobile (or public and internal) rendering** — e.g. `src/config/nav.ts` is consumed by both the desktop navbar and the mobile drawer. This pattern (one data structure, multiple renderers) is a structural fix for an entire confirmed legacy bug class (drifting link destinations) and should be the default whenever the same data needs two presentations.
- **No hardcoded lists that can drift from a real data source** — e.g. never hand-maintain a username list separately from wherever team members are actually defined.
- **Tailwind CSS v4, token-based.** Colors and gradients go through the CSS variable token system in `globals.css` — never hardcode a hex value inline, even if it matches an existing token's value.
- **Unified rendering pipeline for any markdown/rich-text content** (once Notes/the CMS exists) — CMS preview and published output must use the exact same pipeline; this directly fixes a confirmed legacy bug where preview and published output visually diverged.
- **ESLint (flat config) + Prettier + Husky/lint-staged** pre-commit hook — runs automatically on staged files, don't bypass it.
- **Component philosophy:** generic, reusable primitives live in `src/components/ui/` (button, card, input, container, grid, stack, etc.) and are used everywhere a form/layout primitive is needed; page-specific composition lives in `src/components/marketing/`. Don't build a one-off styled `<div>` where a `ui/` primitive already exists, and don't add a new `ui/` primitive for a single call site — see §4 for which component vocabulary applies to editorial vs. utility pages.

---

## 13. Git Workflow

- **`main`** — production branch. Protected; nothing merges here directly during the v2 rebuild — it will eventually be the cutover target (`ARCHITECTURE/14` Phase 7).
- **`dev`** — the active integration branch for the entire v2 rebuild. All architecture docs, `src/`, and every merged milestone currently live here (not on `main`). **Treat `dev`, not `main`, as the trunk to build from during this phase of the project.**
- **Worktree → merge-into-dev workflow:** each milestone/feature is built in its own git worktree (named descriptively, e.g. `worktree-software-hardware-pages`, `worktree-bhatkal-case-study-homepage-v2`), then merged back into `dev` with an explicit merge commit (`git log` shows the consistent pattern: `Merge worktree-X into dev: <one-line description of what shipped>`). This is the established convention — follow it for new milestones rather than committing directly to `dev` from a shared checkout.
- **A known tooling gotcha:** the `EnterWorktree` tool defaults to branching from `main`, not `dev`. Since `ARCHITECTURE/` and `src/` only exist on `dev`, **always verify both exist immediately after entering a new worktree** — if they're missing, the worktree branched from the wrong base and needs to be recreated from `dev`.
- **Merge strategy:** real merge commits, not squash or rebase — the commit history is meant to preserve which worktree/milestone each change came from.
- **Commit expectations:** descriptive messages naming what was actually shipped (not generic "updates" or "wip"); this repo's commit log is itself a readable changelog of milestones.
- **`client/` is never touched** by any of this — it stays as historical/reference-only until the Phase 7 cutover, regardless of what branch or worktree is active.

---

## 14. Known Issues

**Missing pages (highest priority first):**

- `/contact` — no lead-capture path exists anywhere on the live site yet; this blocks the site's single stated conversion goal.
- `/team`, `/team/[username]` — no team directory exists; the About page's Founders section doesn't yet link out anywhere.
- `/notes`, `/notes/[slug]`, `/careers`, `/privacy`, `/terms` — all unbuilt.

**Infrastructure not started:**

- No database, auth, CMS, or Server Actions of any kind — `package.json` has no MongoDB/ODM/auth dependency. All current content is static (`src/config/*.ts` and hardcoded page copy). Phase 0–1 of `ARCHITECTURE/14` (data layer, admin panel, RBAC foundation) has not begun, even though several public pages (normally sequenced after it) already exist.
- Case-study routing is one hand-written page per study, not yet the CMS-backed dynamic `/work/[slug]` template `ARCHITECTURE/06` specifies.

**Placeholders / unresolved facts:**

- `src/config/site.ts`'s `links` (email, linkedin, github) are all `null` — no verified org-level accounts exist yet; fill these in before launch rather than pointing at placeholders.
- The Bhatkal Time Luxe case study's development-period date ("April 2025") is explicitly flagged as unverified against the project's own git history in `docs/research/PROJECT_CASE_STUDY_ANALYSIS_BHATKAL_TIME_LUXE.md` — confirm against external records (contracts/invoices) before treating it as permanent public fact.
- `ARCHITECTURE/15_HOMEPAGE_DESIGN.md` §7/§11 still contain stale, incorrect case-study stack facts ("MERN + Imgix") superseded by the real research doc and the real implemented page — this is a documentation inconsistency to fix, not a code bug (see §7.1).

**Documentation housekeeping:**

- `ARCHITECTURE/15_HOMEPAGE_DESIGN.md` §13 notes it originally lived in a worktree's untracked `ARCHITECTURE/` copy and needed to be merged into the canonical folder — confirm this has fully landed on `dev` (it appears to have, since `dev` is the branch with `ARCHITECTURE/`, but verify no second stale copy exists elsewhere).

---

## 15. Pending Roadmap (realistic next milestones, priority order)

1. **`/contact`** — structured intake (name, email, company, project type, budget range, message), spam protection, and at minimum a working submission path (even a simple stored-lead mechanism ahead of the full Server Action + database implementation) so the site has _a_ functioning conversion path. This is the single most conversion-critical gap right now.
2. **Data layer + CMS core (`ARCHITECTURE/14` Phase 0–1)** — stand up MongoDB, auth, the responsibility-based RBAC (`09_CMS_ARCHITECTURE.md` §4), and the admin panel core at `/studio`, starting with Case Studies and Team Members (the two collections other phases depend on). This unblocks converting the current static config-driven content into real CMS-backed content.
3. **`/team` + `/team/[username]`** — core members only, server-rendered from the (eventual) CMS.
4. **Migrate case studies to the true `/work/[slug]` dynamic template**, backed by the CMS instead of hand-written per-study pages.
5. **`/notes` + `/notes/[slug]`** — full platform per `ARCHITECTURE/05` §5 / `06`, with 3–5 cornerstone launch articles.
6. **`/careers`, `/privacy`, `/terms`** — lower individual effort, round out launch completeness.
7. **SEO/performance/accessibility pass** — metadata audit, structured-data verification, image optimization, `prefers-reduced-motion` verification across all shipped motion (`ARCHITECTURE/14` Phase 5).
8. **Content population + launch readiness** — real case studies/testimonials only, founder sign-off on hero/services/work copy against the "could a competitor say this" test (`ARCHITECTURE/14` Phase 6).

This order follows `ARCHITECTURE/14_IMPLEMENTATION_ROADMAP.md`'s own priority logic (pages that make the core differentiation claim before supporting pages) adjusted for the fact that, in practice, more public pages have shipped ahead of the CMS/backend than the roadmap originally sequenced — Contact and the data layer are the two items most urgently out of sequence relative to the plan.

---

## 16. Important Decisions (founder-approved, affects implementation)

All dated 2026-07-01 unless noted; full rationale in `ARCHITECTURE/00_FOUNDER_APPROVAL.md`.

- **Founding year is 2024**, resolving a legacy 2023/2024 contradiction — use 2024 everywhere.
- **Leadership is Founder + co-founders**, not a single-founder narrative.
- **Hero copy is a direct statement, not a slogan** — approved register: "Building technology that solves real problems." All three originally-proposed tagline candidates were rejected outright.
- **CSE+ECE combined capability is a supporting differentiator placed just below the hero**, not the headline itself.
- **Pricing is never stated as a number** — guidance only (engagement types, typical complexity, "every project is quoted individually after discovery").
- **No newsletter/generic email capture in MVP** — the only conversion goal is a qualified project inquiry via Contact.
- **CMS is fully custom** (Next.js + MongoDB), not a configured third-party CMS (Payload/Sanity) — mature libraries are reused only for generic infra (auth, rich text, uploads, validation).
- **RBAC is responsibility-based** (Head Admin / Admin / Teammate + dynamic permissions like Team Lead), replacing an earlier department-based role model entirely. Department is metadata, not a permission source.
- **Notes ships as a complete platform in the MVP**, not deferred — reverses the original team-consensus reading of the survey data. Launch content is only 3–5 cornerstone articles, but the architecture must be production-ready at launch.
- **Version history is built from day one for every content type** — not an optional/deferred feature.
- **Data retention/backup policy is defined now** (daily incremental + periodic full backups, tested restoration), not deferred.
- **Team page shows core members only**, not a full roster — a rare case where the survey's non-founder consensus (3 of 4 respondents) overrode the founder's own initial preference.
- **Client portal is deferred past v1** — no strong demand signal, premature before lead generation itself is proven.
- **Growth targets are not locked to a fixed number** ("100+ projects") — architecture must scale gracefully whether real volume lands at 10 or 200.
- **Practice areas (Software, Hardware & Embedded) are the launch IA**, but built so future verticals (AI/ML, Cloud & DevOps, Cybersecurity, Robotics, Product Design, etc.) can be added without structural redesign.
- **Homepage (and same-visual-language pages) reject the `07_DESIGN_SYSTEM.md` §5 component vocabulary outright** — per explicit founder instruction, "assume the previous website failed as a design exercise... the new website should be visually unrecognizable from the previous version." This is the basis for `ARCHITECTURE/15`'s override.
- **Responsive-design quality is objective engineering practice**, not subject to founder/consensus negotiation the way product-direction decisions are (`ARCHITECTURE/16`).

---

## 17. Things Never To Do

- **Never derive UI language, copy tone, or IA decisions from the legacy `client/` site.** It is reference material for _what existed and what was wrong with it_, not a style guide. Read `ARCHIVED_PROJECT_ANALYSIS.md` for facts, not inspiration.
- **Never fabricate client metrics, statistics, or outcomes.** If a real number doesn't exist, state an honest qualitative result or omit the claim entirely — never invent a round number.
- **Never create placeholder or unattributed testimonials.** The CMS/content model rejects unattributed entries by design; if a real testimonial doesn't exist yet for a page, omit the section.
- **Never use generic agency clichés** — "bring your ideas to life," "user-first experience," "top-quality solutions," "innovative," "cutting-edge," emoji-driven CTAs. Run every sentence through the "could a competitor say this" test.
- **Never compromise the editorial direction on homepage-style pages** — no glassmorphism cards, gradient buttons, generic card grids, stock photography, testimonial carousels, decorative blur orbs, or icon-grid-with-vague-claims patterns, even if they'd be faster to ship.
- **Never implement a page or feature without first reading its governing `ARCHITECTURE/` document(s)** (see §3's governance map) — and check `00_FOUNDER_APPROVAL.md` for whether a later decision superseded the one you're reading.
- **Never add work to `client/`.** It is legacy, read-only, reference-only until cutover.
- **Never assume `main` is the working branch** — `dev` is the trunk during the v2 rebuild.
- **Never treat a responsive breakpoint as "done" just because nothing visibly overflows** — per `ARCHITECTURE/16`, it must read as _intentionally designed_ for that width, checked per-tier (including both tablet orientations).
- **Never position a decorative absolutely-positioned element against a bare viewport-width ancestor** — anchor it to the same `<Container>` the related content lives in (see §10 — this is a confirmed, previously-shipped bug class).
- **Never imply a registered legal entity** ("Inc.," a registration number, formal legal-entity language) — HubZero is currently unregistered; state that accurately.
- **Never publish a case-study fact (dates, stack, metrics) without checking it against the actual research doc in `docs/research/` and the actual implemented page** — `ARCHITECTURE/15` currently contains at least one confirmed-stale fact (see §7.1); don't propagate it further.

---

## 18. Starting a New Claude Code Session — Checklist

1. **Read this document first**, then `ARCHITECTURE/00_FOUNDER_APPROVAL.md` for anything time-sensitive it flags, then `ARCHITECTURE/14_IMPLEMENTATION_ROADMAP.md` to confirm what phase the project is actually in (compare against §6/§15 above, which may be stale by the time you read this).
2. **Confirm which branch you're on.** `dev` is the active trunk for the v2 rebuild, not `main`.
3. **If entering a git worktree, verify `ARCHITECTURE/` and `src/` exist immediately after creation** — the worktree tooling defaults to branching from `main`, which lacks both. Recreate from `dev` if they're missing.
4. **Check for a `next-prompt.md` at the repo root** — if present, it's the founder's brief for the current milestone and should be treated as standing instruction for the session (it's gitignored, so its absence in a fresh clone is normal, not a sign anything was lost).
5. **Before touching any page or feature, read the specific `ARCHITECTURE/` document(s) that govern it** (§3's table tells you which). Don't infer spec from the codebase alone — the codebase may be mid-migration or may predate a later architecture revision.
6. **Before any visual/homepage-style work, read `ARCHITECTURE/15` in full** — its component-vocabulary override and editorial philosophy are easy to violate by defaulting to `07`'s original card/button vocabulary.
7. **Before any responsive/layout work, read `ARCHITECTURE/16`** and check the specific viewport-vs-content-grid anchoring rule in §10 above.
8. **Check §14 (Known Issues) and §15 (Pending Roadmap) above** before assuming a page or system exists — several core pages (Contact, Team, Notes) and the entire backend/CMS are not built yet despite several public pages already existing.
9. **When in doubt about a business/product decision** (not an engineering/UX/accessibility one), check `00_FOUNDER_APPROVAL.md` first — it wins conflicts with every other document.
