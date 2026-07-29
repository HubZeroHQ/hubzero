# Engineering Principles

This document is the canonical source of HubZero's engineering principles.

Every other document inside `.hubzero` assumes these principles rather than restating them. `architecture/`, `seo/`, and `design/` describe domain-specific knowledge. `agents/` describes process. This document describes the reasoning that should guide both.

If a decision is not covered by domain-specific guidance, fall back to these principles.

---

# Read Before Writing

Understand existing code, content, and structure before changing it.

Never modify what you do not understand.

A change made without reading the surrounding system is a guess, not an engineering decision.

---

# Inspect Before Creating

Before introducing a new file, folder, component, utility, or abstraction, determine whether an equivalent already exists.

This codebase already solves many problems. Search before building.

---

# Infrastructure Before Implementation

Understand the infrastructure a product already provides before adding to it.

Configuration, providers, utilities, layout primitives, and discoverability infrastructure are already established somewhere in most codebases. New work should sit on top of that foundation, not beside it.

---

# Extension Over Replacement

Prefer extending existing systems over replacing them.

Replacing working infrastructure to suit a single feature usually indicates the feature was not planned against the existing system carefully enough.

---

# Composition Over Duplication

If a pattern is used more than once, it should be composed from a shared source rather than copied.

Duplication is not a shortcut. It is a future inconsistency waiting to happen.

---

# Configuration Over Hardcoding

Branding, content, navigation, and business-specific values belong in configuration, not embedded directly inside components.

A product should remain configurable without editing implementation code.

---

# Maintainability Over Cleverness

Choose the solution another engineer can understand quickly, not the one that demonstrates the most skill.

Clever code that requires explanation has already failed as documentation.

---

# Simplicity Requires Justification for Complexity

Choose the simplest solution that fully satisfies the requirement.

Every abstraction, dependency, and architectural layer must earn its place. Do not build for hypothetical future requirements.

---

# Accessibility by Default

Accessibility is not a review-stage checklist item. It is a property of correct implementation.

Semantic HTML, keyboard navigation, focus management, and sufficient contrast should exist because the implementation was built correctly, not because they were added afterward.

---

# SEO as Engineering

SEO is not a layer applied after implementation. It is a consequence of correct information architecture, semantic structure, and metadata.

Treat discoverability as a property of good engineering, not a separate task.

---

# HubZero Core Defines Decisions, Not Implementations

`.hubzero` teaches what to decide and why. It does not teach how to write React, Next.js, TypeScript, Swift, Go, or any other language or framework.

If a document only repeats knowledge a modern coding model already possesses, it does not belong in `.hubzero`.

---

# Interface State Should Be Independently Derived

A recurring engineering failure across HubZero products is coupling unrelated interface states together — for example, deriving a drawer's appearance from scroll position, or a navigation bar's color from hero visibility.

Each interface state (scroll position, drawer open/closed, navigation appearance, hero visibility) should be computed independently and composed, not chained through one another. Coupled state is difficult to reason about and breaks in combinations that were never explicitly tested.

Relatedly, be deliberate about stacking context. `transform`, `filter`, and `backdrop-filter` all create new stacking contexts. Before relying on `z-index` to order drawers, overlays, or floating navigation, verify which ancestor established the stacking context those elements are actually painted within.

---

# Finish Completely

An implementation is not finished because it behaves correctly under ideal conditions.

Before considering work complete, verify edge cases, empty states, and error states, and confirm existing functionality still works.

---

# Perceived Quality Is an Engineering Responsibility

A product can be functionally correct and still fail the person using it.

Motion, loading behavior, spacing rhythm, typography, transitions, responsiveness, and consistency are not decoration layered on top of working software — they are part of what "working" means to the person experiencing it. Treat perceived quality as a first-class engineering concern, verified and owned the same way correctness is, not a design-team afterthought discovered late.

See `.hubzero/design/motion.md`, `.hubzero/design/navigation.md`, `.hubzero/design/mobile-experience.md`, and `.hubzero/polish/PRODUCT_POLISH.md` for how this principle is applied in practice.

---

# Evaluate Dependencies, Don't Default Against Them

A small dependency count is not itself a goal, and it is not a substitute for the judgment Simplicity Requires Justification for Complexity, above, already asks for.

Evaluate every dependency — a motion library, a state manager, a date utility — on maintainability, performance, developer experience, and the product quality it enables. A mature, well-supported library that meaningfully improves the product is usually the better choice over a hand-rolled equivalent that quietly re-solves a problem the library already solved correctly. See `.hubzero/design/motion.md` — Advanced Motion for a worked example.

---

# Guiding Principle

These principles exist to remove repeated engineering effort, not to remove engineering judgment.

When a principle and a specific project requirement conflict, explain the trade-off rather than silently choosing one over the other.
