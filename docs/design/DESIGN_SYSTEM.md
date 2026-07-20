# HubZero Design System
### Canonical specification — v1

This document is the source of truth for HubZero's product design language. It describes the system behind the site, not the pages themselves. Any future page, feature, or redesign should be built by applying these rules — not by copying existing screens.

---

## 1. Design Philosophy

**What this is.** A design language for a website that behaves like the flagship software product of an engineering studio. Every page is treated as a surface inside one continuous application, not a stack of marketing sections.

**What this is not.** Not a portfolio template. Not an agency showcase. Not a brochure with a hero, features, testimonials, and a footer. Not a demonstration of visual tricks. Not a blueprint/circuit/engineering-diagram metaphor site — that direction was explicitly rejected.

**Product-first principles.**
- The site is used, not read.
- Every screen should feel like it belongs inside a premium desktop application.
- Craft is distributed across hundreds of small decisions, not concentrated in one hero moment.
- Visual identity comes from typography, spacing, and interaction quality — never from decoration.

**Experience goals.**
- A first-time visitor should think "these people build exceptional products" before reading a single word.
- Every page should have at least one moment of unusual craft that makes a visitor pause.
- The system should get stronger as content scales (50+ case studies, dozens of team members, articles, tools) — never weaker or more repetitive.

**Emotional qualities to design toward:** premium, calm, confident, engineered, fast, precise, quietly delightful.

**Emotional qualities to design away from:** flashy, loud, gimmicky, experimental-for-its-own-sake, corporate-safe, sterile.

**Intentionally avoid:**
- Bento grids, glassmorphism, glowing gradient backgrounds, animated blobs, particle fields.
- Giant floating device mockups, stock hero videos, agency-cliché imagery.
- Blueprint lines, circuit traces, exploded diagrams, or any literal "engineering" iconography as decoration.
- Cursor-replacement effects, spotlight-follow reveals, parallax-for-its-own-sake.
- Any interaction that exists only because it's clever — every interaction must help a visitor understand, explore, or start working with HubZero.
- Scroll-triggered entrance animations that play once and never respond to the user again.

---

## 2. Visual Identity

**Monochrome philosophy.** The base palette is entirely black, white, and a scale of near-black grays. Monochrome is not a limitation — it is what makes the one accent color meaningful. Hierarchy is built through value (light/dark) and spacing, not hue.

