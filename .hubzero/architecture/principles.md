# Architecture Principles

Architecture defines what a product is for.

Before any interface, API, or interaction is designed, the product's architecture should already answer: what job does this do, for whom, and what does success look like when someone uses it?

These principles apply regardless of product type — a marketing site, a SaaS dashboard, an API, an SDK, a mobile app, or an internal tool all require the same discipline of thought, even though the resulting structure looks completely different.

---

# Primary Objective

Every product exists to move someone from an unfamiliar or unresolved state to a confident, completed one.

A website visitor should become an informed prospect. A SaaS user should become a productive user. An API consumer should become an integrated one. An internal tool user should become a faster, less error-prone operator.

Identify that transformation before designing anything. Every architectural decision should contribute toward it.

---

# Determine the Product Type

Different product types carry different architectural expectations. Determine which of these (or which combination) best describes the product before making structural decisions:

* **Marketing / Website surface** — establishes trust and understanding, converts visitors into leads or customers. Structure progresses from identity to credibility to capability to action.
* **Web Application / SaaS** — helps a user accomplish recurring work. Structure centers on core workflows, state, and data, not on persuasion.
* **API / Backend Service** — exposes capability to other software. Structure centers on resource modeling, contracts, versioning, and predictable failure modes.
* **SDK / Developer Tool** — helps a developer integrate quickly and correctly. Structure centers on discoverability of capability, sane defaults, and clear escape hatches for advanced use.
* **Mobile Application** — helps a user accomplish something in short, often interrupted sessions. Structure centers on speed to core action and resilience to interruption.
* **Internal Dashboard / Tool** — helps an internal user monitor or operate something correctly. Structure centers on clarity of state, correctness of data, and speed of the operator's most frequent task.
* **AI Product** — helps a user accomplish a goal through a model-mediated interaction. Structure centers on setting correct expectations, making the system's reasoning legible enough to trust, and providing graceful recovery when the model is wrong.

A product may combine more than one of these. Identify the primary one — the one the product cannot succeed without — before optimizing for the rest.

---

# Information and Interaction Hierarchy

Regardless of product type, structure should progressively answer the questions its users actually have, in the order they naturally arise:

1. **Orientation** — what is this, and does it apply to me?
2. **Confidence** — can I trust this, is it correct, is it maintained?
3. **Capability** — what can this actually do?
4. **Path** — what do I do next, and how do I know I did it right?

A marketing site expresses this as identity → credibility → capability → conversion. An API expresses it as overview → authentication and reliability guarantees → endpoints → getting a first successful call working. The questions are the same; the vocabulary changes.

---

# Navigation and Structure Should Be Predictable

Users — human or programmatic — should always be able to answer:

* Where am I?
* Where can I go from here?
* How do I get help, or reach a human, if this doesn't work?

Avoid structural complexity that does not serve a real distinction. A product with three ways to reach the same destination has not created flexibility; it has created ambiguity about which path is correct.

---

# Content and Contracts Over Decoration

Content is the product. For an API or SDK, the contract — request/response shapes, error semantics, versioning guarantees — is the content. Structure should exist to present that content or contract clearly, not to be interesting in its own right.

Write and design for the people or systems actually consuming the product, not for how impressive the architecture looks in review.

---

# Common Mistakes

Avoid regardless of product type:

* Generic structure copied from an unrelated product type without asking whether it fits.
* Explaining every capability before establishing why the product deserves attention.
* Multiple competing primary actions or entry points.
* Structural decisions driven by what is technically convenient to build rather than what the user actually needs.
* Treating architecture as fixed once chosen — recurring user confusion is a signal to revisit structure, not just copy.

---

# Definition of Success

A well-architected product lets its users — human or programmatic — accomplish their goal without needing to understand how the product works internally.

The structure should feel obvious in retrospect, even though it required deliberate thought to arrive at.
