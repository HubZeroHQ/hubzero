# 07 — Design System

> **Status: Founder Approved — 2026-07-01; amended 2026-07-04.** No content changes from the founder-approval session; carried forward as originally specified. See `00_FOUNDER_APPROVAL.md` for the full decision log. New §8 added 2026-07-04, generalizing `15_HOMEPAGE_DESIGN.md`'s per-beat Uniqueness Test into a standing requirement for any new marketing page, per `00_FOUNDER_APPROVAL.md` §8 and the commissioned design review (`docs/design-reviews/MARKETING_SITE_REVIEW_V1.md`).

> Decision convention: see `01_PRODUCT_VISION.md` §0. This document translates the research synthesis in `02_BRAND_STRATEGY.md` §5 into concrete, enforceable tokens and rules.

## 1. Typography

**[Objective practice + research-derived]** One typeface family, total discipline (research principle 3). Keep the legacy site's Geist Sans / Geist Mono pairing — it is already a well-made, restrained choice (self-hosted via `next/font/google`, no FOUT) — but use it with far more discipline than the legacy execution:

- **Scale:** a tight modular scale, 4px base unit. Display: 56-72px (desktop hero only). H1: 40-48px. H2: 28-32px. H3: 20-24px. Body: 17-18px (larger than the legacy default — research finding: premium sites set body copy larger and more spacious than instinct suggests). Caption/meta: 13-14px.
- **Weight:** 2-3 weights total (Regular 400, Medium 500, Semibold 600). No Light, no Black/900 — both read as either flimsy or shouty.
- **Letter-spacing:** -0.02 to -0.04em on display/H1 sizes only (tightens large type so it reads dense and engineered, per research). Body text: default tracking.
- **Line-height:** 1.5-1.6 on body copy (legacy is inconsistent across components). 1.1-1.2 on display/headline sizes.
- **Monospace (Geist Mono):** reserved for genuinely technical content — code snippets, terminal UI, technical metadata (dates in case studies, version numbers) — not as a whole-page aesthetic choice the way the legacy portfolio pages use `font-mono` globally. Monospace-as-personality is fine on an individual's profile page; it is not the company's primary typographic voice.

## 2. Color

