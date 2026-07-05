# 03 — Information Architecture

> **Status: Founder Approved — 2026-07-01; amended 2026-07-04.** See `00_FOUNDER_APPROVAL.md` §2 (leadership structure) and §6 (growth-target flexibility, practice-area extensibility) for revisions incorporated below. §1 (sitemap), §2 (primary navigation), §3 (footer), and §6 (depth/breadth) below were amended 2026-07-04 to incorporate the four-pillar company structure — see `00_FOUNDER_APPROVAL.md` §8 and `17_COMPANY_STRUCTURE.md` for the full rationale.

> Decision convention: see `01_PRODUCT_VISION.md` §0. Decisions below are tagged **[Consensus]**, **[Founder decision]**, or **[Objective practice]** (UX/SEO/accessibility reasoning independent of any survey answer).

## 1. Sitemap (v2)

```
/                                   Home
/services                           Services overview (CSE + ECE split; extensible to future practice areas)
  /services/software                Software Engineering (web, app, backend, AI/automation)
  /services/hardware                Hardware & Embedded Engineering (ECE/IoT)
  /services/[future-vertical]        Reserved: additional practice areas (e.g. AI/ML, Cloud & DevOps,
                                      Cybersecurity, Robotics, Product Design) may be added later — the
                                      Services collection and this route are designed not to require
                                      restructuring when that happens (see `00_FOUNDER_APPROVAL.md` §6)
/work                                Case studies index — client work only (`17_COMPANY_STRUCTURE.md` §2)
  /work/[slug]                      Individual case study
/builds                              [New, 2026-07-04] Completed first-party products HubZero owns
  /builds/[slug]                    Individual build — see `17_COMPANY_STRUCTURE.md` §2
/labs                                [New, 2026-07-04] Research, prototypes, active exploration —
                                      hardware, software, or AI; generalizes the former Hardware-page-only
                                      "Labs / R&D" section into a permanent, top-level pillar
                                      (`00_FOUNDER_APPROVAL.md` §8)
  /labs/[slug]                      Individual Labs project
/blueprints                          [New, 2026-07-04] Reusable, customizable production-ready
                                      engineering foundations — not templates (`17_COMPANY_STRUCTURE.md` §2)
  /blueprints/[slug]                Individual Blueprint (unique Blueprint ID, category, live demo, preview,
                                      customization notes — see `11_DATABASE_ARCHITECTURE.md`)
/about                               Company story, values, how we work
/team                                Core team (leadership) — NOT a full roster
  /team/[username]                  Individual profile (optional, secondary; opt-in for non-core members too)
/contact                            Start-a-project intake
/notes                               Index (CMS-backed; content optional at launch)
  /notes/[slug]                     Note
/careers                             Recruiting / "join us" (separate from client-facing brand voice)
/privacy                             Privacy policy
/terms                               Terms of use (new — legacy site only had privacy)
---
/studio                              Admin panel root (authenticated, not in public nav or sitemap)
```

