# Changelog

All notable changes to this project are documented in this file. Entries are engineering release notes, not marketing copy — see [`docs/releases/`](docs/releases) for the full reasoning behind each release.

## v3.2.1 - 2026-08-14

### Fixed

- Added an independently styled global 404 document compatible with the separate public and Studio root layouts.
- Made missing records across all seven public detail families return server-readable HTTP 404 responses without invalid canonical or duplicate robots metadata.
- Replaced the empty public loading boundary with stable, foundation-aware skeleton geometry so the footer retains its place during navigation.
- Corrected the public browser-title delimiter to a UTF-8 em dash.
- Added an accessible name to the public search combobox and corrected Engineering Profile heading levels in their profile-specific embedding context.
- Prevented stale Media Picker searches from replacing newer results, and made the Studio Command Palette enter its existing degraded state for non-successful HTTP responses.
- Distinguished public query failures from genuinely empty collections or missing records on the confirmed affected routes.

### Privacy

- Updated the public disclosure to describe the anonymous performance data reported by the existing Vercel Speed Insights integration.

## v3.2.0 - 2026-08-10

### Performance

- Removed the principal public and Studio MongoDB query-amplification paths through request-scoped snapshots, batched enrichment, shared projections, and safe parallel composition.
- Reduced controlled operation maxima to 21 for the homepage, 13 for Work detail, 28 for Studio health, 39 for a Studio editor, and 47 for the dashboard, below the retained 40/13/45/56/64 regression budgets.
- Added a repeatable query-operation regression harness and structured Preview telemetry for connection, checkout, command, composition, and runtime-instance timing.

### Reliability

- Bounded initial MongoDB readiness to five seconds and discarded timed-out clients so 47–80 second cold connection attempts cannot remain on the application request path.
- Added a pre-stream Studio root readiness gate so database-unavailable document requests fail with HTTP 5xx before Studio begins rendering, rather than becoming an apparent HTTP 200 through a streamed error boundary.
- Preserved race-safe process-level client reuse and made failed initialization retryable for repositories and the Auth.js MongoDB adapter.
- Added an authenticated, detail-free Studio readiness endpoint for operational checks.

### Infrastructure decision

- Kept MongoDB, the existing pool configuration, Atlas tier/region, cache semantics, and indexes unchanged. Evidence supports Mumbai-proximate Vercel execution as a future controlled rollout, but this release does not change Production infrastructure.
- The underlying cold-instance DNS/TLS/network-path variability is not claimed fixed; v3.2.0 bounds its application impact and reports failure correctly where a pre-stream contract is technically available.

## v3.1.1 - 2026-08-08

### Fixed

- Eliminated the document-editor unload protection race so a refresh immediately after typing is guarded.
- Made Save & Leave navigate only after a successful save, without competing with an in-place refresh.
- Refreshed workflow state after archive and restore actions, including status controls and entry panels.
- Removed the invalid review-stage unpublish action; rejection is now the single reasoned path back to Draft.
- Standardized Studio editor save state labels to Unsaved, Saving, Saved, and Failed.
- Removed the desktop sidebar's independent scrolling region and tightened navigation spacing to keep the shell fixed.
- Refined dashboard and Studio mutation refresh behaviour.

### Changed

- Updated safe dependency versions, including React, Radix primitives, and sanitize-html.

## v3.1.0 - 2026-08-02

### Added

- Navigation protection with unsaved-changes detection across Studio editors
- Shared editor state system and sticky save experience
- Canonical Featured Order system for Work, Builds, Blueprints, Labs and Notes
- Editorial ordering on public collection pages
- Content Health dashboard and detailed health reporting
- Relationship Health diagnostics
- Entry Inspector with contextual health information
- Editorial Event Log infrastructure
- Entry History timeline
- Studio Activity feed
- Global Studio Search
- Studio Command Palette
- Publishing summaries and improved editorial dashboard
- Featured coverage monitoring and homepage readiness checks

### Changed

- Reworked Studio dashboard into an editorial workspace focused on actionable tasks
- Replaced homepage featured selection with canonical editorial ordering
- Improved review workflow responsiveness and transition feedback
- Unified search ranking across Studio Search and Command Palette
- Improved Studio shell layout and scrolling behaviour
- Refined public cache isolation to prevent cross-database cache contamination during development
- Improved public collection ordering using editorial priority
- Consolidated health reporting into reusable services
- Simplified dashboard health presentation with compact system summaries
- Improved activity previews and publishing summaries

### Fixed

- Runtime compatibility issues caused by `isomorphic-dompurify` and server-side `jsdom`
- Multiple navigation edge cases around unsaved changes
- Concurrent save race conditions
- Review action duplicate submissions
- Cross-database development cache contamination
- Various dashboard consistency issues
- Multiple editor workflow refresh issues
- Numerous UI, accessibility, and reliability improvements throughout Studio

### Performance

- Reduced unnecessary dashboard rendering
- Shared search indexing and ranking logic
- Improved activity loading
- Reduced duplicate refreshes and redundant server actions
- Improved cache behaviour for public content
- Numerous internal optimizations and test improvements

### Developer Experience

- Expanded automated test coverage
- Improved internal architecture and shared services
- Strengthened type safety across Studio
- Added architectural documentation and ADRs
- Improved maintainability through shared editor, health and activity systems

## v3.0.1

### Fixed

- Fixed a production-only runtime failure affecting Studio content detail pages and public rich-text rendering.
- Replaced `isomorphic-dompurify` with `sanitize-html` for server-side rich-text sanitization.
- Removed the `jsdom` production dependency chain (`html-encoding-sniffer`, `@exodus/bytes`) from deployed serverless functions.
- Preserved the existing sanitization allowlist and verified XSS protection parity.
- Improved production runtime compatibility across supported Node.js versions.

### Verification

- 463/463 tests passing
- TypeScript clean
- ESLint clean
- Production build successful
- Verified no `jsdom` dependency in production server bundles

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
