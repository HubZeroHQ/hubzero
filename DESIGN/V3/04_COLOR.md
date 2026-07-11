# 04 — Color

> Assumes `01_VISION.md` and `00_EXPLORATION.md`'s Working Blueprint recommendation. Values below are directional (approximate OKLCH lightness/chroma/hue targets), not final hex tokens — final calibration against real screens and WCAG contrast testing is implementation work for `10_IMPLEMENTATION_ROADMAP.md`, one level below what a system-level document should lock in, exactly as `ARCHITECTURE/07_DESIGN_SYSTEM.md` specified ranges rather than final values for v2.

## 1. Reviewing the existing palette

The current system (`src/app/globals.css`) is a genuinely well-built OKLCH dark-first token system: five neutral tokens (background/surface/border/text/muted-text), one semantic accent, four status colors, and one named gradient, with a working light-mode toggle. The engineering underneath — OKLCH for perceptually-even lightness steps, a single accent used consistently, a disciplined token-based approach rather than hardcoded hex scattered through components — is sound and is kept in full. **What's being replaced is not the system's architecture; it's the specific hue sitting inside it.**

**What stays:**

- The OKLCH token architecture itself (perceptually uniform lightness scale, dark-first with a real light-mode override set).
- Five-token neutral base (background / surface / border / text / muted-text).
- Exactly one signature interactive accent (the discipline, not the specific hue).
- One named gradient token, used at the same strict 1–2-places-per-page budget.
- The four semantic status colors (danger/warning/success/info) as a category — their specific hues are re-tuned to sit correctly against the new neutral base, not retired.

**What evolves:**

- The neutral base's hue lean — from a cool, digitally-neutral gray toward a warmer, material-grounded gray (graphite/solder-mask in dark mode, drafting-paper in light mode).
- The signature accent — from electric blue to oxidized copper (§3).
- The gradient — from blue→violet→gold to a much narrower, single-family copper gradient, or retirement of the gradient token entirely in favor of the single solid accent (§5).
- A new, second, narrowly-scoped color: drafting cyan, reserved exclusively for real technical diagrams (§4) — the one genuinely new addition to the palette's _shape_, not just its hue.

## 2. The neutral base: from digital-neutral to material-grounded

v2's base is `oklch(0.15 0.005 264)` (dark) / `oklch(0.96 0.005 264)` (light) — a near-zero-chroma gray with a faint, almost imperceptible blue lean (hue 264). It's a reasonable, safe choice with no particular meaning behind the specific hue.

Working Blueprint's base is grounded in two real materials instead:

- **Dark mode — "solder mask."** A near-black with a faint graphite-green lean (hue roughly in the 150–160° range at very low chroma, ~0.01–0.015) — the actual color family of a populated PCB's mask, not a neutral digital dark. Lightness steps follow the same perceptually-uniform OKLCH logic as v2 (background darkest, surface one step up, border/muted-text further up), just re-hued.
- **Light mode — "drafting paper."** A warm, faintly blue-gray off-white (hue roughly 240–250° at very low chroma, ~0.006–0.01) — closer to real diazo blueprint paper than to a stark digital white. Slightly warmer/lower-lightness than v2's `0.96` default, because true bright white reads as a UI surface where a slightly toned paper reads as a material.

Both leans are subtle — under 0.02 chroma — deliberately, because the base palette's job is to be quiet, legible, and long-wearing across thousands of future pages, not to carry brand personality on its own. Brand personality is the accent's job (§3), not the base's.

## 3. Accent usage: one signature color, derived from first principles

**The founder-level question this section answers directly: should HubZero have a signature accent color, multiple contextual accents, rely on typography/composition alone, or something else?**

**Answer: one signature accent color, used with the same total discipline v2 already had — not zero, and not several.** The reasoning, weighed against the alternatives considered in `00_EXPLORATION.md`:

- **Zero accent (Typographic Monolith)** was seriously considered and is the most theoretically "pure" answer to "avoid looking like a generic tech company," but it has a real, recurring operational cost: a CMS-driven site with non-designer contributors authoring Labs entries, Notes, and case studies for years to come benefits enormously from one cheap, reliable, unambiguous "this is interactive / this is active / this is the one path forward" signal. Removing it entirely trades a one-time design purity gain for a permanent tax on every future page. `01_VISION.md` §4 already commits to keeping "one signature accent, used with total discipline" as something that should never change — this section is where that commitment is honored.
- **Multiple contextual accents** (one hue per pillar — Work gets one color, Labs another, Blueprints a third) was considered and rejected. It would let each pillar develop a slightly different personality, but it directly contradicts the single strongest, most research-backed principle in HubZero's existing brand strategy (`ARCHITECTURE/02_BRAND_STRATEGY.md` §5, research principle 2: restraint is the tell of confidence) — a studio credibly claiming to be small, disciplined, and selective should not need four brand colors to organize four pillars that a heading and a URL already organize perfectly well. Differentiating pillars is `09_PAGE_ARCHETYPES.md`'s job, done through composition and register, not through a color-coded product line.
- **One signature accent — chosen not as a matter of taste, but as a first-principles derivation from what HubZero actually makes.** Electric blue was never derived from anything real; it was inherited from a 3D logo render. The replacement should be traceable to a real material, the way Working Blueprint's whole visual language is traceable to real artifacts (`02_VISUAL_LANGUAGE.md` §5).