Removed relative to legacy: `/web-development`, `/ui-ux`, `/branding`, `/seo` as four standalone, disconnected, shallow pages — folded into `/services/software` and `/services/hardware` as capabilities, not separate destinations (see `06_PAGE_SPECIFICATIONS.md`). `/work/bhatkaltimeluxe` becomes `/work/[slug]` (a real dynamic route, not a one-off hardcoded page — see `17` in the archived analysis for why the legacy approach doesn't scale). `/blog-editor` is removed entirely — replaced by the CMS admin panel (`09_CMS_ARCHITECTURE.md`).

**[New, 2026-07-04]** `/builds`, `/labs`, and `/blueprints` follow the exact same URL, routing, and rendering conventions as `/work` (§5 below) — they are not a separate pattern. Each route ships only once it has at least one real, published entry; an index route with zero entries is not added to the sitemap or primary nav ahead of real content (§2), consistent with the zero-fabrication discipline already governing every other content type (`05_CONTENT_STRATEGY.md` §3).

## 2. Primary navigation

```
[HubZero logo]    Services   Work   Builds   Labs   Blueprints   About        [Start a project →]
```

**[Amended 2026-07-04, see `00_FOUNDER_APPROVAL.md` §8, `17_COMPANY_STRUCTURE.md` §5]** Six items plus one CTA — raised from the original five-item ceiling to accommodate the four-pillar company structure. The *principle* behind the original ceiling is unchanged: a short, stable primary nav that reflects real, distinct visitor intents rather than decorative breadth (`02_BRAND_STRATEGY.md` §5, principle 5/6). What changed is the number of genuinely distinct intents a visitor now has — evaluating HubZero's own products (Builds) and reusable foundations (Blueprints) alongside its client work (Work) and open research (Labs) are four different questions, not one. Notes moves to footer-only under this revision (§3 below) to keep the top-level count at six rather than seven; it can be promoted back to primary nav in a future amendment if it earns the traffic/content volume to justify it.

**Rollout is content-gated, not simultaneous.** A pillar enters primary nav only once it has at least one real, published entry — Work is already there; Builds, Labs, and Blueprints are shown in the diagram above as the target state, but each should be added to the live nav config only as it ships real content, exactly as Careers and Team already work today. Until a pillar ships, it lives in the footer (§3), never as a nav item pointing at an empty index.

**Why not group Work/Builds/Labs/Blueprints under one umbrella menu instead of raising the ceiling:** grouping Builds and Labs (HubZero's own, unpaid work) under a "Work" menu would contradict `17_COMPANY_STRUCTURE.md` §2's own definition of Work as client engagements specifically — the confusion this would cause outweighs the one nav slot it would save. See `17_COMPANY_STRUCTURE.md` §5 for the full trade-off analysis.

**Team is intentionally not in the primary nav** — it lives under About ("About → Team") because, per `01_PRODUCT_VISION.md` §9, individual team identity is secondary to company identity for the client-facing audience. Careers is in the footer, not primary nav, for the same reason (recruiting is a real but secondary audience — see `04_USER_JOURNEYS.md`).

**[Objective practice]** Mobile nav must be a true subset of desktop nav with identical destinations — the legacy site's mobile menu pointed "Work with Us" at `/contact` and "Blog" at a same-page anchor that doesn't exist outside the homepage; both were bugs, not design choices. v2's nav config is a single shared data structure consumed by both desktop and mobile renderers so this class of bug is structurally impossible. This applies unchanged as Builds/Labs/Blueprints are added to the config — one data structure, two renderers, regardless of how many pillars it lists.

## 3. Footer

```
HubZero                  Company              Services              Connect
[one-line positioning]   About                Software Engineering  Email
                          Team                 Hardware & Embedded   LinkedIn
                          Careers              Work / Case Studies   GitHub (org)
                          Notes                Builds
                          Contact              Labs
                                                Blueprints

Privacy · Terms                                          © [year] HubZero
```

Legacy footer linked "Work with Us" to `/contact` and used decorative, unlinked Discord/YouTube/Instagram icons. v2's footer only links to things that exist and resolve correctly; social icons link to real, maintained accounts or are omitted.

**[Amended 2026-07-04]** Builds, Labs, and Blueprints are added to the Services column's list of destinations (grouped there as "what HubZero builds," alongside the existing Work / Case Studies entry) as each pillar ships real content — same "don't link to what doesn't exist yet" discipline as everything else in this footer. Once a pillar is promoted to primary nav (§2), its footer entry stays; the footer is not exclusively a holding pattern for pre-nav content, it's simply where every secondary or not-yet-primary destination lives.

## 4. Audience-to-IA mapping

| Audience | Primary entry points | What they need to find fast |
|---|---|---|
| Potential client (primary) | Home → Services / Work | Proof of capability, a way to start a conversation |
| Existing client | Direct link / email signature | Contact, possibly a future client portal (`14_IMPLEMENTATION_ROADMAP.md`, post-v1) |
| Potential recruit | `/careers`, shared individual portfolio links | Culture, how to apply, who's already on the team |
| Partner / collaborator | `/about`, `/work`, `/builds`, `/labs` | Credibility, scope of capability (do they do hardware too? do they build their own things, not just client work?) |
| Internal team (CMS users) | `/studio` (not discoverable from public nav) | Login, content they're authorized to edit |

Per `01_PRODUCT_VISION.md` §1 (Step 5 instruction: "The public website should prioritize potential clients. Everything else is secondary"), every primary-nav item is chosen for the potential-client journey; recruiting and internal tooling are reachable but not load-bearing in the main IA.

## 5. URL and routing conventions

- Lowercase, hyphenated slugs (`/work/bhatkal-time-luxe`, not `bhatkaltimeluxe`) — **[Objective practice]**, both for readability and because the legacy concatenated slug is harder to read and worse for SEO keyword matching.
- No trailing-slash ambiguity: the legacy `next.config.ts` set `trailingSlash: true` but never applied it due to a missing `export default` (`ARCHIVED_PROJECT_ANALYSIS.md` §16, bug #1) — v2 fixes the config bug and consistently uses **no trailing slash** (Next.js App Router default), to match modern convention and avoid duplicate-URL SEO issues.
- Portfolio/team usernames remain short, lowercase, single-word (`/team/rifaque`) — consistent with the existing, working brand convention.
- `/studio` (admin) is excluded from the sitemap and from search indexing via `robots.txt`, same intent as the legacy `next-sitemap` config's `/admin` exclusion, now actually meaningful because `/studio` will exist.
- **[Amended 2026-07-04]** `/builds/[slug]`, `/labs/[slug]`, and `/blueprints/[slug]` follow the identical lowercase-hyphenated, no-trailing-slash convention above — no separate rule set. Blueprints carry an additional unique Blueprint ID (`11_DATABASE_ARCHITECTURE.md`); that ID is an internal field, never exposed in the URL itself, mirroring the existing `CaseStudy._id` vs. `CaseStudy.slug` split.

## 6. Depth and breadth rules

- No page requires more than **2 clicks** from the homepage for any primary-audience destination (Services, Work, Contact, About). **[Amended 2026-07-04]** This guarantee extends to Builds, Labs, and Blueprints once each is promoted to primary nav (§2) — until then, they remain reachable within 2 clicks via the footer.
- Case studies, Builds, Labs projects, Blueprints, and notes are the content types with indefinite depth (`/work/[slug]`, `/builds/[slug]`, `/labs/[slug]`, `/blueprints/[slug]`, `/notes/[slug]`) — by design. **[Amended 2026-07-01, see `00_FOUNDER_APPROVAL.md` §6]** The founder's original 100+ project estimate (`01_PRODUCT_VISION.md` §3) is no longer treated as a firm design target — the requirement now is simply that these routes and their CMS collections degrade and scale gracefully whether real volume lands at 10 or 200, without a fixed number driving the architecture. This scaling requirement applies identically to the three new pillars.
