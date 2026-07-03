# 13 — SEO Strategy

> **Status: Founder Approved — 2026-07-01; amended 2026-07-04.** Target market clarified in §4 below (global English-speaking, not India-locked) and blog scope in §3 (full platform, including search/RSS, ships in MVP) — see `00_FOUNDER_APPROVAL.md` §1, §3. §2's metadata table gained Build/Labs/Blueprint rows on 2026-07-04 — see `00_FOUNDER_APPROVAL.md` §8.

> Decision convention: see `01_PRODUCT_VISION.md` §0. The legacy site had real SEO infrastructure (`next-sitemap`, OpenGraph/Twitter metadata, attempted JSON-LD) undermined by a config bug and a no-op API usage — `13` is mostly about making the existing intent actually work, plus extending it to the new content types.

## 1. Fix the confirmed-broken foundations first

1. `next.config.ts` missing `export default` meant `trailingSlash` and image settings were silently never applied (`ARCHIVED_PROJECT_ANALYSIS.md` §16 problem #1) — fixed structurally per `08_TECHNICAL_ARCHITECTURE.md` §7.
2. Schema.org JSON-LD via `next/head` is a confirmed no-op in the App Router — every portfolio page's structured data was silently dropped (`ARCHIVED_PROJECT_ANALYSIS.md` §16 problem #2) — fixed via `generateMetadata`.
3. Privacy Policy claims "we currently do not use tracking cookies" while analytics scripts run — a factual contradiction that is also an SEO/trust risk if surfaced (`ARCHIVED_PROJECT_ANALYSIS.md` §7.17 note, `06_PAGE_SPECIFICATIONS.md` Privacy) — corrected to match whatever analytics tool v2 actually ships.

## 2. Per-page-type metadata strategy

| Page type | Title pattern | Notable structured data |
|---|---|---|
| Home | `HubZero — [positioning line]` | Organization JSON-LD |
| Services | `[Service] Engineering | HubZero` | Service JSON-LD |
| Case study | `[Client] — [one-line result] | HubZero Work` | CreativeWork / Article JSON-LD, with `about` linking practice area |
| Build *(new, 2026-07-04)* | `[Name] — [Tagline] | HubZero Builds` | CreativeWork JSON-LD — no `client`/`Organization` party in the schema, unlike Case Study |
| Labs project *(new, 2026-07-04)* | `[Title] — HubZero Labs` | CreativeWork JSON-LD, explicitly marked non-commercial/research in scope where the vocabulary supports it |
| Blueprint *(new, 2026-07-04)* | `[Name] Blueprint — HubZero Blueprints` | Hybrid Product/CreativeWork JSON-LD — a Blueprint has a category and a live demo the way a product listing does, which plain CreativeWork/Article JSON-LD (used for case studies and blog posts) doesn't capture |
| Blog post | `[Title] | HubZero Blog` | Article JSON-LD (author, datePublished, dateModified) |
| Team profile | `[Name] — [Role] | HubZero` | Person JSON-LD (this is the exact data type the legacy site tried and failed to ship via `next/head` — `ARCHIVED_PROJECT_ANALYSIS.md` §3.11) |

All titles/descriptions are CMS-editable per content item (case studies, blog posts, **Builds, Labs projects, Blueprints**) rather than hardcoded, since SEO copy needs to evolve without a deploy — consistent with the CMS mandate in `09_CMS_ARCHITECTURE.md`.

## 3. Sitemap and crawl control

`next-sitemap` (or equivalent) continues to generate `sitemap.xml`/`robots.txt` on build, with `/studio` excluded — same intent as the legacy config's `/admin` exclusion (`ARCHIVED_PROJECT_ANALYSIS.md` §13), now meaningful because `/studio` actually exists. Sitemap entries for case studies and blog posts are generated dynamically from the database (published items only), not from a static file list — this is necessary regardless of preference, since content now lives in MongoDB rather than the filesystem (`08_TECHNICAL_ARCHITECTURE.md` §3). **[Amended 2026-07-01]** An RSS feed for published blog posts is generated alongside the sitemap — the blog ships as a complete platform in the MVP, not a deferred feature (`00_FOUNDER_APPROVAL.md` §3), so RSS/crawl infrastructure for it is in scope from launch. **[Amended 2026-07-04]** Sitemap generation extends identically to Builds, Labs, and Blueprints — published entries in each new collection are included in the same dynamic, database-driven generation, not a separately maintained list.

## 4. Content-led SEO strategy (what to actually rank for)

Per `01_PRODUCT_VISION.md` §2-3, HubZero's defensible differentiator is the combined software+hardware capability — this should also be the SEO strategy, not just the brand strategy: target search terms that a single-discipline competitor agency cannot credibly rank for (e.g. terms combining web/software development with embedded/IoT/electronics integration for a specific industry context), rather than competing purely on generic high-competition terms like "web development company" where HubZero has no ranking advantage over thousands of larger agencies. **[Founder decision]** — this follows directly from the founder's own framing of the company (CSE+ECE) being treated as the company's defining identity per `01` §0, and is also simply the objectively sound SEO move (compete where competition is thinner and relevance is highest).

**[Amended 2026-07-01, see `00_FOUNDER_APPROVAL.md` §1]** Target market is **English-speaking global clients**, not a specific region — initial business development is India-based, but SEO/copy must not read as India-only. This means: no region-locked geo-targeting in metadata, no INR-only pricing language, industry/technical relevance drives targeting over geography. Regional signals (if any) should be treated as one input among several, not the primary targeting axis.

## 5. Performance as an SEO factor

- `images.unoptimized: true` site-wide in the legacy config (`ARCHIVED_PROJECT_ANALYSIS.md` §13, §14) directly hurts Core Web Vitals (LCP) — v2 enables real image optimization (`08_TECHNICAL_ARCHITECTURE.md` §7).
- Large, broadly-imported icon sets and animation libraries on every page (`ARCHIVED_PROJECT_ANALYSIS.md` §14 "Bundle Size Concerns") are addressed by the motion/restraint rules in `07_DESIGN_SYSTEM.md` §4 and by per-page code-splitting (only load GSAP if a page genuinely needs it; tree-shake icon imports).
- Static generation + ISR (`08_TECHNICAL_ARCHITECTURE.md` §4) keeps marketing pages fast without sacrificing the CMS's ability to update content without a full redeploy.

## 6. Analytics and privacy alignment

Whatever analytics tool is chosen (Vercel Analytics, a self-hosted/privacy-respecting alternative, or similar) must be accurately reflected in the Privacy Policy — this is a correctness requirement regardless of which tool is picked, fixing the confirmed legacy contradiction in §1.3 above.