**The chosen accent: oxidized copper.** A warm amber-orange (hue roughly 55–65° in OKLCH, moderate-high chroma, moderate-high lightness so it reads clearly against both the dark and light neutral bases) — the actual color family of exposed copper trace and heat-oxidized metal, the material literally inside every board HubZero's hardware practice builds, and a color with a real, physical relationship to "signal" (a live trace carries current) that extends cleanly as a metaphor into software (a live API call, an active data flow) and AI (an active inference) without straining. It is also, deliberately, warm rather than cool — the single most immediate, legible difference from the retired blue and from the large majority of software-industry competitors' default accent hues (see `00_EXPLORATION.md` §9's competitive survey — nearly every reference cited defaults to blue, purple, or black; almost none default to a warm signal color).

**Usage budget — unchanged discipline from v2, re-applied to the new hue:** the copper accent appears only for (a) the primary call-to-action, (b) active/focus/selected states, and (c) the brand mark. It never becomes a section background, a card fill, or a decorative wash. This is the same rule `ARCHITECTURE/07_DESIGN_SYSTEM.md` §2 already enforced for electric blue — the hue changes, the discipline is copied forward exactly.

## 4. Semantic and engineering colors — two families with two separate jobs

Working Blueprint introduces a second color, on top of the one interactive accent, and the distinction between their two jobs is the single most important color rule in this document:

- **Copper = "act here."** The interactive-signal family: CTAs, active states, focus rings, the brand mark. Warm, drawn from real trace/signal material.
- **Drafting cyan = "this is a real technical drawing."** A cool, desaturated cyan (hue roughly 200–210° in OKLCH, low-to-moderate chroma — deliberately more muted and paper-grounded than the retired electric blue, closer to real diazo blueprint chemistry than to a glowing screen color) reserved **exclusively** for linework inside actual schematics, CAD views, and system diagrams (`02_VISUAL_LANGUAGE.md` §9–11). It never appears on a button, a link, or any interactive element — its entire job is to mark "you are looking at a real technical drawing," and it can only do that job if it never means anything else.

This two-color system is more disciplined than it might first appear precisely because the two colors' jobs never overlap — a reader who internalizes "copper means click, cyan means diagram" after two or three pages has learned something true and useful about how to read any future HubZero page, which is the Recognition Test (`01_VISION.md` §8) operating at the level of color semantics specifically.

**Status colors** (danger/warning/success/info) are retained as a category, re-tuned to sit correctly against the new warmer/cooler neutral bases, and are used exactly as narrowly as before — form validation, system status, never as decoration. None of the four should be allowed to drift toward either copper or drafting cyan closely enough to be confused with either signal.

## 5. Gradients

v2's `--brand-gradient` (blue→violet→gold) is retired along with the blue it was anchored to. Working Blueprint's recommendation: **do not replace it with a new multi-hue gradient.** A gradient's implicit message is "this brand has a spectrum of related colors," which is precisely the opposite of the one-signature-accent discipline this document just spent §3 justifying. Where a gradient-like treatment is genuinely wanted (a subtle depth cue on a hero's copper emphasis word, mirroring the one place v2's gradient actually earned its keep), the correct replacement is a **single-hue value gradient** — copper shifting only in lightness/opacity across the same hue, never sweeping through unrelated hues. This reads as a light/material effect (like light catching an angled metal surface) rather than as a second, third, and fourth brand color smuggled in under the name "gradient."

## 6. Glow usage

Electric blue's most-repeated deployment, in the current implementation and in the wider industry it was borrowed from, is as a soft ambient glow — behind a card, around a button, as a section's background wash. Working Blueprint rejects glow as a default treatment outright, for the same reason `DESIGN/00_AI_DESIGN_GUIDE.md` §3.2 already rejects decorative blur orbs: a glow's entire communicative job is "this feels premium/technological," with no specific referent, which is decoration wearing an effect's clothes. Real light in Working Blueprint's material world comes from real sources with real behavior — a highlight along a trace line as it "energizes" once (`08_MOTION_SYSTEM.md`), not an ambient haze sitting permanently behind unrelated content. If a section feels visually empty without a glow behind it, the fix is stronger content or more disciplined whitespace (`02_VISUAL_LANGUAGE.md` §4), never an ambient wash papering over the gap — this is a direct, unmodified carry-forward of a principle v2 already got right in writing and should keep getting right in practice.

## 7. Shadows

Shadows stay functional rather than decorative: a low, tight shadow to lift an interactive surface (a card, a modal) a small, legible amount off the base, calibrated per theme (a warmer, lower-opacity shadow in light/paper mode; a true, deeper black-alpha shadow in dark/solder-mask mode, mirroring v2's existing elevation-scale logic, which is sound and unchanged). Shadows never carry the copper or cyan hue — a colored shadow reads as a glow by another name, and is excluded for the same reason §6 excludes glow directly.

## 8. Avoiding increased visual noise — the standing constraint on this whole document

Every addition in this document is checked against one constraint, stated explicitly because it's easy to lose track of while re-deriving a palette from scratch: **the new system must not be busier than the old one.** Concretely:

- Two signal colors (copper, cyan) total, replacing one (electric blue) — a net addition of exactly one color family, justified in §4 by the fact that it replaces work the single blue color was informally, inconsistently already trying to do (both "click here" and "this is techy/circuit-flavored") with a color that couldn't cleanly do both.
- No gradient sprawl (§5), no glow (§6), no colored shadows (§7) — three places where v2's existing discipline is kept exactly, not loosened.
- The neutral base's material lean (§2) is a hue shift at near-constant, very low chroma — it changes what the gray _means_ without making it louder.

A future designer or AI system extending this palette should treat any proposed third signal color, second gradient, or reintroduced glow effect as requiring the same burden of proof this document just applied to copper and drafting cyan: a real, traceable reason grounded in what HubZero actually makes, not a preference for more visual variety.
