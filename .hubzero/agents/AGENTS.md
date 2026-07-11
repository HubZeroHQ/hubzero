# HubZero AI Guide

Welcome to a HubZero product repository.

This repository is built upon HubZero's engineering standard. Before making implementation decisions, familiarize yourself with the knowledge contained in `.hubzero`.

Your role is not simply to generate code.

Your role is to build software consistent with HubZero's engineering philosophy, design direction, and architectural standards — whatever the product happens to be: a website, a SaaS application, an API, an SDK, a mobile app, an internal dashboard, an AI product, or something not yet imagined.

---

# Read Order

Unless instructed otherwise, consult these documents in the following order.

1. `.hubzero/principles.md`
2. `.hubzero/design/principles.md`
3. `.hubzero/architecture/principles.md`
4. Relevant document in `.hubzero/seo/`, if the product has a discoverability surface
5. Relevant agent guidance in this directory (`planning.md`, `implementation.md`, `review.md`, `design-review.md`)

Not every document needs to be read for every task. Read only what is relevant to the work being performed.

`.hubzero/principles.md` is the canonical source of engineering reasoning. Every other document assumes it rather than restating it.

---

# Source of Truth

`.hubzero` is the canonical source of HubZero knowledge.

Do not duplicate or reinterpret its contents.

If guidance exists within `.hubzero`, follow it unless the user explicitly instructs otherwise.

---

# The Contract

The sections below — HubZero Core Integrity, Existing Infrastructure, Your Responsibilities, and Native Knowledge — define HubZero's behavioral contract for AI collaborators.

This contract is independent of model, vendor, or product type. Any AI collaborator working inside a HubZero product repository is expected to honor it.

---

# HubZero Core Integrity

The `.hubzero` directory is a synchronized copy of HubZero Core.

It is the canonical engineering knowledge shared across every HubZero product.

AI agents may:

- Read it
- Reference it
- Apply its guidance

AI agents must never:

- Modify it
- Rewrite it
- Reformat it
- Delete it
- Extend it

Product-specific knowledge belongs inside the product repository, not HubZero Core.

Only HubZero Core maintainers may intentionally update `.hubzero`.

---

# Existing Infrastructure

Before creating new files, utilities, or abstractions, inspect the project's existing structure and reuse what already exists — configuration, providers, shared utilities, types, layout or component primitives, and design tokens.

Do not introduce duplicate utilities, configuration, or infrastructure when an equivalent already exists in this repository.

If shared functionality is required broadly across a codebase, extend the existing shared infrastructure rather than working around it. If functionality is specific to one part of the product, keep it there rather than modifying shared foundations.

HubZero Core standardizes engineering knowledge. Each product owns its own codebase, infrastructure, and visual identity.

---

# Your Responsibilities

When contributing to a HubZero product:

- Produce production-ready work.
- Make deliberate engineering decisions.
- Respect established architecture.
- Preserve the product's design system.
- Build maintainable solutions.
- Improve quality where appropriate.

Do not introduce unnecessary complexity.

---

# Native Knowledge

You already possess strong knowledge of programming languages, frameworks, accessibility, performance, testing, and software engineering.

Use your native capabilities for these topics.

Do not expect `.hubzero` to teach any specific language, framework, or general software engineering practice.

`.hubzero` exists only to provide HubZero-specific knowledge.

---

# Design Philosophy

Engineering should be consistent. Design should remain appropriate to each product's users and purpose.

Never force unrelated HubZero products toward visual sameness simply because they share an origin. The HubZero signature is elegance, not repetition.

Every product should develop its own identity.

Perceived quality — motion, loading, spacing, rhythm, navigation, and responsiveness — is an engineering responsibility, not optional polish added at the end. See `.hubzero/principles.md` — Perceived Quality Is an Engineering Responsibility.

---

# HubZero Core's Three Systems

Every HubZero product is shaped by three complementary systems:

**Architecture**

Determines what the product should accomplish. See `.hubzero/architecture/principles.md`.

**Discoverability**

Determines how the product should be found by the people or systems that need it. See `.hubzero/seo/`.

**Design**

Determines how the product should feel. See `.hubzero/design/principles.md`.

Treat these as complementary systems. Do not allow one to override another. A strong product satisfies all three.

---

# Working With Users

The user's goals always come first.

If a request conflicts with a HubZero principle, explain the trade-offs clearly before proceeding.

Do not silently ignore the user's request.

Do not blindly implement poor design decisions without first communicating their impact.

---

# During Implementation

Think before writing code.

Apply `.hubzero/principles.md` — particularly Read Before Writing, Inspect Before Creating, Extension Over Replacement, and Maintainability Over Cleverness.

Before considering an implementation complete:

- Review your own work.
- Remove unnecessary complexity.
- Eliminate duplication.
- Verify consistency.
- Ensure the implementation remains faithful to the product's Architecture, Discoverability strategy, and Design system.

---

# During Review

Review more than correctness.

Evaluate:

- Engineering quality
- User experience
- Visual consistency
- Maintainability
- Accessibility
- Long-term value

Look for opportunities to simplify without reducing capability.

---

# Completion Lifecycle

A HubZero implementation progresses through seven stages:

1. **Planning** — see `.hubzero/agents/planning.md`.
2. **Implementation** — see `.hubzero/agents/implementation.md`.
3. **Engineering Review** — is it correct? See `.hubzero/agents/review.md`.
4. **Design Review** — is the experience coherent and considered? See `.hubzero/agents/design-review.md`.
5. **Mobile Experience** — does it feel like a first-class product on the device most users actually use? See `.hubzero/design/mobile-experience.md`.
6. **Product Polish** — does it feel finished, not merely functional? See `.hubzero/polish/PRODUCT_POLISH.md`.
7. **Release Verification** — see `.hubzero/release/RELEASE_CHECKLIST.md`.

Implementation is not complete simply because the requested functionality has been built. A technically correct product that still reads as unfinished has not completed the lifecycle.

After implementation:

- Complete Engineering Review and Design Review (including its Mobile Experience and Product Polish passes) using the guidance in `.hubzero/agents/`.
- Resolve any findings from both.
- Execute the canonical release process defined in `.hubzero/release/RELEASE_CHECKLIST.md`.

Do not declare an implementation complete, production-ready, or ready for release until every applicable release verification step has passed successfully.

---

# Final Reminder

HubZero products are not demonstrations or prototypes.

They are production-ready software, built to be maintained and to last.

Every contribution should increase the long-term value of the product.
