# .hubzero

`.hubzero` is the published knowledge layer of HubZero Core.

Every HubZero product repository contains a synchronized copy of this directory. It exists to guide both AI collaborators and engineers by providing HubZero-specific engineering knowledge, design philosophy, architectural direction, and implementation guidance — regardless of what the product is.

This directory is intentionally documentation-only.

It does **not** contain production code, components, assets, or framework implementations.

## Purpose

Modern AI models already understand programming languages, frameworks, accessibility, performance, and general software engineering best practices.

`.hubzero` exists only to provide knowledge they do **not** already possess:

- HubZero's design philosophy.
- HubZero's architectural thinking.
- HubZero's engineering principles.
- HubZero's discoverability strategy.
- HubZero's review criteria.
- HubZero's decision-making process.

If a document only repeats knowledge already available to modern coding models, it does not belong in `.hubzero`.

## Ownership

`.hubzero` is owned exclusively by **HubZero Core**.

Product repositories receive synchronized copies of this directory.

Engineers working inside a product repository should **never** manually modify files within `.hubzero`.

Changes must always originate from the HubZero Core repository so every product shares the same engineering foundation.

## Philosophy

HubZero standardizes engineering, not creativity.

The purpose of `.hubzero` is to ensure that every product is built with consistent engineering quality while allowing every product to develop its own visual identity, personality, and design system appropriate to its users.

Two HubZero products should never feel like variations of the same thing simply because they share an origin.

The only characteristic every HubZero product should consistently share is **elegance**.

## Using `.hubzero`

AI collaborators should treat `.hubzero` as the canonical source of HubZero knowledge.

Before making architectural, design, or engineering decisions, consult the relevant documentation contained within this directory.

Do not duplicate or reinterpret these documents unless explicitly instructed.

When HubZero guidance conflicts with generic implementation preferences, prefer HubZero guidance unless the user explicitly requests otherwise.

For framework usage, implementation details, accessibility, security, or other general software engineering topics, rely on your native capabilities unless `.hubzero` intentionally overrides them.

## Directory Structure

- `principles.md` — The canonical engineering principles. Every other document assumes this rather than restating it.
- `agents/` — Guidance for AI collaborators: planning, implementation, engineering review, and design review.
- `architecture/` — Universal architecture principles that apply across every HubZero product type.
- `design/` — Design principles, motion, navigation, and mobile experience guidance.
- `seo/` — Discoverability principles and product-oriented strategy documents.
- `polish/` — The Product Polish standard: the final subjective quality bar every released product must meet.
- `release/` — The canonical release checklist.

Additional directories may be introduced as HubZero Core evolves, provided they contribute HubZero-specific knowledge rather than generic technical documentation.

## Guiding Principle

Every document inside `.hubzero` should answer one question:

> **"Does this teach an AI or engineer something uniquely valuable about how HubZero builds software?"**

If the answer is **no**, the document does not belong here.

## Release Standards

Every HubZero product must pass the canonical release process before publication.

The release process is defined in:

.hubzero/release/RELEASE_CHECKLIST.md

This document is part of HubZero Core and must never be modified by AI agents or product engineers.

All release verification should be performed against this checklist.
