> **⚠️ ARCHIVED — historical reference only, not implementation guidance.** This document described the public marketing website under the design direction that was reset. It is preserved for historical context. Do not use it to guide the new design (see `DESIGN/NEXT`). See `ARCHIVE/README.md`.

# 13 — Brand System

> **Status: New foundational document — 2026-07-11.** `CRITIQUE_01_REVIEW_BOARD.md` found the single most severe gap in `DESIGN/V3`: no document addressed the actual brand mark at all. This document resolves that gap by treating the existing HZ monogram as HubZero's canonical symbol and building the rest of the brand system outward from it, rather than by replacing it. The real gap in the current asset library isn't the mark or its blue — it's that only one register of it exists today (a rich, dimensional, expressive render) with no flat, reproducible counterpart for the contexts that genuinely need one (a 16px favicon, a single-color print document, a GitHub avatar on an unpredictable background). This document names that missing register, specifies it, and defines how the two coexist permanently rather than one replacing the other.

## 1. Brand invariants

Before any specific touchpoint is specified, these are the rules that hold across all of them — present and future, digital and (if it ever arises) physical, at any size from a 16px favicon to a full-bleed hero. They are written as durable invariants and an evolution strategy, not as absolute style rules — a rule like "never glossy" would only be true of today's rendering fashions; an invariant like "canonical and expressive registers are both permanent, and only their specific technique evolves" stays true regardless of what rendering technology looks like in ten years.

1. **One mark, one geometry.** The logomark is a single, fixed shape — the existing H/Z hexagonal monogram (§2). A favicon, a GitHub avatar, and a hero render are the same geometry at different scales and in different registers (§2) — never different marks, never a "simplified for small sizes" alternate silhouette that departs from the real construction.
2. **Two representational registers, permanently, not one mandated rendering style.** **Canonical** assets are flat, single- or limited-tone, and reproducible identically at any size or in any single-color context — favicon, UI chrome, print, documentation. **Expressive** assets are rich, dimensional, and free to use lighting, material, gloss, and motion — marketing hero moments, product launches, motion pieces. Both are legitimate, permanent categories the mark lives in; neither retires the other. What's free to evolve is the _specific rendering technique_ the expressive register uses (today, a 3D-rendered gradient-and-highlight treatment; in five years, whatever technique is current then) — not whether an expressive register exists at all.
3. **The canonical register is monochrome-first, color-optional.** A canonical asset is designed and specified as a single-ink flat shape first; a named palette stop (`11_COLOR_PHILOSOPHY_AMENDMENT.md` §2) is one valid rendering of it, not a requirement for it to be recognizable. This is what makes the canonical mark actually survive a favicon, a GitHub org avatar on an unpredictable background, or a black-and-white print document. The expressive register is exempt from this requirement by design — its whole job is richness, not single-color reproducibility.
4. **The Favicon Test, scoped to the canonical register.** A concrete, falsifiable gate, deliberately modeled on `01_VISION.md` §8's Recognition Test because that test's own weakness (per `CRITIQUE_01_REVIEW_BOARD.md` §32) is having no operational protocol — this one has one: **render the canonical mark as a single flat color at 16×16px on both a light and a dark square. Does it still read as a distinct, intentional shape, not a smudge?** This test applies only to the canonical register — an expressive render is never evaluated at 16px, because it's never deployed there.
5. **No secondary, per-pillar marks.** Work, Labs, Builds, and Blueprints do not get their own logo variants or badges distinct from the one mark — the same discipline `04_COLOR.md` §3 and `11_COLOR_PHILOSOPHY_AMENDMENT.md` §9 already apply to color, applied here to the mark itself. Pillars differentiate through composition and register (`09_PAGE_ARCHETYPES.md`), never through a family of sub-logos.
6. **Never re-skinned onto a real artifact.** The mark, in either register, is never applied as a color-overlay, duotone filter, or watermark onto a real photograph or diagram — the same artifact-integrity rule `02_VISUAL_LANGUAGE.md` §5 already applies to hardware photography and schematics, extended here to forbid the common social-card mistake of tinting a real screenshot to "match the brand."
7. **The wordmark's typography always matches the current type system, not a frozen legacy choice.** The mark's typography is not exempt from `03_TYPOGRAPHY.md` — when the type system changes (as it just did, §5 below), the wordmark changes with it, on the same timeline, not as a deferred afterthought.
8. **Evolution is deliberate, never casual.** The canonical geometry (§2) and the seven-stop palette it draws from (`11_COLOR_PHILOSOPHY_AMENDMENT.md` §2) are not frozen forever, but a change to either should name which real need it answers (a genuine reproducibility failure, a new medium, a material recalibration) — never "this looks dated" alone. This mirrors `11_COLOR_PHILOSOPHY_AMENDMENT.md` §8's own invariant 5 exactly, stated here for the mark specifically because color and geometry are the two things a future rebrand impulse reaches for first.

