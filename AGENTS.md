# HubZero

## Engineering Bootstrap

Before performing any work, run the bootstrap sequence in **[`docs/operations/ENGINEERING_BOOTSTRAP.md`](docs/operations/ENGINEERING_BOOTSTRAP.md)**. It covers, in order: required reading (`.hubzero/agents/AGENTS.md`, this file, `docs/README.md`, `docs/design/DESIGN_SYSTEM.md`, and the current-stage log), how to determine which of this repository's skills (if any) apply to the task, the working assumptions and constraints that hold across sessions, and a pre-implementation checklist to confirm before writing code.

Do not treat this file alone as sufficient — it is this product's entry point, not its full engineering process. `.hubzero/agents/AGENTS.md` defines HubZero's cross-product contract; the bootstrap document above defines how that contract, plus this repository's own documentation and skills, come together at the start of a session.

For current project stage — what has actually shipped, what's still uncommitted, what was deliberately deferred — read **[`docs/architecture/EXPERIENCE_V3_PROGRESS.md`](docs/architecture/EXPERIENCE_V3_PROGRESS.md)** rather than relying on a prior conversation's memory of it.

Every document referenced above takes precedence over default assumptions.

---

# Project Mission

You are designing the next generation of HubZero.

The production platform is designed from first principles around the architecture and design
documentation in this repository.

---

# What HubZero Is

HubZero is an engineering-first technology studio.

We design and build software, products, developer tools, AI systems, websites, and digital experiences.

The website should communicate capability through evidence rather than marketing.

Avoid startup clichés.

Avoid agency clichés.

Avoid exaggerated claims.

Every page should demonstrate craftsmanship.

---

# The Four Pillars

The website revolves around four permanent divisions.

These are not temporary sections.

They define the entire information architecture.

Since this section was written, the public site has grown real additional content types alongside the four pillars — Notes, Engineering Profiles, Services, and Careers. They don't replace or compete with the pillars below; they document evidence *about* the pillars (who did the work, what was learned, what roles support it). See `docs/README.md`'s Product section for the current, complete content-type list rather than treating this section as exhaustive.

## 1. Work

Client work.

Contains professional case studies.

Purpose:

Show how HubZero solves real business problems.

Includes:

- Case studies
- Process
- Outcomes
- Technologies
- Challenges
- Lessons learned

Never include internal products here.

---

## 2. Builds

Finished internal products.

These are products created by HubZero itself.

Each build may contain:

- Product overview
- Story
- Technical architecture
- Screenshots
- Case study
- Live deployment
- Repository (when public)

This is the product portfolio.

---

## 3. Blueprints

Blueprints are reusable website foundations.

Naming convention is mandatory:

Blueprint-X-Y

Where:

X = Information Architecture

Y = Design Language

Examples:

Blueprint-Corporate-Minimal

Blueprint-SaaS-Editorial

Blueprint-Portfolio-Brutalist

Blueprint-Ecommerce-Luxury

Each blueprint should explain:

- Intended audience
- Architecture
- Design philosophy
- Features
- Live preview
- Technologies

Blueprints are discoverable assets clients can browse before starting a project.

---

## 4. Labs

Labs contains projects currently under development.

These are experimental or in-progress internal products.

Purpose:

Demonstrate active engineering.

Projects shown here are not finished products.

Instead they communicate:

- exploration
- experimentation
- ongoing research
- technical capability

Each Lab should clearly communicate its current stage.

---

# Website Philosophy

The website should feel like a modern product publication rather than an agency website.

Prioritize:

- clarity
- engineering
- craftsmanship
- documentation
- thoughtful storytelling

Avoid unnecessary marketing language.

Show evidence.

Not promises.

---

# Content Philosophy

Every page should be content-rich.

Do not artificially create excessive whitespace.

Whitespace should improve readability.

It should never make pages feel empty.

The experience should remain visually balanced even on:

- 1440p
- 2K
- ultrawide displays

Every section should contribute meaningful information.

Avoid filler.

---

# Planning

This section describes planning for net-new product surfaces (a new pillar, a new top-level section). For most engineering work — extending, fixing, or auditing something that already exists, which is the majority of work in this repository's current stage — run the **Engineering Bootstrap** (`docs/operations/ENGINEERING_BOOTSTRAP.md`) instead; its pre-implementation checklist supersedes the numbered list below for that class of task.

For genuinely new product surfaces, before implementation:

1. Complete the Engineering Bootstrap first — it is a precondition for this list, not a replacement for it.
2. Understand the four pillars and the current content-type list (see above).
3. Produce a complete information architecture.
4. Produce a complete content strategy.
5. Produce a complete design strategy.
6. Produce a technical implementation roadmap.
7. Wait for approval.

Implementation begins only after planning is approved.
