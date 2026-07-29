# Changelog

All notable changes to this project are documented in this file. Entries are engineering release notes, not marketing copy — see [`docs/releases/`](docs/releases) for the full reasoning behind each release.

## v3.0.0 — Experience v3

### Summary

Experience v3 closes the trust gaps v2.5's breadth-first build left behind (publishing integrity, real preview parity, a headless Careers backend, graph/list relationship drift), then verifies the entire public experience against its own design system, motion language, and production-readiness requirements before release. Full detail: [`docs/releases/EXPERIENCE_V3_RELEASE_RECORD.md`](docs/releases/EXPERIENCE_V3_RELEASE_RECORD.md).

### Major architectural work

- Publishing now requires `publish` capability to edit an already-published entry, and forces it back to `inReview` on save — closes a silent-rewrite gap with no re-review gate.
- Real Next.js Draft Mode preview, replacing an in-Studio toggle that rendered a different component tree than the public site and called that parity.
- Careers is a complete content type: public index/detail pages, a candidate-interest form, Studio CRUD, and full relationship-system wiring — previously a fully-wired backend with zero UI.
- Relationship graph/list parity audited and fixed across five of six detail-page types; the Evidence Graph and its adjacent list now describe the same underlying data everywhere.
- Architecture consolidation: merged duplicated graph-construction logic, unified three independently-maintained type maps, extracted two multiply-copied Studio algorithms into shared, tested modules.

### Design evolution

- Full design-conformance audit against `DESIGN_SYSTEM.md`, `ENGINEERING_IDENTITY.md`, and `MOTION_GUIDELINES.md`, using a Drift / Product Identity / Design System Gap classification to separate genuine bugs from deliberate product decisions.
- Founder identity system (per-founder accent color and procedural motif) reviewed, preserved, and formally documented as an accountable design-system exception rather than left as inferred-from-code-comments.
- Token consolidation (`--duration-press`, `--color-border-subtle`, `--color-surface-input-focus`) and hover-state/chip-fill consistency fixes across shared components.

### Motion system

- Dedicated seven-area motion audit; confirmed `public-settle` page transitions, zero scroll-triggered entrance animations, and no spring/bounce easing anywhere — a correctness finding, not a gap.
- Fixed a missing disabled-state opacity transition and an over-animated mobile accordion (five simultaneously-thrashing layout properties down to three).

### SEO

- Verified per-page metadata, canonical URLs, Open Graph/Twitter Card data, and JSON-LD (Organization, WebSite, Person, BreadcrumbList, CollectionPage, TechArticle, and more) across every route, directly against real build output.
- Added `CollectionPage`/`ItemList` structured data to the Careers index, matching every other collection.
- Added `/privacy` to the sitemap and enabled Services as a footer-visible (not primary-nav) destination, closing the one real orphan-hub risk found.
- Evaluated and deliberately did not add `JobPosting` schema or per-listing Career OG images — no real `datePosted` or `hero` field exists to source either honestly.

### Accessibility

- Fixed a confirmed WCAG 1.3.1/4.1.2 defect: all 8 fields of the Career Interest form had `<label htmlFor>` pointing at ids that didn't exist on the page.
- Verified skip link, semantic landmarks, focus management (search palette, dialogs), heading hierarchy, and color contrast against `DESIGN_SYSTEM.md` §12 and `.hubzero/release/RELEASE_CHECKLIST.md` §7.

### Security

- Upgraded `next` (15.5.20 → 15.5.22) and `next-auth` (5.0.0-beta.31 → beta.32), closing 2 critical + 1 high severity `npm audit` finding in production dependencies. `npm audit --omit=dev` now reports 0 vulnerabilities.
- Added production security headers: `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security` — none had existed before.
- Investigated and rejected nonce-based CSP after empirically confirming it breaks every statically-generated page in production (a pre-rendered page's HTML ships with no nonce, while per-request middleware stamps a fresh, non-matching one onto its cached response). Settled on a disclosed, justified `'unsafe-inline'` for `script-src`/`style-src`, with every other directive at `default-src 'self'`-level strictness.
- Added `/privacy`, describing exactly what the Contact and Career Interest forms collect and why — no privacy policy had existed despite both forms storing PII.

### Documentation

- Corrected six stale documentation claims made by this release's own earlier work (`CMS_PRODUCT_DESIGN.md`, `PLANNING.md`, `PUBLIC_DATA_LAYER.md`, `RELATIONSHIP_AUDIT.md`, `ENGINEERING_IDENTITY.md`).
- Added `docs/operations/ENGINEERING_BOOTSTRAP.md` (the canonical session-startup sequence) and `ENGINEERING_SKILLS_ROADMAP.md`.
- Added `docs/releases/EXPERIENCE_V3_RELEASE_RECORD.md` as the permanent historical record of this release's reasoning.

### Release readiness

- Version bumped to `3.0.0`; repository metadata (`description`, `keywords`, `repository`, `author`, `license`) completed in `package.json`.
- Verified clean: 0 TypeScript errors, 0 lint errors, 446/446 tests passing, production build succeeds with all ISR revalidation windows intact.
