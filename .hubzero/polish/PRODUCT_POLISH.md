# Product Polish

This document defines how every released HubZero product should feel.

Implementation alone does not produce a portfolio-quality product. A product can pass Engineering Review, satisfy every architectural requirement, and still feel unfinished. Product Polish exists to close that gap.

A released product should never feel like a demonstration of what it _could_ be. It should feel like something HubZero would confidently stand behind — whether the audience is a customer, a developer integrating an SDK, or an internal team relying on a dashboard.

---

# The Standard

A released product satisfies every applicable item below.

- **Premium interactions.** Motion, hover states, focus states, and transitions are deliberate — see `.hubzero/design/principles.md` and `.hubzero/design/motion.md`.
- **Considered loading and transition states.** Every wait has a state; nothing flashes, jumps, or leaves the user uncertain whether their action registered.
- **Deliberate micro-interactions.** Small feedback moments — a button press, a toggle, a validated form field — feel considered, not left as default framework output.
- **Full keyboard and focus support.** Every interactive element is reachable and operable by keyboard alone, with a visible focus state, not only by mouse or touch.
- **Honest success feedback.** A successful action confirms itself as clearly as a failed one does — silence after success reads as failure. See `.hubzero/design/principles.md` on feedback.
- **Consistent visual rhythm.** Spacing, hierarchy, and composition read as one system across every screen, not a patchwork of components built at different times.
- **Unified design system.** Typography, corners, borders, shadows, spacing, navigation, and components all read as one system, including any new motif propagated consistently. See `.hubzero/agents/design-review.md` and `.hubzero/design/principles.md` — Design Systems Evolve as Systems.
- **No unfinished surfaces.** Every screen, page, or endpoint a user can reach is complete.
- **No placeholder content.** Lorem ipsum, "coming soon" states, gray boxes, and stub responses do not ship.
- **Deliberate empty and error states.** These are not afterthoughts bolted on after the happy path — see `.hubzero/design/principles.md` on feedback.
- **Deliberate mobile and touch experience**, where applicable. See `.hubzero/design/mobile-experience.md`.
- **Perceived quality matches actual quality.** A technically correct product that feels rough erodes the trust its correctness earned.

---

# When This Applies

This standard is verified during the Product Polish pass of Design Review (`.hubzero/agents/design-review.md`), after Engineering Review and the general Design Review and Mobile Experience passes, before Release Verification.

---

# Guiding Question

> Would someone experiencing this product for the first time, with zero context, conclude that HubZero cares about details — or that this is unfinished work?

If the honest answer is the second, the product has not met this standard yet.