**[Objective practice + research-derived]** Keep the OKLCH dark-first system (it's a legitimate, modern choice — `ARCHIVED_PROJECT_ANALYSIS.md` §5) but enforce the "one accent color, used semantically" rule (research principle 9), which the legacy implementation violates by hardcoding 4 different brand gradient hex values ad hoc across components instead of going through the token system (`ARCHIVED_PROJECT_ANALYSIS.md` §16 problem #17, §5 Color Palette).

- **Base palette:** near-monochrome — background, surface, border, text, muted-text (5 tokens), defined in OKLCH for both dark (default) and light themes, exactly as the legacy `globals.css` variable structure already does. Keep this structure; stop bypassing it with inline hex.
- **One accent:** a single brand color (electric blue, `--accent`, already defined in the legacy token set) used only for: the primary CTA, active/focused states, and brand mark. The gradient family (`#3ABEFF → #665DCD → #D2AB67`) is allowed to exist as **one named gradient token** (`--brand-gradient`) used in at most 1-2 places per page (hero text treatment, primary CTA) — never as a default section background or decorative blur orb filler.
- **Decorative blur orbs:** removed as a default pattern. The legacy site places them behind nearly every section (`ARCHIVED_PROJECT_ANALYSIS.md` §15 "Glow background orbs — appears in 8+ components"); per research principle 2 (restraint signals confidence), this reads as compensating for thin content. Used at most once per page, at low opacity, if at all.
- **Light mode:** the legacy light-mode tokens already exist in CSS but the toggle is commented out (`ARCHIVED_PROJECT_ANALYSIS.md` §16, §5). v2 ships the toggle, working, using the existing token values as a starting point — this is a real, already-designed feature that was simply never wired up; finishing it is cheap and removes a "looks unfinished" signal.

## 3. Spacing and layout

**[Research-derived]** "Spend money on emptiness" (research principle 4). Section vertical padding: 96-128px desktop (legacy already uses `py-20` to `py-32`, i.e. 80-128px — keep the upper end as the default, not the lower). One primary idea per section/screen. Content max-width: 1100-1200px for marketing pages (slightly tighter than the legacy `max-w-6xl`), 720-760px for long-form reading (blog, case study body) — within the legacy's existing `max-w-4xl` range, kept.

A faint structural grid (research principle: visible-but-quiet grid lines or dot grid at 10-15% opacity) may be used as a background texture instead of blur orbs — it reads as "engineered system" rather than decoration, and is more consistent with an engineering-company brand than a soft gradient blob.

## 4. Motion

**[Research-derived, directly corrects a legacy pattern]** Legacy: GSAP `ScrollTrigger` fade-in on nearly every section of every page, regardless of whether the content benefits from it (`ARCHIVED_PROJECT_ANALYSIS.md` §5 Animations, §17 lists this as pervasive). Research principle 5: motion should explain a mechanism, never decorate.

Rules for v2:
- Section-entry fade/slide-up is allowed but **brief** (200-400ms, ease-out, 8-16px of travel — not the legacy's `y:50` long-throw fades) and used to support reading order, not as a standard "make it feel alive" wrapper on literally everything.
- Motion with an actual informational job (a case-study metric counting up once, a filter transition on the Work grid, a form field validating) is encouraged — it clarifies state.
- No autoplay decorative loops, no parallax for its own sake, no scroll-jacking.
- Reduced-motion: `prefers-reduced-motion` is respected everywhere motion is used — **[Objective practice/accessibility]**, not addressed at all in the legacy implementation.
- Library choice: Framer Motion (already used, fine for React-idiomatic entry/exit and shared layout animations) for UI-level motion; GSAP/ScrollTrigger is no longer the default for "fade in on scroll" on every page — reserve it for the rare case that needs genuinely complex scroll choreography (if any), to avoid shipping two animation libraries' weight for the same basic job everywhere.

## 5. Components (design-system inventory)

Directly answers the legacy "Should Become Shared UI" list (`ARCHIVED_PROJECT_ANALYSIS.md` §15), now formalized as the actual v2 component library rather than an aspiration:

| Component | Replaces (legacy ad hoc pattern) | Notes |
|---|---|---|
| `HeroSection` | Copy-pasted hero markup across 6+ pages | Single source of truth for hero layout/typography |
| `GlassCard` | `bg-white/5 border border-white/10 backdrop-blur-lg` repeated inline | Used sparingly — glassmorphism is a legacy signature worth keeping in moderation, not banning |
| `GradientButton` | 4+ inline instances of the brand gradient | The one place the gradient token is "supposed" to appear (research principle 9) |
| `SectionGrid` | Inconsistent grid breakpoints per page | Standard responsive grid for card layouts (case studies, team, services) |
| `StatusBadge` / `TagPill` | Category pills on blog, project tags on portfolio | One pill component, consistent styling |
| `FormField` | Inconsistent input styling between company contact form and portfolio contact form | Single accessible form-field primitive (label, error state, focus ring) used everywhere a form exists |

## 6. Accessibility baseline

**[Objective practice]** — not addressed in the legacy analysis at all, which is itself a finding. v2 baseline: WCAG 2.1 AA contrast on all text/background pairs (verify the OKLCH token values meet this, especially `--text-muted` on `--bg`), visible focus states on every interactive element (legacy relies on default/inconsistent focus rings), all images have meaningful `alt` text (legacy analysis flags this as an open audit item, §16/§17), all icon-only buttons have `aria-label`, forms have proper label association and error announcement, `prefers-reduced-motion` respected (§4 above), and color is never the only signal of state (e.g. form errors get an icon/text, not just a red border).

## 7. What is deliberately not in the v2 design system

Per research principle 10 (what's conspicuously absent on premium sites): no stock photography, no abstract hero illustrations (people/rockets/puzzle pieces), no carousels (the legacy testimonial carousel is removed along with its content, `06_PAGE_SPECIFICATIONS.md` Home), no autoplay background video, no icon-grid-with-vague-claims pattern ("Fast," "Secure," "Easy" unaccompanied by proof), no countdown/urgency banners, no trust-badge wall.

## 8. Editorial consistency and the Uniqueness Test **[New, 2026-07-04]**

`15_HOMEPAGE_DESIGN.md` §12 defined a per-beat gate for the homepage — "could this beat appear on another agency's website simply by replacing the logo?" — and the commissioned design review (`docs/design-reviews/MARKETING_SITE_REVIEW_V1.md`, 2026-07-04) confirmed the homepage passes it convincingly. That same review found Services, Software, and Hardware — three pages built after the homepage — never had the test applied to them, and collapsed into "three fills of one template" as a direct result (identical caption → clamp H1 → subhead → mono facts → numbered-prose-over-texture → pull-quote → CTA-close shape, in the same order, every time).

**This document generalizes `15` §12's test from a homepage-only tool into a standing requirement for any new marketing page**, effective immediately for the Builds, Labs, and Blueprints pages specified in `06_PAGE_SPECIFICATIONS.md`:

- Before a new marketing page is considered done, ask: could this page's macro-composition appear on another agency's site by swapping the logo? If yes, it hasn't passed, regardless of how well-executed the individual components are.
- Apply the test **per page**, not once at the end of a batch — the Services/Software/Hardware failure happened because the test was only ever run against the homepage in isolation.
- A shared *component* (e.g. a filterable content-index primitive reused across Work/Builds/Labs/Blueprints) is correct engineering and does not fail this test on its own. A shared *composition* — the same macro-structure, image placement, and beat order reused across multiple pages — does fail it, even if every individual component is well-built.
- The homepage is the execution bar new pages are measured against, not Services/Software/Hardware — "homepage strongest" (per the same design review) should be read as the standard the rest of the site is still catching up to, not a compliment to file away.

**Component vocabulary for the new pillars:** Builds, Labs, and Blueprints detail pages (`/builds/[slug]`, `/labs/[slug]`, `/blueprints/[slug]`) are evidence pages, the same role a case study plays — they follow the `15`-style editorial override (no `GlassCard`/`GradientButton`/card-grid `SectionGrid`), not §5's base utility vocabulary. Index pages (`/builds`, `/labs`, `/blueprints`) may use a lighter utility treatment for filter controls and list layout, matching how `/work`'s index already combines a real filter UI with an editorial (non-card-grid) row presentation — filter chips and empty states are utility; the content rows themselves are editorial.
