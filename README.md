# HubZero

HubZero is a small, founder-led engineering studio building software and hardware-adjacent
products for businesses that need both. This repository is the production Next.js application —
marketing site, blog, and internal CMS — currently under active rebuild as **HubZero v2**.

The full product/technical specification lives in [`ARCHITECTURE/`](./ARCHITECTURE) and is treated
as the source of truth for every implementation decision. Start with
[`ARCHITECTURE/00_FOUNDER_APPROVAL.md`](./ARCHITECTURE/00_FOUNDER_APPROVAL.md) and
[`ARCHITECTURE/14_IMPLEMENTATION_ROADMAP.md`](./ARCHITECTURE/14_IMPLEMENTATION_ROADMAP.md).

## Repository layout

- `src/` — the v2 application (this README's `npm` scripts operate on this).
- `ARCHITECTURE/` — the 14-document product/technical specification for v2.
- `client/` — the **legacy** Next.js implementation. Read-only, kept for feature/content
  reference only until cutover (`ARCHITECTURE/14_IMPLEMENTATION_ROADMAP.md` Phase 7). Do not build
  new work here.
- `docs/` — supporting research (team planning survey responses, etc.).
- `ARCHIVED_PROJECT_ANALYSIS.md` — historical audit of the legacy site; several of its findings are
  carried forward into `ARCHITECTURE/` as must-fix rules.

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
