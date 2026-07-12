> **⚠️ ARCHIVED — historical reference only, not implementation guidance.** This document described the public marketing website under the design direction that was reset. It is preserved for historical context. Do not use it to guide the new design (see `DESIGN/NEXT`). See `ARCHIVE/README.md`.

# 16 — Responsive Design Standards

> **Status: Founder directive — 2026-07-01.** Issued directly by Rifaque, not a team-consensus item. Per `01_PRODUCT_VISION.md` §0, responsive/layout quality is objective engineering and UX practice, not a business judgment call — it applies regardless of individual preference and isn't subject to the founder/consensus split used for product-direction decisions elsewhere in `ARCHITECTURE/`.

## 1. The core rule

**Responsive design is not shrinking or wrapping a desktop layout into smaller widths.** Each major breakpoint tier below must be composed as its own deliberate layout, not derived by letting the desktop composition reflow until it technically fits.

If a composition gets weaker at some width — cramped, oddly balanced, an element drifting or orphaned — **redesign that breakpoint**. Do not force the desktop layout to survive there by adding wrapper divs, shrinking type until it's illegible, or nudging things with one-off margin overrides. A breakpoint that only "doesn't break" is not done; it has to read as intentional.

## 2. Breakpoint tiers — design each independently

| Tier | Targets | Representative widths to actually check |
|---|---|---|
| **Desktop** | 1080p laptops · **1440p (primary target)** · 4K / ultrawide | 1366, 1920 (1080p laptop) · 2560 (1440p) · 3440 (ultrawide) · 3840 (4K) |
| **Tablet** | iPad Mini · iPad Air · iPad Pro — **portrait and landscape both** | Mini 768×1024 / 1024×768 · Air 820×1180 / 1180×820 · Pro 1024×1366 / 1366×1024 |
| **Mobile** | Small · standard · large phones | 360×800 (small Android) · 390×844 (standard, e.g. iPhone 14) · 430×932 (large, e.g. iPhone Pro Max) |

Tablet is not "small desktop" or "big phone" — both orientations need their own look at the layout, since portrait and landscape can call for genuinely different compositions (e.g. a side-by-side arrangement that only has room to breathe in landscape).

## 3. Engineering rule: anchor to the content grid, not the viewport

This is the specific defect class found in the hero's circuit motif (`src/components/marketing/hero-section.tsx`) and is now the standing check for any absolutely-positioned or decorative element:

- Marketing pages render inside `<Container>` (`src/components/ui/container.tsx`), capped at `--content-marketing` (1200px) and centered with `mx-auto`. Past that cap, the gap between the content edge and the actual viewport edge grows without bound as the screen gets wider.
- Any element positioned `absolute` against a **viewport-width ancestor** (a full-bleed wrapper with no `max-width`) using a fixed offset (`-right-24`, `xl:-right-12`, etc.) will hold its distance from the *viewport* edge, not from the *content*. On a 1080p laptop the two edges are close enough that this looks fine by accident. On 1440p/ultrawide/4K it visibly drifts away from whatever content it's meant to relate to.
- **The fix is always structural, never a pixel patch:** position the element inside the same `<Container>` (or another element sharing the content grid's max-width/centering) that the content it relates to lives in, so both are offset from the same edge. Once both are anchored to the content box, their relationship is invariant to viewport width — verify this by checking DevTools *and* an actual 1440p+ display, since DevTools' default zoom/scaling can hide exactly this class of bug.

Before adding any `absolute`/`fixed` positioned decorative element, ask: *is this offset measured against the content grid, or against the viewport?* If the answer is "viewport" and the element is meant to relate visually to in-grid content, that's the bug.

## 4. Approval gate

Before any future homepage section (or any marketing-page section) is considered done:

1. Render it at least once per tier in §2 — not just resized in DevTools, but on an actual display where practical for the desktop tier, since DevTools screenshots and real monitors can disagree (this is exactly what surfaced the circuit-motif drift).
2. For each width checked, confirm the composition reads as intentionally designed for that width — not merely "nothing overflows or overlaps."
3. Tablet sections must be checked in both portrait and landscape, not just one assumed orientation.
4. If any tier looks weaker than the others, that tier gets redesigned before the section is approved — the desktop layout does not get to "win" by default.
