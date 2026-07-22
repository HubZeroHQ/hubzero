# HubZero Public Website

The public HubZero site and the Studio CMS that publishes it, in one Next.js application.

---

## Overview

This repository contains HubZero's public-facing website and the first-party Studio CMS used to author everything it publishes. The two are one deployable application: Studio is the authoring surface at `/studio`, and the public routes render what Studio has published.

The site organizes HubZero's engineering output around four permanent collections — Work, Builds, Blueprints, and Labs — alongside Notes, Engineering Profiles, Services, and a Contact surface. Every public page is a read view over Studio content; nothing on the public site is hand-authored inside a component.

It intentionally does not contain a separate CMS backend, a third-party content platform, or a marketing/growth stack.

---

## Features

- **Four permanent content pillars** — Work (client engineering), Builds (internal products), Blueprints (reusable foundations), and Labs (active investigations) — plus Notes, Engineering Profiles, and Services.
- **Studio CMS** — a Draft → In Review → Approved → Published → Archived workflow, a block-based Document Engine, typed relationships between collections, a shared media library, and taxonomy.
- **Public DTO layer** — a single fail-closed visibility predicate and field-level read contracts stand between Studio's write model and every public route.
- **AI-assisted authoring** — provider-abstracted content generation with strict input validation, untrusted-data isolation, and per-user rate limiting.
- **Role-based access** — authentication and permissions via NextAuth, scoped to Studio.
- **Structured discoverability** — sitemap, robots, Open Graph metadata, and a web manifest, gated behind a release flag until content is launch-ready.

---

## Architecture

The site is a single Next.js (App Router) application written in TypeScript, styled with Tailwind CSS, and rendered with React.

Content lives in MongoDB and is authored through Studio. Public routes never query the database directly for editorial data — they read through a **Public DTO layer**: a set of field-level, implementation-agnostic contracts derived from Studio records, resolved behind one shared visibility predicate. This keeps the public surface stable even as the Studio data model evolves, and keeps unpublished or restricted content structurally unreachable from public code paths.

The architecture is content-driven throughout: routes, navigation, and metadata are all derived from what Studio has published, not hardcoded per page.

---

## Repository Structure

```
src/
  app/            Route handlers: the public site, the Studio CMS, and API routes.
  components/     UI components, split by surface (public, studio, documents, media, ui).
  lib/            Core logic: database access, auth, AI, documents, public reads, search.
  config/         Static configuration: permissions, workflow, taxonomy, navigation.
docs/             Architecture, design, product, and operations documentation.
scripts/          Explicit administrator bootstrap utilities.
public/           Static assets served from the web root.
.hubzero/         Shared HubZero engineering knowledge base, synced from HubZero Core.
```

---

## Documentation

Architecture, design, product, and operations documentation lives in [`docs/`](docs/README.md). Start there rather than in this file — this README stays high-level by design.

---

## Development

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build

# Typecheck
npm run typecheck

# Lint
npm run lint

# Run tests
npm run test
```

Copy `.env.example` to `.env.local` and provide values for MongoDB, authentication, Cloudinary, and the AI provider before running the app.

---

## Content

Public pages do not embed content directly. Every collection — Work, Builds, Blueprints, Labs, Notes, Engineering Profiles, Services — is authored in Studio and rendered through the public DTO layer described above.

---

## Deployment

This is a standard Next.js application: `npm run build` produces a production build, and `npm run start` serves it. The runtime requires the environment variables listed in `.env.example` (database, authentication, media, and AI provider credentials) to be configured wherever it is deployed.

---

## License

This repository is private and unlicensed for external use.
