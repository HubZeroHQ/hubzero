# Design Principles

Every HubZero product is expected to look different from every other HubZero product.

A developer-facing SDK, a consumer marketing site, an internal dashboard, and a mobile app serve different users with different needs. They should never converge on the same generic visual result simply because HubZero built all of them.

The purpose of these principles is not to define how every product looks. Their purpose is to define how every HubZero experience feels — regardless of the specific design system a product's team ultimately builds.

These principles should influence every design decision, for any product type.

---

# Elegance Above All

Elegance is the defining characteristic of every HubZero product.

Elegance is not minimalism. It is not luxury. It is not a particular typeface or animation style.

Elegance is the outcome of thoughtful engineering, excellent user experience, deliberate visual decisions, and careful attention to detail working together.

If a design decision improves elegance, it is usually the correct decision.

---

# Every Design Must Earn Trust

Users decide whether to trust a product within moments — whether that user is a prospective customer evaluating a marketing site, a developer evaluating an SDK's README, or an internal operator judging whether a dashboard's numbers are correct.

Every surface should immediately communicate professionalism, competence, and clarity.

Trust is created through consistency, visual hierarchy, readability, thoughtful interactions, and predictable behavior. It is never created through unnecessary decoration.

---

# Design With Purpose

Every element should exist for a reason. Every section should communicate something valuable. Every animation should reinforce understanding. Every interaction should make the experience easier.

If something exists only because it looks interesting, question whether it belongs.

---

# Originality Matters

Every HubZero product should develop its own visual identity appropriate to its users and purpose.

Shared engineering and shared principles should never produce identical, interchangeable aesthetics. A design system built for an internal operations dashboard should not look like the design system built for a public marketing site — they serve different users under different constraints.

---

# Build Experiences, Not Screens

A product should feel cohesive. Every screen, page, or response should naturally lead into the next.

Navigation, content, interactions, and layout should work together to guide the user through a clear journey. Think about the complete experience rather than isolated screens.

---

# Visual Hierarchy Is Communication

Users should never wonder where to look first, or what the most important information on a screen is.

Hierarchy should naturally guide attention through layout, spacing, typography, contrast, imagery, and composition. Important information should feel important without demanding attention.

---

# Simplicity Requires Discipline

Simple interfaces are often the hardest to design.

Removing unnecessary complexity creates confidence. Removing necessary information creates confusion. Aim for clarity rather than emptiness.

---

# Motion Should Reinforce Understanding

Animation should communicate. It should explain relationships, provide feedback, reduce cognitive load, and create continuity between interactions.

Motion should never distract from content, and it should never exist simply because it is technically possible. Not every element deserves motion — prioritize navigation, hero moments, loading, transitions, and primary interactions over decorating everything equally. See `.hubzero/design/motion.md` for the full motion philosophy, including when a mature animation library is the right call.

---

# Consistency Builds Confidence

Interfaces should behave predictably. Components performing similar functions should feel related, both within a single product and — where genuinely shared — across HubZero products.

Consistency allows users to focus on their goals rather than learning new patterns throughout the interface.

---

# Content Comes Before Decoration

Content is the product. For an API, the contract is the content. For a dashboard, the data is the content. Design exists to present that content clearly and meaningfully. Visual elements should support content rather than compete with it.

---

# Respect Attention

Every element asks for the user's attention. Spend that attention carefully.

Avoid unnecessary visual noise, competing focal points, repetitive animations, or decorative complexity that does not improve understanding.

---

# Information Density Should Match the User

A marketing page and an operator's dashboard have opposite correct answers to "how much should be visible at once." A marketing page earns density through progressive disclosure; a dashboard often needs density to let an expert user see everything relevant in one glance.

Choose density deliberately based on who is using the product and how often, not by defaulting to whichever feels more visually appealing in isolation.

---

# Feedback Should Be Immediate and Honest

Every action a user takes — a click, a submission, an API call — deserves a response the user can perceive: a state change, a loading indicator, a confirmation, or an error.

Silence after an action reads as failure, even when the system is actually working correctly. Never let a user wonder whether their action registered.

---

# Design for Longevity

Avoid trends that quickly become dated. Prefer timeless design decisions that remain effective years after release.

A HubZero product should age gracefully.

---

# Every Pixel Is Intentional

Nothing should feel accidental. Spacing, alignment, proportions, rhythm, imagery, interaction, and motion should all contribute toward a cohesive experience.

Deliberate decisions create confidence. Confidence creates trust.

---

# A Design System Is a Complete Set of Decisions

A design system is not a mood board or a component library alone. It is a system of decisions that removes ambiguity from implementation.

Every product's design system should have a clear, documented answer for each of the following subsystems:

- **Typography** — scale, rhythm, and voice.
- **Motion** — how the interface moves, and why.
- **Imagery** — subject, treatment, and role of photography, illustration, or iconography, where the product uses any.
- **Shape** — how corners and geometry are treated across components.
- **Border** — presence, weight, and role of borders and dividers.
- **Elevation** — presence, depth, and role of shadow or layering.
- **Spacing** — the rhythm of whitespace and density.
- **Interaction** — how hover, focus, active, and disabled states behave.
- **Component** — how recurring components express the rest of the system.
- **Visual Rhythm** — how all of the above compose into a cohesive sequence across a screen or flow.

A product that gets typography right but leaves motion, spacing, or interaction undecided has not actually built a design system — it has decided its typography and improvised the rest. Improvisation is where otherwise-different products accidentally converge on the same generic result.

---

# Design Systems Evolve as Systems

A design system is never finished, and it never evolves one component at a time.

When a new visual motif is introduced — a corner radius, a shadow treatment, a color, a motion curve, a spacing rhythm — review the entire interface, not just the surface where it appeared. Isolated excellence is a liability: a beautifully refined new component sitting next to five components still running the old motif does not read as progress, it reads as inconsistency.

Propagate the change deliberately across every place the design system expresses itself — corners, buttons, cards, forms, badges, tables, dialogs, navigation, and typography. Everything should evolve together, even if the propagation happens over several changes rather than one.

---

# Signature Interaction

A product may include one deliberate, memorable interaction appropriate to its purpose and its users. What it is depends entirely on the product; not every product needs one. These are illustrative examples, not a menu to choose from:

- A marketing product's elegant, confidence-establishing navigation.
- A conversational product's core exchange — how the conversation itself feels to have.
- An internal dashboard's live operational feedback — data that visibly, trustworthily updates in real time.
- SDK documentation's interactive playground — the ability to run the thing being documented, in place.

Restraint is what makes it work. One well-executed signature moment is memorable. Five competing ones cancel each other out and read as noise. Favor memorable restraint over maximal decoration. See `.hubzero/design/motion.md` — Progressive Delight, and `.hubzero/design/navigation.md` for how navigation specifically relates to this principle.

---

# The HubZero Signature

The signature of HubZero is not a particular layout, component library, color palette, animation style, or typeface.

The signature is elegance.

Every product should express that elegance differently, appropriate to its users and purpose. If two unrelated HubZero products look alike, something has gone wrong. If two HubZero products feel equally thoughtful, equally refined, and equally effortless to use, these principles have been successfully applied.
