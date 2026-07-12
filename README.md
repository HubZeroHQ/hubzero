# HubZero

HubZero is a small, founder-led engineering studio building software and hardware-adjacent
products for businesses that need both. This repository is the production Next.js application —
marketing site, Notes (engineering write-ups), and internal CMS — currently under active rebuild as **HubZero v2**.

> **⚠️ 2026-07-12 design reset:** the public marketing website direction (homepage, services/work/about/contact pages, navigation, hero, page structure, design system, roadmap) has been archived — see [`ARCHIVE/README.md`](./ARCHIVE/README.md). The new marketing-site direction starts fresh in [`DESIGN/NEXT`](./DESIGN/NEXT). The CMS/backend/admin architecture below is unaffected.

The technical/CMS specification lives in [`ARCHITECTURE/`](./ARCHITECTURE) and is treated
as the source of truth for backend/CMS implementation decisions. Start with
[`ARCHITECTURE/00_FOUNDER_APPROVAL.md`](./ARCHITECTURE/00_FOUNDER_APPROVAL.md).

## Repository layout

- `src/` — the v2 application (this README's `npm` scripts operate on this).
- `ARCHITECTURE/` — the active technical/CMS specification (backend, database, admin, CMS foundation, content model). The marketing-website-facing documents that used to live here have been archived — see [`ARCHIVE/README.md`](./ARCHIVE/README.md).
- `DESIGN/NEXT/` — the marketing-website redesign, starting fresh after the 2026-07-12 reset.
- `ARCHIVE/` — historical reference only: the archived marketing-website architecture and design documents.
- `client/` — the **legacy** Next.js implementation. Read-only, kept for feature/content
  reference only until cutover. Do not build new work here.
- `docs/` — supporting research (team planning survey responses, etc.).
- `ARCHIVED_PROJECT_ANALYSIS.md` — historical audit of the legacy site; several of its findings are
  carried forward into `ARCHITECTURE/` as must-fix rules.

## Legacy application

`client/` is the pre-v2 Next.js site and is temporarily retained during the migration for
feature/content reference. It is not built or deployed from this README's scripts and should not
receive new work — see `ARCHIVE/ARCHITECTURE/14_IMPLEMENTATION_ROADMAP.md` Phase 7 (archived) for the historical cutover plan.

## Tech stack

| Layer          | Choice                                             |
| -------------- | -------------------------------------------------- |
| Framework      | Next.js (App Router), React, TypeScript (strict)   |
| Styling        | Tailwind CSS v4, CSS-first design tokens           |
| Tooling        | ESLint (flat config), Prettier, Husky, lint-staged |
| Env validation | Zod                                                |

See `ARCHITECTURE/08_TECHNICAL_ARCHITECTURE.md` for the full stack decision and rationale
(database, auth, CMS, deployment).

## Getting started

```bash
npm install
cp .env.example .env.local

npm run dev
```

The app runs at `http://localhost:3000`.

## Scripts

| Script                                    | Purpose                |
| ----------------------------------------- | ---------------------- |
| `npm run dev`                             | Start the dev server   |
| `npm run build`                           | Production build       |
| `npm run start`                           | Run a production build |
| `npm run lint` / `npm run lint:fix`       | ESLint                 |
| `npm run format` / `npm run format:check` | Prettier               |
| `npm run typecheck`                       | TypeScript, no emit    |

A pre-commit hook (Husky + lint-staged) lints and formats staged files automatically.

## Docker

A production image is built from the standalone Next.js output:

```bash
docker build -t hubzero .
docker run -p 3000:3000 --env-file .env.local hubzero
```

## Contributing

This is an internal HubZero project. Branch from `main`, keep changes scoped to what
`ARCHITECTURE/` specifies for the phase in progress, and open a PR.