**Accent color usage — where amber is allowed.** Amber (`#e8ab5c`) is a *functional signal*, not a brand color. Use it only for:
- Live/active state indicators (a currently selected filter, an active nav item's accent glyph, an "in progress" status).
- One editorial emphasis word per section, max, inside serif display type.
- Focus rings and primary interactive affordances that need to stand out from monochrome chrome (e.g. the search/palette hint).

**Where amber is forbidden.** Never as a background fill for large areas. Never as decoration (borders "just because," icon fills, gradients). Never repeated more than once in the same viewport for emphasis — if everything is accented, nothing is. Never used for both a positive and a neutral meaning in the same context (don't overload it).

**Status green** (`#4ade80`) is reserved exclusively for "system nominal / success / submitted" states — never decorative, never interchangeable with amber.

**Border language.** Borders are `1px solid` and always one step lighter than the surface they contain (e.g. `#262626` on `#141414`). Borders define edges of surfaces, not decoration — never use a border as a stylistic accent (no colored borders, no left-border accent bars).

**Surface hierarchy** (darkest to lightest):
1. Base canvas — `#0d0d0d`
2. Card / panel surface — `#141414`
3. Elevated / hovered surface — `#1a1a1a`–`#1c1c1c`
4. Overlay / modal surface — `#141414` with a stronger shadow, floating above a scrim

Each step up the hierarchy is reached by exactly one of: a lighter fill, a border, or a shadow — never all three at once (avoid over-decorating elevation).

**Elevation philosophy.** Elevation is felt through shadow softness and offset, not through scale. A resting card has no shadow. A hovered card gets a soft, wide, dark shadow (`0 24–30px 48–60px -24 to -28px rgba(0,0,0,.6-.7)`) suggesting it has lifted a few millimeters — never a hard drop shadow.

**Spacing philosophy.** Generous, consistent, confident. Section padding is large (80–140px vertical on desktop) so every major section reads as roughly one viewport. Internal component spacing follows an 4/8px-multiple scale (8, 12, 16, 20, 24, 32, 40, 56, 80...). Never crowd type against a border — minimum 20px internal card padding.

**Corner radius system.** Small controls (chips, tags, badges, pill nav): fully rounded (`100px` / pill). Buttons and inputs: `6px`. Cards and panels: `8px`. Large modals/overlays: `10–12px`. Avatars/portraits: soft rounded rectangle (`10px`) by default, never a hard circle unless the context is a small compact roster thumbnail.

**Shadows.** Reserved for elevation changes only (hover, modal, palette). Always soft, always dark, always large-radius/low-opacity. Never used decoratively on static elements.

**Opacity usage.** Used for state, not style: disabled ≈ 0.4, muted secondary text via gray value (not opacity on white), scrim overlays 60–70% black. Avoid translucent color fills as a stylistic device except the amber "active chip" background tint (`rgba(232,171,92,.1)`), which signals selection, not decoration.

---

## 3. Typography

**Font stack.**
- Display / editorial: **Instrument Serif**, italic — used sparingly, for moments that need warmth or emphasis.
- Interface: **Instrument Sans** — the workhorse for all UI text, headings that aren't editorial, buttons, labels.
- Metadata / data / system: **IBM Plex Mono** — timestamps, categories, tags, status labels, counters.

**Display typography.** Large headlines mix Instrument Sans (weight 600) for the structural words with Instrument Serif italic for the one phrase that should feel human/considered. Never set an entire headline in serif italic — it should always be an accent within a sans-led sentence.

**UI typography.** Instrument Sans at 13–17px for body/interface text, 400–600 weight. Never below 13px for interface text; never below 14px for body copy a visitor is meant to read closely.

**Monospace usage.** IBM Plex Mono is the "system voice" — always uppercase or a fixed-format string (e.g. `01`, `LIVE`, `SOFTWARE`), always small (10–13px), always a secondary/tertiary color (`#555`–`#888`), letter-spaced for category labels (`0.05–0.1em`). Never used for primary reading content.

**Hierarchy.** Five roles, consistently applied: eyebrow/label (mono, 11–12px) → headline (serif italic or sans 600, 32–84px depending on context) → subhead/lede (sans, 15–19px, gray) → body (sans, 14–16px) → metadata (mono, 10–12px).

**Weights.** Sans: 400 (body), 500 (secondary emphasis), 600 (headlines, primary buttons). Never use 700+ — the system's confidence comes from scale and spacing, not boldness. Mono: 400 default, 500 for emphasized state labels only.

**Line heights.** Display: 1.0–1.05 (tight, confident). Body/lede: 1.6–1.75 (generous, easy reading). Mono/labels: 1 (single line, no wrap intended).

**Letter spacing / rhythm.** Mono labels always carry slight positive tracking (0.05–0.1em) to read as "system labels" rather than prose. Sans and serif use default tracking — never artificially tightened for a "modern" look.

**Editorial moments.** Reserve serif italic for: hero closing phrase, section headline lead-ins ("What we build", "Things we've shipped"), and single-word emphasis inside a sentence. If more than ~30% of a page's headline text is serif italic, pull back — it should feel occasional, not default.

**Capitalization rules.** Mono metadata labels: ALL CAPS. Sans headlines/buttons: sentence case, never Title Case, never all caps (except tiny mono labels). Never use all-caps sans for anything a user reads as a sentence.

---

## 4. Layout System

**Containers.** Max content width `1300px` (marketing/content pages), centered, with responsive side padding of `48px` desktop / `20–24px` mobile. Modals/overlays cap narrower (`880px` for inspectors, `560px` for the command palette, `900px` for forms).

**Grid.** CSS Grid with `auto-fit`/`minmax()` for card collections (`minmax(280–320px, 1fr)`) so grids reflow naturally from 1 to N columns without breakpoint-specific rules. Fixed two-column layouts (e.g. About's portrait + detail) collapse to a single column under ~900px.

**Spacing scale.** `4, 8, 12, 16, 20, 24, 32, 40, 56, 80, 120, 140` — pick from this scale; don't invent arbitrary values.

**Viewport rhythm.** Each major section targets roughly one full viewport of breathing room (not necessarily 100vh exactly, but visually "a chapter"). Sections are separated by a single hairline border (`1px solid #1c1c1c`), never by a background color change, never by a hard shadow.

**Section spacing.** 80px vertical padding for standard sections, 120–140px for a page's opening hero and closing sections.

**Responsive behavior.** Design mobile as a first-class narrow viewport of the same system — not a simplified version. Floating nav remains floating and pill-shaped, but collapses secondary labels before it ever becomes a hamburger menu. Grids collapse to single column. Type scales down via `clamp()`, never via fixed breakpoint jumps that feel discontinuous.

**Page composition.** Never default to hero → content → CTA → footer as a rote pattern. Vary section rhythm per page: mix full-width statements, dense multi-column data, and single-focus moments (like the About stage) so scrolling continues to reveal new *kinds* of content, not just more of the same shape.

---

## 5. Navigation

**Floating nav.** A single pill-shaped bar, fixed to the top-center of the viewport at all times, on every page, at every scroll position. It never expands, never hides, never becomes a hamburger on desktop or mobile.

**Logo usage.** The real HubZero mark (not initials, not a redrawn substitute) anchors the left edge of the nav pill. It is always a link to Home. Height ~16px inside the pill — small, quiet, never a hero-sized lockup in the chrome.

**Wordmark.** If a wordmark lockup is needed outside the compact nav (e.g. footer, a splash/loading state), use the official mark + wordmark combination — never typeset the name manually in a different typeface.

**Hover behavior.** Nav items get a subtle background fill (`#1c1c1c`) and brighten to full white text on hover — no underline, no color shift to accent (accent is reserved for *state*, not hover).

**Active states.** The current page's nav button carries a persistent light fill and full-white text, distinguishing "where you are" from "what you can hover." Never rely on color alone — the fill difference must be visible in grayscale.

**Scroll behavior.** The nav never hides on scroll and never changes size/opacity based on scroll position. Constant availability is the point — it should be as reliable as a desktop app's title bar.

**Search button (⌘K entry point).** A quiet, always-visible icon-only button inside the nav — never a hidden or undiscoverable shortcut. At rest it shows only the search glyph (`aria-label="Search HubZero"` carries the accessible name); hover/focus reveals the `⌘K` glyph inline within the same control before committing to the click, so the shortcut stays discoverable without the nav carrying three simultaneous signals (icon, label, and badge) at all times. The visible affordance is mandatory; the keyboard shortcut is an accelerant for returning/power users, not the only way in.

**⌘K palette.** Opens as a centered modal over a blurred scrim. Behavior contract:
- Autofocused text input, fuzzy-matches pages, projects, and team members by name/category.
- Arrow keys move selection, Enter commits, Escape or scrim-click dismisses.
- Every result must resolve to something a first-time visitor would want: a real page, a real project, a real person — never an easter egg or a joke result.
- Must be reachable without knowing the shortcut exists (via the visible button).

**Mobile navigation.** The same pill persists at the same fixed position; labels may shrink to icons/short labels before anything is hidden behind a menu. No off-canvas drawers, no hamburger icon — the requirement is zero hidden interactions and zero discoverability puzzles, on every viewport.

**Accessibility.** Every nav control is a real `<button>`/`<a>`, reachable by Tab, with a visible custom focus ring (never the browser default, never removed).

---

## 6. Motion Language

**Motion philosophy.** Motion exists to explain state changes, confirm input, and preserve spatial orientation — never to perform. If removing an animation would not hurt comprehension or feedback, remove it. The test for every animation: "does this feel like operating software, or watching one?"

**Timing.** Two speed bands only:
- **Fast / responsive** (120–250ms) — anything that responds directly to a user action: hover, press, focus, toggle. Should feel instantaneous, not "animated."
- **Considered** (300–500ms) — state/view changes: view transitions, modal open/close, card lift on hover. Long enough to read as intentional, never so long it feels sluggish.

Nothing on the site should animate longer than ~500ms outside of an explicit, rare "chapter" moment.

**Easing.** Default: `cubic-bezier(.2,.8,.2,1)` — a confident decelerate, fast-out/slow-in. Press/active states use a simpler linear-ish snap (`scale(.96–.97)` over ~100–120ms) so the physical "click" reads immediately. Never use bouncy/elastic/spring-overshoot easing — it reads as playful, not precise.

**Hover motion.** Cards lift 4–6px with a soft shadow bloom (never scale up — scaling a card reads as a UI trick, lifting reads as physical weight). Buttons brighten and depress slightly on press. Hover should also be an information act: revealing a secondary metadata row (role, timeline, stack) is preferred over motion-only hover.

**Scroll motion.** Default scroll is native and fast — never hijacked, never artificially smoothed to feel "cinematic." Reserve direct scroll-linked (scrubbed) motion for at most 1–2 moments per page, and only where it's reversible and 1:1 with scroll position (like a video scrubber) — never a one-shot entrance animation.

**Page/view transitions.** Switching views is a single fade + 10px vertical settle (~500ms), applied to the new view only — the persistent nav never re-animates. Opening a project or a person's profile should feel like expanding in place (an inspector/overlay), preserving the visitor's scroll position and mental context rather than a hard navigation.

**Image loading.** Placeholders (image-slot components) show a clear, calm empty state — never a spinner-only blank. When a real image lands, it should simply appear crisply; avoid blur-up or zoom-in reveal gimmicks.

**Card motion.** See hover motion. Cards never rotate, tilt in 3D, or float independently of cursor/scroll input — motion must be a direct response to a real interaction, not ambient decoration.

**Button motion.** Press = `scale(.96–.97)` at 100–120ms. Primary buttons may brighten slightly (`filter: brightness(1.08)`) on hover; secondary/outline buttons darken their fill slightly on hover. No color hue shifts on interactive elements.

**Focus motion.** Focus rings appear instantly (no transition-in) but the ring style itself (color, offset, radius) is consistent everywhere — instant appearance signals "this is state, not animation."

**Loading states.** Prefer real, honest placeholders (skeleton blocks matching final layout, or the image-slot empty state) over spinners. If a spinner is unavoidable (e.g. a network wait), use a simple rotating ring, never a pulsing brand mark.

**Exit transitions.** Modals/overlays fade + scale from 0.98→1 on enter; on exit, reverse the same motion at the fast band (~200ms) — exits should feel quicker than entrances.

**Reduced motion.** Respect `prefers-reduced-motion`: disable scroll-scrubbing and card-lift transforms, keep only opacity-based fades at reduced duration. Nothing on the site should depend on motion to be understood — motion is always additive to a state that's also communicated by color/text/position.

---

## 7. Components

For each: purpose, visual behavior, and interaction states.

### Buttons
- **Purpose:** primary/secondary actions (navigate, submit, open).
- **Visual:** Primary = solid white fill, black text, `6px` radius, `600` weight. Secondary = transparent fill, `1px` neutral border, white text.
- **Hover:** primary brightens (`brightness(1.08)`) with a slightly deeper shadow; secondary fills with a faint elevated gray (`#161616`) and lightens its border.
- **Focus:** visible amber focus ring, offset 2–3px.
- **Pressed:** `scale(.97)`, 120ms.
- **Disabled:** 40% opacity, no hover/press response, `cursor:not-allowed`.
- **Loading:** label swaps to a short in-place status (e.g. "Sending…") rather than replacing the button with a spinner-only state.
- **Accessibility:** real `<button>`, minimum 44px tap height on touch.

### Cards (project / capability / generic)
- **Purpose:** contain a discrete, clickable unit of content.
- **Visual:** `#141414` surface, `1px #262626` border, `8px` radius.
- **Hover:** lift 4–6px, border lightens to `#3a3a3a`, shadow blooms, secondary metadata row fades/slides in (`opacity 0→1`, `translateY(6px→0)`).
- **Focus (keyboard):** same lift treatment triggered on focus-visible, plus the standard focus ring.
- **Pressed:** slight `scale(.98)` if the whole card is a click target.
- **Loading/empty:** image-slot placeholder with a clear instruction caption, never a blank gray box with no label.

### Inputs & Textareas
- **Purpose:** short and long-form text entry.
- **Visual:** `#141414` fill, `1px #2a2a2a` border, `4px` radius, sans font.
- **Hover:** no change (inputs shouldn't invite hover, only focus).
- **Focus:** border shifts to amber, fill lightens marginally — the only place amber appears as a border.
- **Disabled:** 40% opacity, no focus ring.
- **Error state (future):** border shifts to a clearly distinct warm-red, never amber (amber is reserved for neutral/active, not error).

### Navigation (pill)
See Section 5 in full. Component-level summary: persistent, pill-shaped, logo + page links + search entry, active/hover states via fill only.

### Command Palette
- **Purpose:** universal search/jump across pages, projects, people.
- **Visual:** centered modal, blurred scrim, `#141414` surface, `10px` radius.
- **States:** empty query shows all destinations; typing filters live; keyboard selection highlighted with `#1c1c1c` row fill; "no results" gets an explicit, calm empty-state row (never a blank list).
- **Accessibility:** trap focus in the input, Escape always closes, results are reachable by arrow keys without a mouse.

### Filters (chips)
- **Purpose:** narrow a collection (e.g. Work by category).
- **Visual:** pill shape, mono label, neutral border/gray text at rest.
- **Active:** amber border + faint amber tint fill + amber text — this is one of the few places amber fills anything, because it communicates "this is currently applied," a functional state.
- **Hover:** background lightens slightly; **pressed:** `scale(.95)`.

### Tags / Badges (tech stack, expertise)
- **Purpose:** compact metadata labels, non-interactive by default.
- **Visual:** mono, small, `#1a1a1a` fill, `1px #2a2a2a` border, full pill radius, muted text (`#999`–`#ccc`).
- Never colored per-category (no rainbow tag systems) — differentiation comes from the label text and grouping, not hue.

### Status Indicators
- **Purpose:** communicate live/system state (e.g. "system nominal," submission progress).
- **Visual:** small filled dot (6–9px) + mono label. Green = success/nominal only. Amber = in-progress/active only. Gray = pending/inactive.
- Never animate a status dot with a persistent pulse/glow — state is communicated by color and label, not motion.

### Project Cards → Inspector Panel
- **Purpose:** browse then examine work without losing place.
- **Behavior:** clicking a project card opens an in-place overlay (not a page navigation) showing full image, category, timeline, role, stack, and a CTA. Closing (✕, Escape, or scrim click) returns exactly to prior scroll position.
- **Visual:** large image at top, generous padding below, metadata in a 3-column grid (role / timeline / stack).

### Team Roster (About "stage")
- **Purpose:** meet the team as individuals, not a grid of business cards.
- **Behavior:** one person "on stage" at a time (large portrait + full profile: role, blurb, current focus, recently shipped, expertise tags); a compact list of names beside/below lets any visitor jump straight to another person. Hover or focus on a name updates the stage.
- **Visual:** roster rows use text-color + row-fill to show active/inactive — never a photo thumbnail grid.

### Footer
- **Purpose:** quiet close to every page — copyright + capability summary.
- **Visual:** single hairline top border, small mono text, muted gray, no navigation duplication, no social icon rows unless real accounts exist.

### Forms
- **Purpose:** primarily the Contact intake.
- **Behavior:** plain labeled fields (name/email/message), single primary submit button. On submit, replace the form with a calm confirmation message plus a simple, honest 3-step status list (sent → reviewing → reply window) — status communicates confidence, not gamification. No fake progress bars, no multi-screen wizards for a single-purpose form.

### Empty States
- Always a clear label + implied next action (e.g. image-slot's "Drop a project image," palette's "No matches"). Never a bare blank area.

### Loading States / Skeletons
- Match the final layout's shape and spacing exactly (no generic centered spinner replacing a whole section). Use muted fills (`#1a1a1a`) with no shimmer/gradient animation unless reduced-motion is off and it's subtle.

### Dialogs / Modals / Inspector Panels
- Always scrim + centered surface, always closable three ways (explicit close control, Escape, scrim click), always trap and restore focus, always preserve the underlying page's scroll position on close.

---

## 8. Interaction Language

**How the website behaves, not how it looks.**

- **Hover philosophy.** A hover should always either (a) provide new information (metadata reveal on a card) or (b) confirm interactivity (button/chip feedback). A hover that only moves or glows without adding information is decoration and should be removed.

- **Keyboard-first interactions.** Every primary action must be reachable and completable via keyboard alone: Tab through nav and cards, Enter to activate, Escape to dismiss overlays, arrow keys inside the palette and roster. Keyboard support is a first-class design requirement, not an accessibility afterthought bolted on later.

- **Focus management.** Opening any overlay (palette, inspector) moves focus into it and restores focus to the triggering element on close. Focus should never be "lost" to the document body.

- **Cursor philosophy.** The system pointer is never replaced or hidden. Precision and native OS behavior are part of "feeling like real software" — a custom cursor undermines that.

- **Selection behavior.** Text selection is never disabled except inside genuinely non-text interactive controls (e.g. draggable elements, if introduced later). Selection highlight uses the system's dark/light contrast (`background:#fff; color:#000`), matching the monochrome language.

- **Scroll philosophy.** Native, fast, momentum-preserving scroll everywhere. The only scroll-linked motion allowed is the sparing, reversible "scrubbed" moments described in Motion — never a full-page scroll-jacking experience.

- **State transitions.** Every state change (view switch, filter applied, project opened, form submitted) must have a single, clear, immediate visual acknowledgment — color, position, or label change — occurring within the "fast" motion band so it never feels laggy.

- **Micro-interactions & feedback.** Every actionable element responds to press (scale down), hover (fill/lift), and focus (ring) — no exceptions. If a component can be clicked, it must visibly acknowledge press.

- **Direct manipulation.** Wherever a metaphor exists (dragging, scrubbing, filtering), it should behave exactly like the real-world/software analog it borrows from — a filter chip toggles instantly like a checkbox, a scrubbed scroll section moves exactly with scroll delta, not with added lag or overshoot.

- **How it should feel, summarized:** immediate, precise, quietly responsive, never showing off. A visitor should finish a session remembering *how something behaved* (the palette, the roster stage, the inspector overlay) rather than *what color it was.*

---

## 9. Color Tokens

Semantic tokens — implementation should reference these names, not raw hex values, wherever the design system is ported to code.

| Token | Intent | Reference value |
|---|---|---|
| `color.bg.base` | The canvas every page sits on | `#0d0d0d` |
| `color.surface.default` | Card/panel resting surface | `#141414` |
| `color.surface.elevated` | Hovered/active surface, subtle lift | `#1a1a1a`–`#1c1c1c` |
| `color.surface.overlay` | Modal/inspector/palette surface | `#141414` (+ heavier shadow) |
| `color.border.default` | Standard hairline between surfaces | `#262626` |
| `color.border.muted` | Section separators, ticks | `#1c1c1c` |
| `color.border.strong` | Hover-state border, active input | `#3a3a3a` |
| `color.text.primary` | Headlines, primary reading text | `#ffffff` |
| `color.text.secondary` | Body copy, descriptions | `#999999`–`#cccccc` |
| `color.text.muted` | Metadata, mono labels, timestamps | `#555555`–`#666666` |
| `color.text.disabled` | Disabled control text | `#999999 @ 40% opacity` |
| `color.interactive.accent` | Functional signal — live/active/selected state only | `#e8ab5c` |
| `color.interactive.accentSubtle` | Active-chip tint background | `rgba(232,171,92,.1)` |
| `color.focus.ring` | Keyboard focus indicator, always visible | `#e8ab5c` |
| `color.status.success` | Confirmed/nominal/submitted state | `#4ade80` |
| `color.status.warning` (reserved) | Future error/warning state — must NOT reuse accent | a distinct warm red, TBD on introduction |

**Intent rule:** any new token must declare *when it is and isn't allowed* before it is used — color tokens in this system are permission slips, not a palette to sample freely from.

---

## 10. Iconography

- HubZero currently uses almost no decorative icons — the system favors typographic and mono-label communication over glyphs. Introduce icons only when a word genuinely cannot do the job faster (e.g. a close ✕, a status dot).
- **Stroke weight:** if line icons are introduced, 1.5px at 24px base size, matching the precision of the typography.
- **Sizing:** 16px (inline with mono labels), 20–24px (standalone controls like close buttons).
- **Usage:** functional only — navigation, state, close/dismiss. Never illustrative or decorative filler.
- **Animation:** icons may fade/rotate to reflect real state (e.g. a chevron rotating on expand) but never spin/pulse ambiently.
- **When not to use icons:** any place a short mono label communicates the same thing as clearly — prefer the label.

---

## 11. Photography

- **Team portraits:** consistent lighting and background treatment across every person — same neutral backdrop tone, same crop ratio, same color grade (subtle desaturation toward the monochrome system is acceptable; full grayscale is not required but should feel "at home" against the black canvas). Portraits are the one place a genuine photographic warmth is allowed.
- **Screenshots / product imagery:** real product/work imagery only — never fabricated UI or invented client logos. Where real imagery doesn't yet exist, use the image-slot placeholder system with an honest, instructive caption rather than a fake stand-in graphic.
- **Background removal / lighting:** when unifying disparate source photos (different rooms, lighting, occasions), normalize backdrop tone and relight subjects toward a single soft, neutral key light — avoid harsh mixed color temperatures sitting side by side in the same roster.
- **Cropping:** consistent aspect ratio and headroom across all portraits in a given context (roster thumbnail vs. large stage portrait are two distinct, fixed ratios — never vary per-person).
- **Consistency over perfection:** a slightly imperfect but uniform treatment beats individually-retouched, inconsistent photos.

---

## 12. Accessibility

- **Keyboard:** every interactive element reachable via Tab in a logical order; all overlays fully operable without a mouse (open, navigate, close).
- **Contrast:** body text maintains at least 4.5:1 against its background; mono metadata labels (often lower contrast by design) stay above 3:1 minimum and are never the sole carrier of essential information.
- **Focus:** always visible, always custom-styled (amber ring), never suppressed via `outline:none` without a replacement.
- **Reduced motion:** honor `prefers-reduced-motion` — strip transform-based motion, keep short opacity fades only.
- **Screen readers:** meaningful `alt` text on all real imagery; icon-only controls (close ✕, search) carry `aria-label`s; live-updating regions (form status, palette results) use polite live-region semantics.
- **Touch targets:** minimum 44×44px for any tappable control on touch viewports, including chips and roster rows.
- **Responsive behavior:** every interaction pattern (palette, inspector, roster stage) has a defined, equally-complete mobile behavior — never "desktop-only" functionality.

---

## 13. Voice

- **Tone:** direct, confident, unembellished. Short sentences. No marketing adjectives ("revolutionary," "cutting-edge," "seamless"). The team's competence should be implied by precision of language, not asserted by superlatives.
- **Labels:** plain nouns/verbs — "Work," "About," "Contact," "Send message" — never cute or clever relabeling of standard actions.
- **Buttons:** verb-first, specific ("Start a project," "See what we've built") rather than generic ("Learn more," "Click here").
- **Errors (future):** state the problem and the fix plainly ("Enter a valid email to continue") — never blame the user, never use humor.
- **Success:** calm confirmation, personalized where possible ("Thanks, {name} — we've got it"), always states the next concrete step and timeframe.
- **Forms:** every field labeled in plain language; no jargon-only internal terms (avoid engineering-insider metaphors like CI/CD pipeline language in user-facing copy).
- **Navigation:** labels describe destinations, never actions disguised as nouns.
- **Empty states:** instructive, never apologetic ("Drop a project image" not "Oops, nothing here yet!").

---

## 14. Implementation Notes

**Preferred stack:** Next.js, React, TypeScript, Tailwind CSS (or an equivalent utility/token-driven styling approach), Framer Motion for the motion layer described in Section 6.

**Implementation priorities, in order:**
1. Get the type system and spacing scale exactly right first — most of this system's "premium" feeling is typographic and spatial, and is cheap to get right early.
2. Build the persistent navigation + command palette as shared, global chrome before building individual pages — every page depends on it existing correctly.
3. Implement motion timing/easing as shared tokens/utilities (not per-component magic numbers) so every future component inherits the same feel automatically.
4. Build components (buttons, cards, inputs, tags, status) as a small shared library before building page-specific layouts — pages should compose from this library, not invent one-off styles.
5. Only after the above is solid, build out page-specific content and scale up collections (more projects, more team members, more content types).

**What must never be compromised:**
- The floating, always-visible, non-hiding navigation.
- Amber's restriction to functional/state use only.
- Motion durations staying inside the fast/considered bands defined in Section 6.
- Full keyboard operability of the palette, inspector, and roster.
- No fabricated client work, testimonials, or metrics — ever.

---

## 15. Design Principles

Immutable rules for every future contributor and every future page.

1. Interaction is never decoration.
2. Motion explains state — if it doesn't, remove it.
3. Whitespace creates confidence; when in doubt, add more of it.
4. Typography carries hierarchy; color is a signal, not a hierarchy tool.
5. Every hover must reveal value (information or clear feedback), not just movement.
6. Users should operate the website, not watch it.
7. Amber means "this is live, active, or selected" — nothing else, ever.
8. One accent color, applied rarely, is stronger than many colors applied often.
9. The navigation is chrome, not content — it must never compete for attention.
10. No hidden interactions, no discoverability puzzles, on any device.
11. Every actionable element must visibly acknowledge hover, focus, and press.
12. Keyboard support is designed in, not retrofitted.
13. Overlays preserve context — closing one must return the visitor exactly where they were.
14. Real content only — never invent client work, metrics, or testimonials.
15. Placeholders are honest and instructive, never decorative filler.
16. A component must survive being viewed completely in isolation.
17. Consistency beats novelty — a new page reuses the system's components before inventing new ones.
18. If a pattern will repeat 4+ times, it becomes a documented component, not a one-off.
19. Scale must strengthen the system — 50 case studies should look more impressive than 5, using the same components.
20. Nothing animates longer than ~500ms outside a rare, deliberate exception.
21. Reduced-motion users get the same information, delivered without motion.
22. Every empty/loading state is designed as carefully as its populated counterpart.
23. Mono type is for system/metadata voice only — never for prose a visitor is meant to read closely.
24. Serif italic is an occasional editorial accent, never a default typeface.
25. Borders define edges; they are never a stylistic flourish.
26. Cards lift on hover; they never scale, rotate, or tilt in 3D.
27. The system pointer is sacred — never replaced, never hidden.
28. Every form communicates its next step and timeframe, plainly, without gamification.
29. If an interaction exists only because it's clever, delete it.
30. When extending this system, resolve ambiguity by asking: "does this help someone understand, explore, or start working with HubZero?" If the honest answer is no, don't build it.
