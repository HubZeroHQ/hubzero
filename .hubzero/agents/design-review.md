# Design Review

Engineering Review asks: *is this correct?*

Design Review asks: *is this worth putting in front of the people who will use it?*

These are independent responsibilities. A product can pass every engineering check and still feel unfinished or generic. Design Review exists to catch that gap.

Design Review happens after Engineering Review has passed, and before Release Verification.

---

# Three Passes

Design Review consists of three sequential passes. Each has a different question. Do not skip a pass because an earlier one passed.

1. **Design Review** — Is the experience coherent, consistent, and appropriate to the product and its users?
2. **Mobile Experience** — Does the product feel like a first-class experience on the device most users actually reach for, not a collapsed desktop layout? See `.hubzero/design/mobile-experience.md`.
3. **Product Polish** — Does the product feel finished and cared for, rather than technically complete but rough? See `.hubzero/polish/PRODUCT_POLISH.md`.

---

# Pass 1: Design Review

Evaluate the subjective quality of the experience, not just its correctness.

* Hover, focus, and interaction quality
* Motion quality — does it communicate, or just move? See `.hubzero/design/motion.md`.
* Navigation quality — does it establish confidence and communicate hierarchy? See `.hubzero/design/navigation.md`.
* Loading and transition states
* Spacing rhythm and visual hierarchy
* Empty and error states
* Overall perceived polish

Confirm the implementation has a clear, documented answer for every subsystem in `.hubzero/design/principles.md` — Typography, Motion, Imagery, Shape, Border, Elevation, Spacing, Interaction, Component, and Visual Rhythm. A product that nails typography but ignores its own motion or spacing decisions does not pass.

If this work introduced a new visual motif — a corner radius, a shadow treatment, a color, a motion curve — confirm it has been propagated across the rest of the product (buttons, cards, forms, badges, tables, dialogs, navigation, typography), not left isolated on the surface where it was introduced. See `.hubzero/design/principles.md` — Design Systems Evolve as Systems.

Confirm the product has, at most, one deliberate signature interaction appropriate to its purpose and users, not several competing ones. See `.hubzero/design/principles.md` — Signature Interaction. Restraint is the goal. A product trying to be memorable everywhere is memorable nowhere.

---

# Pass 2: Mobile Experience

Confirm mobile — or the smallest relevant viewport for this product — has been treated as its own experience, not a byproduct of the primary layout.

Full guidance: `.hubzero/design/mobile-experience.md`.

Do not consider this pass complete because the layout is responsive. Responsive means usable. This pass verifies it is premium.

---

# Pass 3: Product Polish

Confirm the product would hold up to first impressions with no explanation that "this part isn't finished yet."

* No placeholder content, stub responses, or gray placeholder blocks anywhere.
* Visual identity (branding, iconography, or equivalent) is integrated where the product has one — wired into metadata, navigation, and any relevant surfaces, not just present as unused assets.
* Imagery, where used, is cohesive and consistent with the product's design system.
* Loading, empty, and error states are considered, not default framework output.
* No temporary generation scripts, one-off tooling, or scratch files remain in the repository.

Full standard: `.hubzero/polish/PRODUCT_POLISH.md`.

---

# Non-Goals

Design Review evaluates and refines the experience. It does not change what the product is.

Do not use Design Review to:

* Change routing, endpoints, or information architecture.
* Modify data schemas or infrastructure.
* Alter the product's chosen Architecture or Design system.
* Introduce new engineering abstractions.

If a design problem can only be solved by an infrastructure change, stop and raise it explicitly rather than making the change under the banner of Design Review. That decision belongs to Planning or Implementation, not here.

---

# Final Question

> If someone experienced this product for the first time, with no further explanation, would they conclude HubZero cares about details, or that this is unfinished work?

If the answer is anything short of the first, continue refining before proceeding to Release Verification.
