# Review

Every completed implementation should be reviewed before it is considered finished.

Review is not about finding mistakes.

It is about ensuring the final result reflects HubZero's engineering standards, design philosophy, and long-term quality expectations.

Never assume that working software is finished software.

This document covers Engineering Review — is the implementation correct, maintainable, and complete? A separate pass, Design Review, asks whether the result is worth showing a client. See `.hubzero/agents/design-review.md`. Apply `.hubzero/principles.md` throughout this review.

---

# Review the Problem

Before reviewing the implementation, verify that the original problem has actually been solved.

Ask:

* Does this satisfy the user's request?
* Does it satisfy the business objective?
* Does it improve the product?

A technically correct solution may still solve the wrong problem.

---

# Review the User Experience

Evaluate the complete experience rather than isolated components.

Consider:

* Clarity
* Navigation
* Information hierarchy
* Discoverability
* Accessibility
* Feedback
* Responsiveness

The interface should feel effortless to use.

---

# Review the Design

Confirm that the implementation remains consistent with:

* `.hubzero/design/principles.md`
* The selected architecture
* The selected discoverability strategy
* The product's established design system

Ask:

* Does this feel intentional?
* Does this improve trust?
* Does it preserve the product's personality?
* Is anything visually unnecessary?

Elegance should emerge from thoughtful decisions rather than decoration.

---

# Review the Architecture

Verify that the implementation respects the chosen architecture (`.hubzero/architecture/principles.md`).

The product should clearly communicate its intended purpose to the people or systems using it.

New features should strengthen the overall experience rather than disrupt it.

---

# Review Discoverability

Confirm that the implementation remains consistent with the selected discoverability strategy, where one applies.

Evaluate:

* Information architecture
* Metadata
* Heading hierarchy
* Internal linking
* Structured data
* Crawlability
* Content organization

The implementation should improve discoverability without compromising user experience.

---

# Review the Engineering

Evaluate:

* Simplicity
* Maintainability
* Readability
* Reusability
* Scalability

Avoid unnecessary complexity.

Prefer solutions another engineer can quickly understand and confidently extend.

---

# Review Consistency

The project should feel cohesive.

Check for consistency in:

* Layout
* Components
* Spacing
* Typography
* Motion
* Content structure
* Naming
* Interaction patterns

Consistency builds confidence.

---

# Review Production Readiness

Confirm that the implementation is suitable for real-world deployment.

Verify that:

* Placeholder content has been removed where appropriate.
* Error states have been considered.
* Empty states behave correctly.
* Responsive layouts function correctly.
* Accessibility has not been compromised.
* Existing functionality remains intact.

Every implementation should always move toward production readiness.

---

# Improve Before Approving

If something can be meaningfully improved without introducing unnecessary complexity, improve it.

Do not stop at "good enough."

Pursue thoughtful refinement.

---

# Review Outcome

A successful review does not automatically mean the implementation is complete.

Once engineering review findings have been addressed, the implementation must proceed to Design Review (`.hubzero/agents/design-review.md`) before the HubZero release process.

Execute the canonical release workflow defined in:

`.hubzero/release/RELEASE_CHECKLIST.md`

Every applicable verification item must pass before the implementation may be considered production-ready.

If any verification fails:

* Identify the root cause.
* Correct the implementation.
* Repeat verification.
* Continue until all applicable requirements have been satisfied.

The release checklist is the final quality gate for every HubZero product.

Do not approve an implementation that has not successfully completed the release process.

---

# Final Question

Before completing the review, ask one final question:

> If this implementation represented HubZero publicly, would we be proud to ship it?

If the answer is anything less than an unqualified **yes**, continue refining.

---

# Guiding Principle

A review is successful when the final result is not only correct, but thoughtful, elegant, maintainable, and worthy of representing HubZero.
