# Motion

Motion is communication, not decoration.

Every animated interface makes a claim: this state caused that change, this element is now important, this action succeeded. Motion is how that claim gets made. Treat it with the same intention as copy or layout — it is never a free finishing touch applied after the interface already works.

This document expands `.hubzero/design/principles.md` — Motion Should Reinforce Understanding. Read that section first; this is the deep dive.

---

# What Motion Is For

Well-used motion should do at least one of the following. If it does none of them, it is decoration, and decoration is the first thing to cut.

* **Reinforce hierarchy** — draw attention to what changed or what matters next, in the order it matters.
* **Communicate state** — show that an action was received, is processing, succeeded, or failed, without requiring the user to read text to find out.
* **Improve storytelling** — sequence information the way a person would naturally absorb it, rather than presenting everything at once.
* **Guide attention** — move the eye deliberately from one focal point to the next across a transition.
* **Increase confidence** — a system that visibly responds to input feels more trustworthy than one that silently jumps between states.

Motion that does not serve one of these has no job. An interface does not become more premium by moving more; it becomes more premium by moving with purpose.

---

# Progressive Delight

Not every element deserves animation. Treating everything as equally worth animating is indistinguishable, to a user, from treating nothing as worth animating — the signal gets lost in the noise.

Prioritize motion investment in the moments that actually carry weight:

* Navigation
* Hero and first-impression moments
* Loading and progress
* Transitions between major states or views
* Primary interactions the user performs often
* High-value storytelling moments (a result reveal, an onboarding sequence, a key conversion step)

Everywhere else, default to restraint. A product that animates every card hover, every list item, and every icon reads as busy, not premium. A product that spends its motion budget deliberately, on the handful of moments that matter, reads as considered.

Premium is the goal. Flashy is the failure mode that looks similar from a distance. When in doubt, cut the animation rather than add another one.

---

# Advanced Motion

Do not avoid a mature, well-supported animation or interaction library simply to keep the dependency count low. HubZero does not optimize for the smallest `package.json`. HubZero optimizes for the best product.

A hand-rolled reimplementation of scroll-linked animation, spring physics, gesture handling, carousel logic, or floating-element positioning is rarely simpler than the well-tested library that already solved it — it is usually just less visible complexity, carried entirely by whoever maintains it next.

Evaluate a motion or interaction dependency on:

* **Maintainability** — is it actively maintained, and will another engineer recognize it?
* **Performance** — does it fit the product's actual performance budget?
* **Developer experience** — does it make the intended motion easier to build correctly and keep correct over time?
* **Product quality** — does it materially improve the experience the user will actually feel?

Mature libraries worth evaluating on their merits include GSAP, Motion, Anime.js, Lenis, Embla, Floating UI, and React Aria. These are examples of the category, not a recommended stack — the right choice depends on the product, its framework, and its performance constraints. Weigh them the same way you would weigh any dependency: deliberately, against what the product actually needs, never reflexively for or against.

---

# Motion Must Respect the User's Preferences

Users who have requested reduced motion at the operating-system level are telling the product something real. Honor it. A product that ignores `prefers-reduced-motion` has not built accessible motion — it has built motion that happens to work for users who didn't ask it to stop.

Reduced-motion alternatives should still communicate state and hierarchy. Removing motion should not mean removing the feedback motion was providing — replace it with an equivalent, calmer signal (an opacity or color change, a static state indicator) rather than nothing at all.

---

# Guiding Principle

Motion should always be able to answer: what is this movement telling the user, and would they notice its absence?

If a motion cannot answer the first question, remove it. If a user would not notice its absence, it was not earning its place.
