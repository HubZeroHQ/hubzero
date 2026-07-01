# 03 — Information Architecture

> **Status: Founder Approved — 2026-07-01.** See `00_FOUNDER_APPROVAL.md` §2 (leadership structure) and §6 (growth-target flexibility, practice-area extensibility) for revisions incorporated below.

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
/work                                Case studies index
  /work/[slug]                      Individual case study
/about                               Company story, values, how we work
/team                                Core team (leadership) — NOT a full roster
  /team/[username]                  Individual profile (optional, secondary; opt-in for non-core members too)
/contact                            Start-a-project intake
/blog                                Index (CMS-backed; content optional at launch)
  /blog/[slug]                      Post
/careers                             Recruiting / "join us" (separate from client-facing brand voice)
/privacy                             Privacy policy
/terms                               Terms of use (new — legacy site only had privacy)
---
/studio                              Admin panel root (authenticated, not in public nav or sitemap)
```

Removed relative to legacy: `/web-development`, `/ui-ux`, `/branding`, `/seo` as four standalone, disconnected, shallow pages — folded into `/services/software` and `/services/hardware` as capabilities, not separate destinations (see `06_PAGE_SPECIFICATIONS.md`). `/work/bhatkaltimeluxe` becomes `/work/[slug]` (a real dynamic route, not a one-off hardcoded page — see `17` in the archived analysis for why the legacy approach doesn't scale). `/blog-editor` is removed entirely — replaced by the CMS admin panel (`09_CMS_ARCHITECTURE.md`).

## 2. Primary navigation

```
[HubZero logo]    Services   Work   About   Blog        [Start a project →]
```

Five items plus one CTA. Per the industry research synthesis (`02_BRAND_STRATEGY.md` §5, principle 5/6): a short, stable primary nav that doesn't try to serve every audience on every page. **Team is intentionally not in the primary nav** — it lives under About ("About → Team") because, per `01_PRODUCT_VISION.md` §9, individual team identity is secondary to company identity for the client-facing audience. Careers is in the footer, not primary nav, for the same reason (recruiting is a real but secondary audience — see `04_USER_JOURNEYS.md`).

**[Objective practice]** Mobile nav must be a true subset of desktop nav with identical destinations — the legacy site's mobile menu pointed "Work with Us" at `/contact` and "Blog" at a same-page anchor that doesn't exist outside the homepage; both were bugs, not design choices. v2's nav config is a single shared data structure consumed by both desktop and mobile renderers so this class of bug is structurally impossible.

## 3. Footer

```
HubZero                  Company              Services              Connect
[one-line positioning]   About                Software Engineering  Email
                          Team                 Hardware & Embedded   LinkedIn
                          Careers              Work / Case Studies   GitHub (org)
                          Blog
                          Contact

Privacy · Terms                                          © [year] HubZero
```

Legacy footer linked "Work with Us" to `/contact` and used decorative, unlinked Discord/YouTube/Instagram icons. v2's footer only links to things that exist and resolve correctly; social icons link to real, maintained accounts or are omitted.

## 4. Audience-to-IA mapping

| Audience | Primary entry points | What they need to find fast |
|---|---|---|
| Potential client (primary) | Home → Services / Work | Proof of capability, a way to start a conversation |
| Existing client | Direct link / email signature | Contact, possibly a future client portal (`14_IMPLEMENTATION_ROADMAP.md`, post-v1) |
| Potential recruit | `/careers`, shared individual portfolio links | Culture, how to apply, who's already on the team |
| Partner / collaborator | `/about`, `/work` | Credibility, scope of capability (do they do hardware too?) |
| Internal team (CMS users) | `/studio` (not discoverable from public nav) | Login, content they're authorized to edit |

Per `01_PRODUCT_VISION.md` §1 (Step 5 instruction: "The public website should prioritize potential clients. Everything else is secondary"), every primary-nav item is chosen for the potential-client journey; recruiting and internal tooling are reachable but not load-bearing in the main IA.

## 5. URL and routing conventions

- Lowercase, hyphenated slugs (`/work/bhatkal-time-luxe`, not `bhatkaltimeluxe`) — **[Objective practice]**, both for readability and because the legacy concatenated slug is harder to read and worse for SEO keyword matching.
- No trailing-slash ambiguity: the legacy `next.config.ts` set `trailingSlash: true` but never applied it due to a missing `export default` (`ARCHIVED_PROJECT_ANALYSIS.md` §16, bug #1) — v2 fixes the config bug and consistently uses **no trailing slash** (Next.js App Router default), to match modern convention and avoid duplicate-URL SEO issues.
- Portfolio/team usernames remain short, lowercase, single-word (`/team/rifaque`) — consistent with the existing, working brand convention.
- `/studio` (admin) is excluded from the sitemap and from search indexing via `robots.txt`, same intent as the legacy `next-sitemap` config's `/admin` exclusion, now actually meaningful because `/studio` will exist.

## 6. Depth and breadth rules

- No page requires more than **2 clicks** from the homepage for any primary-audience destination (Services, Work, Contact, About).
- Case studies and blog posts are the only content types with indefinite depth (`/work/[slug]`, `/blog/[slug]`) — by design. **[Amended 2026-07-01, see `00_FOUNDER_APPROVAL.md` §6]** The founder's original 100+ project estimate (`01_PRODUCT_VISION.md` §3) is no longer treated as a firm design target — the requirement now is simply that these routes and their CMS collections degrade and scale gracefully whether real volume lands at 10 or 200, without a fixed number driving the architecture.
