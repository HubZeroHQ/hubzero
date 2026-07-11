# Planning

Planning is the most important stage of every HubZero project.

Good planning produces better engineering, better design, and better user experiences.

Never begin implementation before understanding the problem being solved.

---

# Planning Objectives

Before writing code, establish a clear understanding of:

- The product or client's goals.
- The business objectives.
- The users.
- The product type and architecture.
- The discoverability strategy, if applicable.
- The intended design direction.
- Any unique project requirements.

Implementation should always be a consequence of planning.

---

# Determine the Architecture

Identify which product type and architectural shape best represents the project.

Examples include:

- Marketing or corporate website
- Web application / SaaS
- API or backend service
- SDK or developer tool
- Mobile application
- Internal dashboard or tool
- AI product

Consult `.hubzero/architecture/principles.md` before making architectural decisions.

---

# Determine the Design Direction

Every product should express a deliberate, considered visual identity appropriate to its users and purpose.

Consult `.hubzero/design/principles.md` and design the product's own design system from it — do not default to generic, unconsidered styling.

---

# Determine the Discoverability Strategy

Every product that can be searched for, browsed for, or discovered should have a deliberate discoverability strategy appropriate to where its users actually look.

Consult the relevant document under:

`.hubzero/seo/`

Discoverability is not an implementation detail.

It influences:

- Information architecture
- Content planning
- Internal linking
- Structured or registry metadata
- User journeys

Select the discoverability strategy before implementation begins.

---

# Understand the User

Before proposing solutions, understand:

- What problem the product solves.
- Who the users are.
- Why they would choose this over an alternative.
- What action or outcome the product should encourage.
- What makes this different from existing solutions.

Never assume these answers.

Ask questions when necessary.

---

# Challenge Weak Decisions

Do not blindly implement requests that significantly reduce usability, clarity, accessibility, or trust.

Explain the trade-offs.

Recommend better alternatives.

If the user still chooses to proceed, respect the decision.

---

# Think in Systems

Avoid solving only the immediate request.

Consider how today's decision affects future maintainability, scalability, user experience, and design consistency. Prefer solutions that improve the overall system.

Apply `.hubzero/principles.md` here — particularly Extension Over Replacement, Composition Over Duplication, and Simplicity Requires Justification for Complexity. Good engineering exists to eliminate repeated effort; extend what already works rather than rebuilding solved problems.

---

# Before Implementation

Before writing code, mentally verify:

- The correct architecture has been identified.
- The appropriate discoverability strategy has been selected, where applicable.
- The appropriate design direction has been chosen.
- The user's goals are understood.
- The proposed solution aligns with HubZero's philosophy.
- Existing capabilities in this repository have been considered.

Only then begin implementation.

---

# Guiding Principle

Think first.

Build second.

A well-planned solution is almost always simpler, more maintainable, and more valuable than one that is implemented immediately.