## 2. The logomark: the existing HZ monogram, canonical

**What it is.** `public/brand/icon.png` and its siblings (`icon.svg`, `primary.png`, `primary-horizontal.png`, `wordmark.png`) depict a real typographic construction — a stylized H and a stylized Z/arrow sharing structure inside a hexagonal frame, currently rendered with gloss, bevel, and specular highlight. **This geometry is HubZero's canonical symbol** — genuinely distinctive (a real letterform construction, not a generic stock shape), already the company's most recognizable asset, and the correct anchor for everything in this document, not a mistake to correct out from under it.

**The actual gap, stated precisely.** Today, exactly one register of this mark exists: the rich, dimensional, glossy render, and it is used everywhere — including `favicon.ico`, `apple-touch-icon.png`, both `android-chrome-*.png` sizes, and `src/components/brand/logo.tsx`'s navbar/footer lockup, alongside `site.webmanifest`'s `theme_color` (`#3ABEFF`, already close to this document's blue family, addressed in §6). **The gap is not that this render exists — it's that no flat, canonical counterpart exists alongside it.** A 16×16 favicon rendered from a gradient-and-specular-highlight source loses its internal detail at exactly the size it's most often seen; a single-color print reproduction of a gradient asset has no honest way to simplify itself. This is a genuine, values-neutral reproducibility problem, independent of any color argument — the fix is adding the missing register, not replacing the one that already works well in the contexts it's actually suited to (a hero moment, a launch visual, anywhere scale and richness serve the mark).

**The resolution: both registers, each in its right place.**

- **Canonical (new).** The same H/Z hexagonal geometry, redrawn flat — no bevel, gradient, or specular highlight — in either a solid single-tone fill or an open hairline outline, using the palette named in `11_COLOR_PHILOSOPHY_AMENDMENT.md` §2 (typically Brand Blue solid, or ink/Neutral Silver for monochrome contexts). This is what favicon, UI chrome, print, and documentation contexts should actually use, for the reproducibility reason above — not because the expressive render is wrong, but because those specific contexts need a version built for legibility at small scale and single-color reproduction, which no rendering technique can give a gloss-and-gradient source honestly.
- **Expressive (existing, retained).** The current dimensional, glossy render — or whatever rendering technique succeeds it over time, per invariant 2 — remains the register for marketing hero moments, product launches, and motion pieces, where richness and scale are the point. Nothing about this document asks for this asset to be rebuilt, retired, or flattened; it asks for the canonical register that's missing to be produced alongside it.

**Construction logic for the canonical register specifically:**

- The monogram's existing hexagonal boundary and H/Z letterform logic are retained exactly — this is the real geometry worth keeping, in both registers.
- Every edge that the expressive render depicts as a beveled 3D facet becomes, in the canonical register only, a single flat plane bounded by a real trace-path line (right angle or 45°, per `02_VISUAL_LANGUAGE.md` §1) — so the canonical mark reads as an instance of the same flat linework vocabulary the rest of the disciplined UI uses, while the expressive register keeps its own, separately-justified richness.
- The canonical register ships in exactly two treatments: **solid** (a single flat fill, for favicon/small-size use) and **linework** (an open, hairline-stroked outline, for larger canonical uses — a document header, a GitHub social preview). The expressive register is unconstrained by this split; it is not attempting to be reproducible at small size.

## 3. Minimum size and clear space (canonical register)

- **Minimum digital size: 16px** (the Favicon Test, §1 invariant 4) for the solid treatment; the linework treatment needs meaningfully more room to read its internal detail and should not be used below roughly 32px.
- **Clear space:** a minimum margin equal to the mark's own cap-height (the height of the H stroke) on all four sides, in any lockup — the same "unpopulated substrate" logic `02_VISUAL_LANGUAGE.md` §1 already applies to page composition, applied here at the mark's own scale.
- **Never scaled anisotropically** (stretched wider or taller than its native proportions) and never rotated for a "dynamic" placement, in either register — the mark's geometry is fixed, per invariant 1.
- **The expressive register is not bound by a minimum size** in the same sense — it's used at hero/launch scale by definition, where legibility-at-16px was never the requirement.

## 4. Color application

Per `11_COLOR_PHILOSOPHY_AMENDMENT.md` §7: the mark's blue is the palette's fullest, richest expression, which is exactly why the two registers exist — the canonical register spends that palette narrowly (one flat stop) so the expressive register can spend it fully (the whole ramp, with real light and material behavior) without either competing with the other for visual weight.

- **Canonical register, on dark surfaces:** Brand Blue solid fill, or ink-on-transparent linework where a quieter treatment is wanted (a footer, a document footer).
- **Canonical register, on light surfaces:** ink or Neutral Silver solid fill as the default, with Brand Blue linework as a considered secondary option — verified against `12_ACCESSIBILITY.md` §1's contrast requirements before finalizing, the same as any other token pairing.
- **Canonical register, single-color/monochrome contexts** (a favicon rendered on an OS that ignores transparency, a black-and-white print document, a GitHub org avatar on an unpredictable background): pure ink or pure white flat fill — this is what invariant 3 exists to guarantee always works.
- **Expressive register:** the full seven-stop ramp (`11_COLOR_PHILOSOPHY_AMENDMENT.md` §2), including real lighting, gradient, and material behavior across it — this is the one context in the entire identity where the richest treatment of the palette is not just permitted but correct, per `11_COLOR_PHILOSOPHY_AMENDMENT.md` §7's restraint-in-interfaces/richness-in-the-mark asymmetry.

## 5. The wordmark

**The current inconsistency (unrelated to the color/rendering question above, and still real):** `src/components/brand/logo.tsx` sets "Hub" in Geist Sans and "Zero" in Instrument Serif italic. `03_TYPOGRAPHY.md` §6 retires Instrument Serif in favor of IBM Plex Serif, used upright by default rather than italic-by-default — a decision the wordmark, sitting in the same codebase, was never revisited against.

**Resolution:** the wordmark migrates on the same timeline as the rest of the type system (`10_IMPLEMENTATION_ROADMAP.md` Phase 1, §11 below) — "Hub" stays Geist Sans (Semibold, matching `03_TYPOGRAPHY.md` §2's display weight ceiling), "Zero" moves to IBM Plex Serif, upright. This is not a new design decision — it's applying a decision `03_TYPOGRAPHY.md` already made to the one place in the codebase that decision hasn't reached yet.

**Lockup rules:**

- **Full lockup** (icon + wordmark): the icon's canonical linework treatment (§2) at a size matched to the wordmark's cap-height, wordmark immediately following at the clear-space margin (§3) — the existing `Logo` component's `variant="full"` structure is correct and is retained; only the icon asset and the serif family change.
- **Icon-only** (`variant="icon"`, mobile nav, favicon-adjacent UI): the canonical solid treatment (§2) at or above the 16px minimum (§3).
- **Never a stacked (icon-above-wordmark) lockup** for the primary brand treatment — HubZero's nav and footer usage is exclusively horizontal, and introducing a second lockup geometry would violate invariant 1's "one mark" spirit extended to the full lockup as a unit.

## 6. Favicon and app icons

A concrete inventory — adding the missing canonical register alongside the existing expressive asset, not replacing it (implementation work for `10_IMPLEMENTATION_ROADMAP.md` Phase 1, not performed by this document):

| File                                          | Current state                                                                                                                       | Required state                                                                                                                                                                                                                                                       |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `favicon.ico`                                 | Expressive (glossy 3D) render, scaled down                                                                                          | Canonical solid treatment, Brand Blue or ink, at 16/32/48px multi-resolution — the expressive render's fine gradient detail doesn't survive this scale honestly regardless of color, which is the real, values-neutral reason this file needs the canonical register |
| `apple-touch-icon.png` (180×180)              | Expressive render                                                                                                                   | Canonical solid treatment, with real padding inside the 180×180 canvas for Apple's rounded-corner mask                                                                                                                                                               |
| `android-chrome-192x192.png` / `-512x512.png` | Expressive render                                                                                                                   | Canonical solid treatment at 192px; the 512px size has enough resolution to reasonably carry either register — canonical is still preferred for consistency with the smaller size                                                                                    |
| `site.webmanifest`                            | `theme_color` (`#3ABEFF`) already gestures at this family but isn't tied to a named token; `background_color` is generic pure black | `theme_color` set to Brand Blue (`#0174D5`) or Electric Sky (`#1495ED`), whichever calibrates better against real browser-chrome contrast; `background_color` set to Background (`#030B17`)                                                                          |

## 7. Social cards (Open Graph / Twitter cards)

Per-page-type dynamic generation, not one static image — a single generic "HubZero" card reused across every case study, Note, and Labs entry fails the same "real evidence over generic decoration" test `02_VISUAL_LANGUAGE.md` and `07_IMAGERY.md` already apply to on-page imagery, extended here to the one image most likely to be seen by someone who's never visited the site.

- **Default/homepage card:** the expressive register at generous scale on the Background field, with the wordmark (§5) — this is exactly the kind of large-canvas, richness-appropriate context the expressive register exists for, unlike the favicon case above.
- **Case study / Notes / Labs / Blueprints cards:** generated per entry (a Next.js `opengraph-image` route, computed from real document data — title, client or category, and, where one exists, the entry's real cover image cropped to the card's aspect ratio) rather than a static fallback for every entry, per `07_IMAGERY.md` §1's real-evidence-over-decoration discipline.
- **Typography on generated cards** follows `03_TYPOGRAPHY.md`'s technical-label register (Geist Mono for the category/date line) plus a Geist Sans headline.
- **Never fabricated content:** a card for an entry with no real cover image shows the default card's treatment rather than a generic stock image or an AI-generated "concept" background.

## 8. GitHub

`github.com/HubZeroHQ` is a real, existing touchpoint this folder's original ten documents never mentioned:

- **Org avatar:** the canonical solid treatment (§2, §4), monochrome-safe per invariant 3, since GitHub renders org avatars on both its light and dark theme without the org controlling the background.
- **Repository social preview image:** the same expressive-register default card treatment as §7's homepage card, sized to GitHub's specific preview-image convention.
- **Repository README header:** if a README ever carries a header image (the current `README.md` does not, and should not gain one purely for decoration) — no requirement to add one; if one is ever added, it follows the same mark-and-wordmark lockup rules as §5.
- **No separate "GitHub brand"** — invariant 5 applies here as much as it does to product pillars.

## 9. Package registries

HubZero's `package.json` (`"private": true`) is not currently published to npm or any other registry, and this document does not fabricate a publishing story that doesn't exist yet. What this document commits to, for whenever that changes (a Blueprint distilled into a real, published package, per `ARCHITECTURE/17_COMPANY_STRUCTURE.md` §2):

- **A published package's README** follows the same wordmark and mark rules as GitHub (§8) at the top of the README, plus real, honest metadata (`author`, `homepage`, `repository` fields pointing at real, live URLs) — never a placeholder npm badge count or a fabricated "downloads" claim before real usage exists.
- **No registry-specific visual treatment** beyond what §5–8 already specify.

## 10. Other non-website touchpoints

Named honestly rather than speculatively over-specified, per this folder's own standing discipline (`01_VISION.md` §10) that an honest gap beats an invented one:

- **Proposal and contract documents** (a real, likely-existing touchpoint for a studio closing six-figure engagements) should use the canonical linework mark and wordmark lockup (§2, §5) as a document header, in ink or Brand Blue as a single spot color — print reproduction is exactly the kind of single-color context the canonical register exists for. Flagged here as a real, near-term need worth a small follow-up production pass, not specified further because no such document template exists in this repository to audit against.
- **Email signatures, pitch decks, and any other physical/document touchpoint** not enumerated above inherit the invariants in §1 by default until a dedicated pass addresses them specifically.

## 11. Where this fits in the roadmap

This document's asset work — producing the missing canonical register (§2, §6) and migrating the wordmark's serif (§5) — belongs in `10_IMPLEMENTATION_ROADMAP.md` **Phase 1**, alongside the color and type token migration, not deferred to a later phase. Unlike a retirement, this is additive production work (a new flat asset set alongside the existing expressive one) rather than a replacement with a hard cutover deadline, so its risk profile is lower than the roadmap's own sequencing principle 3 would otherwise imply — but it should still land alongside Phase 1 so the site's disciplined new UI and its brand mark's two registers are both correctly in place at the same time, rather than the canonical favicon shipping months after the rest of the token migration for no real reason. Phase 1's effort estimate in `10_IMPLEMENTATION_ROADMAP.md` §3 is amended to include this asset work explicitly.
