# Navigation

Do not teach floating navigation. Teach premium navigation.

Floating navigation is one implementation of premium navigation, appropriate to some products. It is not the standard itself. A dashboard, an SDK's documentation, and a mobile application each need navigation that feels equally intentional — and each arrives at a structurally different answer.

This document expands `.hubzero/architecture/principles.md` — Navigation and Structure Should Be Predictable, which defines navigation as a structural, informational concern (can the user always answer where am I, where can I go, how do I get help). This document covers the felt, designed layer built on top of that structure.

---

# What Premium Navigation Does

Regardless of implementation, navigation that meets HubZero's standard does all of the following:

- **Establishes confidence** — its presence and behavior signal that the product is complete and considered, in the first few seconds of use.
- **Adapts predictably** — its behavior in response to scroll, resize, state change, or content change follows a rule the user can learn, not a rule that surprises them.
- **Communicates hierarchy** — primary, secondary, and contextual navigation are visually and structurally distinct from one another.
- **Remains accessible** — fully operable by keyboard, with correct landmark and focus behavior, at every breakpoint.
- **Feels intentional** — every piece of its behavior was a decision, not a framework default left unexamined.

---

# The Right Answer Depends on the Product

These are illustrative examples of how the same standard produces different structures — not a menu to choose from and not an exhaustive list.

- **Marketing product** — navigation often earns visual investment, since it is one of the first things a prospective user experiences. An elegant floating or adaptive treatment can work well here, because establishing confidence in the first few seconds is close to the entire job.
- **Internal dashboard** — navigation usually needs to be persistent and low-friction, since the same operator returns to it dozens of times a day. Optimizing for confidence at first sight matters far less than optimizing for the hundredth use.
- **Web application** — navigation often becomes contextual, adapting to the user's current task or workflow state rather than remaining a fixed global structure.
- **Mobile application** — navigation should be built for thumb reach and one-handed use from the start, not adapted from a desktop pattern. See `.hubzero/design/mobile-experience.md`.
- **SDK or developer documentation** — navigation is usually a persistent, hierarchical structure (sidebar, table of contents) optimized for scanning and jumping directly to the relevant page, not for a first-impression narrative.
- **API** — "navigation" may not be visual at all; it is the discoverability and structure of the reference itself. The same principles — predictability, hierarchy, confidence — still apply to how the reference is organized.

---

# Navigation and Signature Interaction

Navigation may become a product's signature interaction (`.hubzero/design/principles.md` — Signature Interaction) when the product's identity genuinely depends on it — most often true for marketing and consumer-facing products, where navigation is one of the first things experienced.

It does not have to. A dashboard's persistent sidebar can be premium — confident, predictable, accessible — without being memorable, and that is the correct outcome for that product. Do not add motion or novelty to navigation in order to manufacture a signature moment it does not need. See `.hubzero/design/motion.md` — Progressive Delight.

---

# Guiding Principle

A user should never have to think about how to get where they need to go next. Every choice made in service of that — whichever structure it produces — is premium navigation. Everything else is decoration wearing navigation's name.
