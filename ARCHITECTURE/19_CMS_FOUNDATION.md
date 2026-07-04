# 19 — CMS Foundation

> **Status: Proposed — 2026-07-04, awaiting founder review.** This document is Phase 1 planning only — architecture, engineering design, and sequencing for the HubZero CMS. No implementation has started as a result of this document. It should be read and approved the way `17_COMPANY_STRUCTURE.md` was: as a real addition to the founder-approved spec set, not a draft that lives outside it.
>
> Decision convention: see `01_PRODUCT_VISION.md` §0 and `00_FOUNDER_APPROVAL.md`. Nothing here relitigates a decision already made in `08`, `09`, `11`, `12`, or `14` — those documents already decided *what* the CMS is (custom-built, MongoDB, responsibility-based RBAC, hybrid draft/publish workflow, the collection list). This document answers the question those four don't: *how is it actually built, concretely, file by file, so that Case Studies, Team, Labs, Builds, Blueprints, Blog, and every collection after them are additions to a system, not seven separate systems that happen to look similar.*

## 0. Where this sits relative to the existing codebase

Before proposing anything, it's worth being precise about what already exists, because the CMS is not being built on an empty repository — it's being built next to one real, shipped feature that already answers several of this document's questions in practice.

**What's already built (`dev`, per `PROJECT_CONTEXT.md` §6 and direct inspection):** the marketing site (Home, Services + Software + Hardware, Work + one case study, About, Contact), MongoDB Atlas connected, one working collection (`Lead`) with a Server Action, a Zod validation layer, and a Mongoose model. `package.json` has exactly three CMS-relevant dependencies beyond the framework itself: `mongoose`, `zod`, and Radix primitives (`@radix-ui/react-{checkbox,dialog,radio-group,select,switch}`) already backing the `src/components/ui/` primitives (`select.tsx`, `switch.tsx`, `checkbox.tsx`, etc.). **No auth library, no rich-text editor, no upload/storage library, no admin route exists yet.** This confirms `PROJECT_CONTEXT.md` §6's own read: Phase 0–1 of `14_IMPLEMENTATION_ROADMAP.md` (data layer, auth, RBAC, admin core) has not started, even though several public pages and one real collection already exist ahead of it.

**Why this matters for how this document is written:** the Lead implementation (`src/lib/db.ts`, `src/models/lead.ts`, `src/lib/lead-schema.ts`, `src/app/(marketing)/contact/actions.ts`) is not a prototype to discard — it is the first real data point for what "the CMS's engineering pattern" looks like in this codebase, built before this document existed. §12 below reviews it in detail. The short version: it's a good pattern, and this document's job is to *generalize* it into reusable infrastructure, not replace it.

---

## 1. Overall CMS architecture

**Recommendation: domain-based, with a thin generic engine underneath.** Not feature-based, not route-based, as those terms are usually meant — the right answer borrows from both without being purely either.

To be concrete about what each option would mean here:

- **Route-based** would mean organizing the CMS around `app/studio/**` URL structure as the primary organizing principle — a folder per screen, logic embedded in each route. This is what most people mean by "just use the App Router's file structure as the architecture." Rejected as the *primary* structure because it conflates two different lifecycles: a route changing (e.g. renaming `/studio/case-studies` to `/studio/work`) shouldn't require touching business logic, and business logic changing (a new field on Case Study) shouldn't require touching routing.
- **Feature-based** would mean organizing around cross-cutting features — "the approval workflow feature," "the media feature," "the search feature" — each owning its own slice of every collection it touches. Rejected as the primary structure because HubZero's collections (§2 below, eleven of them) are the actual unit the founder and future editors think in ("go edit a Case Study," never "go use the approval-workflow feature") and because a feature-based split would scatter one collection's logic (its schema, its form, its table columns, its permissions) across half a dozen feature folders — the opposite of what makes a new collection cheap to add.
- **Domain-based** means each collection (Case Study, Team Member, Lead, Blog Post, …) is a self-contained domain module: its schema, its Zod validation, its form field config, its table column config, its permission rules, and its Server Actions all live together, under one name, in one place. This matches how the founder and any future editor will actually reason about the system ("I need to add a field to Blueprints" → one file, not a scavenger hunt).

**But a pure domain-based split, done naively, produces exactly the copy-paste problem `09_CMS_ARCHITECTURE.md` §1 already warns against** ("Mature, battle-tested libraries are reused for generic infrastructure only... all business logic... hand-built" — the corollary is that the *hand-built* part must not be hand-built eleven times). The resolution: a **generic CRUD/table/form engine (§5–7) that is feature-based in spirit — one implementation of "list + filter + paginate," one implementation of "form + validate + autosave," one implementation of "draft → review → publish → version" — consumed by every domain module through a declarative config object, not reimplemented per collection.**

So, precisely: **the engine is feature-based (one implementation per cross-cutting concern), and the collections that use it are domain-based (one module per content type, each supplying a config to the engine).** This is not a compromise between the two models — it's the standard way mature admin systems (Django admin, Rails ActiveAdmin, Payload, Strapi) actually resolve this exact question, applied to a hand-built system instead of a configured one, which is consistent with the founder's explicit direction in `00_FOUNDER_APPROVAL.md` §3.

**Why this, and not a third-party admin generator.** `00_FOUNDER_APPROVAL.md` §3 already decided against Payload/Sanity as the CMS *engine*. The same reasoning applies one level down to admin-generator libraries (react-admin, Refine, AdminJS): they'd solve exactly the problem §5–7 solve, faster — at the cost of coupling HubZero's specific RBAC model, its specific version-history semantics, and its specific per-pillar composition needs (recall `DESIGN/00_AI_DESIGN_GUIDE.md` §6's insistence that Builds/Labs/Blueprints each need genuinely distinct *public* compositions — the admin editors for them can and should share structure, but the underlying schema/workflow needs are HubZero-specific enough that a generic library would need to be fought, not configured, within a month). The generic engine proposed here is deliberately small — a few hundred lines of table/form/CRUD plumbing, not a framework — sized to what an eleven-collection, single-admin-team CMS actually needs, not to what a multi-tenant SaaS admin product would need.

---

## 2. Authentication

**Library: Auth.js (NextAuth v5) with the Credentials provider.** Not a managed provider (Clerk, WorkOS) — there's no per-seat pricing justification for a five-person internal tool, and `12_ADMIN_PANEL_SPECIFICATION.md` §5 already specifies "no public self-registration... accounts are created by a Head Admin," which is a Credentials-provider shape, not an OAuth/social-login shape. Auth.js is the right amount of "reuse a mature library for generic infra" per `09_CMS_ARCHITECTURE.md` §1 — it handles cookie signing, CSRF, session serialization correctly; it does not require adopting its database session model if that model doesn't fit (see below).

**Session strategy: signed JWT in an httpOnly cookie, not database sessions.** This is a real tradeoff, stated plainly rather than defaulted into:

- Auth.js's official MongoDB adapter (`@auth/mongodb-adapter`) uses the native MongoDB driver directly, not Mongoose — running it alongside Mongoose (already the app's ODM for every other collection) means two different MongoDB client instances and two different modeling conventions for auth-related data alone. That's a real cost for a five-person team's login system.
- A JWT session avoids that entirely: the session payload (`userId`, `role`, `dynamicPermissions`, `linkedTeamMemberId`) is encrypted into the cookie itself; every request decrypts it with no database round-trip. Simpler, and consistent with treating the CMS as a small internal tool, not a system that needs to scale session storage.
- **The real cost of JWT sessions is revocation** — you can't instantly kill a live session by deleting a database row. Mitigation: a `sessionVersion: number` field on the `User` document, embedded in the JWT at sign-in and checked on every session read (Auth.js's `session` callback re-reads the user's current `sessionVersion` from MongoDB and invalidates the JWT if it doesn't match). Bumping `sessionVersion` — on password change, on role change, or via a Head Admin "sign this user out everywhere" action — forces re-authentication without needing a session-storage layer for the common case. This does mean one MongoDB read per session check, which is the honest price of the simpler architecture; at this scale (a handful of concurrent admin users, not a public-facing session load) that's the right tradeoff, not a performance risk.
- Session lifetime: short-lived JWT (e.g. 8 hours) with silent refresh on activity, not a long-lived "remember me" token for an admin panel handling lead/contact data and (eventually) draft business content.

**Password hashing: bcrypt via `bcryptjs`**, not Argon2. Argon2's reference implementations need native bindings (`argon2` npm package compiles a native addon), which is friction on some deployment targets and entirely unnecessary friction for a login system serving a handful of internal accounts. `bcryptjs` is pure JavaScript, has no native-compile step, and at a cost factor of 12 is more than adequate for this threat model (a handful of accounts, no public registration surface to credential-stuff). This is exactly the kind of decision `08_TECHNICAL_ARCHITECTURE.md` §9's "passwords always securely hashed" requirement calls for — correctly implemented, not maximally exotic.

**Login flow:**
1. `/studio/login` — a Server Component page with a client form (`useActionState`, the same pattern already established by `contact-form.tsx` — see §12), never a client-fetched API call.
2. Submitting calls Auth.js's `signIn("credentials", { email, password })`.
3. The Credentials provider's `authorize` callback: look up `User` by email, `bcrypt.compare` the password, and — critically — check the account isn't a `TeamMember`-only record with no login (per `11_DATABASE_ARCHITECTURE.md` §1's note that "not every TeamMember has a login"). On success, return the minimal claims (`id`, `role`, `dynamicPermissions`, `sessionVersion`).
4. Auth.js's `jwt` callback embeds those claims into the token; the `session` callback re-validates `sessionVersion` against the database on read (above).
5. Redirect to `/studio` (or the originally-requested protected path — see middleware below) on success; a generic "incorrect email or password" error on failure — **never** reveal which of the two was wrong, standard credential-enumeration hygiene.

**Logout flow:** `signOut()` server action, clearing the session cookie; no server-side session-store cleanup needed given the JWT strategy. Redirects to `/studio/login`.

**Middleware:** `middleware.ts` at the repo root intercepts every `/studio/**` request except `/studio/login`, decodes the session JWT (Auth.js's edge-compatible `auth()` helper), and redirects unauthenticated requests to `/studio/login?from=<original path>`. This is a coarse gate — "is anyone logged in at all" — not the place fine-grained RBAC lives (see §3): middleware runs on the Edge runtime, where a MongoDB round-trip per request is exactly the kind of latency/cost tax to avoid, so it checks only the JWT's own validity and `sessionVersion` claim shape, not a live database permission lookup.

**Protected routes:** every route under `app/studio/**` (§4) is implicitly protected by the middleware pattern above. Defense in depth: each route's Server Component **also** calls a `requireRole(...)` helper (§3) at the top of the page/layout, so a route is never accidentally exposed by a middleware matcher misconfiguration alone — this mirrors the existing codebase's own instinct (Zod validation exists at the client, the Server Action, *and* the Mongoose schema layer for Lead — see §12) of not trusting a single enforcement point for anything security-relevant.

---

## 3. Authorization

**RBAC engine: a single declarative permission table, not per-route `if` statements scattered through the codebase.** `09_CMS_ARCHITECTURE.md` §4 already specifies the shape (Head Admin / Admin / Teammate, plus dynamic permissions like Team Lead) — this section specifies how that shape becomes enforceable code that doesn't need to be redesigned every time a new dynamic permission (Blog Reviewer, Recruiter, …) is added, which `00_FOUNDER_APPROVAL.md` §3 explicitly requires.

```ts
// lib/cms/permissions.ts
type Role = "head_admin" | "admin" | "teammate";
type Action = "view" | "create" | "edit" | "editOwn" | "publish" | "approve" | "delete" | "manageUsers";
type Resource = "caseStudy" | "build" | "labsProject" | "blueprint" | "teamMember"
  | "testimonial" | "service" | "blogPost" | "faq" | "careerListing" | "lead" | "siteSettings";

// The single source of truth. Adding a role or a resource is a data change here,
// not a new code path anywhere else in the app.
const roleGrants: Record<Role, Partial<Record<Resource, Action[]>>> = {
  head_admin: { /* everything, every resource — expressed once via a wildcard helper */ },
  admin: {
    caseStudy: ["view", "create", "edit", "publish", "delete"],
    build: ["view", "create", "edit", "publish", "delete"],
    // ...
    teamMember: ["view", "editOwn"], // "cannot edit another user's individual portfolio" — 00_FOUNDER_APPROVAL §3
    blogPost: ["view", "create", "editOwn", "approve", "publish"],
  },
  teammate: {
    teamMember: ["view", "editOwn"],
    blogPost: ["view", "create", "editOwn"], // no "publish" — must go through approval
  },
};

// Dynamic permissions are additive grants layered on top of a role's base grants —
// exactly the "assignable/removable permission, not a new role" model 09_CMS_ARCHITECTURE §4 requires.
const dynamicPermissionGrants: Record<string, Partial<Record<Resource, Action[]>>> = {
  team_lead: { /* project-tracking-specific grants, once that collection exists */ },
  // future: blog_reviewer, recruiter, hr, finance, sales, client_manager, moderator, ...
  // added here — a data change, never a redesign, per 00_FOUNDER_APPROVAL §3's explicit requirement
};

export function can(user: SessionUser, action: Action, resource: Resource, target?: { createdBy?: string }): boolean {
  const grants = [...(roleGrants[user.role][resource] ?? []),
                   ...user.dynamicPermissions.flatMap(p => dynamicPermissionGrants[p]?.[resource] ?? [])];
  if (grants.includes(action)) return true;
  if (action === "edit" && grants.includes("editOwn")) return target?.createdBy === user.id;
  return false;
}
```

This single function is called in exactly three places for any given operation, never more and never fewer: **(1)** the Server Action that performs the mutation (the only enforcement point that actually matters — everything else is UX), **(2)** the page/layout Server Component that decides whether to render the screen at all, and **(3)**, optionally, inline in the UI to hide/disable controls a user can't use (a UX nicety, never a security boundary on its own — the Server Action check is what actually protects the data). This three-place pattern is itself part of the generic engine (§5) — a collection config declares its resource name, and the CRUD action generator wires all three checks automatically, so a new collection doesn't require re-deriving this pattern.

**Object-level permissions** (Admin can edit only their *own* individual portfolio, not another Admin's) are handled by the `editOwn` action + `createdBy` ownership check above, not by a separate mechanism — this keeps the permission model to one shape (role/dynamic-permission → resource → action) rather than two (a role model plus a bolted-on ownership model).

**How this scales to future roles/permissions without redesign** (the explicit requirement in `00_FOUNDER_APPROVAL.md` §3): a new dynamic permission is a new key in `dynamicPermissionGrants` plus a UI affordance in the Users screen to assign/remove it — no changes to `can()`, to any Server Action, or to any collection config. A genuinely new *role* (unlikely, given the founder's explicit three-tier decision, but worth designing for) is a new key in `roleGrants`. Neither requires touching the eleven collection modules that call `can()`.

---

## 4. Folder structure

```
app/
├── (marketing)/                    # existing — unchanged by this document
├── studio/                         # the admin panel, auth-gated by middleware.ts
│   ├── login/
│   │   └── page.tsx
│   ├── layout.tsx                  # auth check, role-aware nav shell, session provider
│   ├── page.tsx                    # dashboard (§10)
│   ├── leads/
│   │   ├── page.tsx                # list (uses the generic DataTable, §7)
│   │   └── [id]/page.tsx           # detail/status-update (no draft/publish workflow — see §12)
│   ├── case-studies/
│   │   ├── page.tsx                # list
│   │   ├── new/page.tsx            # create
│   │   └── [id]/page.tsx           # edit
│   ├── builds/                     # same three-route shape
│   ├── labs/                       # same three-route shape, plus a "mark as graduated" action
│   ├── blueprints/                 # same three-route shape
│   ├── team/                       # same three-route shape
│   ├── testimonials/
│   ├── services/
│   ├── blog/
│   ├── faqs/
│   ├── careers/
│   ├── settings/
│   │   └── page.tsx                # single-document editor, Head Admin only
│   └── users/
│       ├── page.tsx                # Head Admin only
│       └── [id]/page.tsx
└── api/
    └── auth/[...nextauth]/route.ts  # Auth.js's own required Route Handler — the one
                                      # legitimate Route Handler this system needs beyond
                                      # existing webhook/RSS cases, per 08_TECHNICAL_ARCHITECTURE §2

components/
├── admin/
│   ├── data-table/                 # the generic table engine (§7): DataTable, columns,
│   │                                 pagination, filter-bar, bulk-action-bar, empty-state
│   ├── form/                       # the generic form engine (§6): CmsForm, field renderers
│   │                                 (text, richtext, select, image-picker, tag-input, status-select)
│   ├── media/                      # media library grid, uploader, media-picker modal
│   ├── version-history/            # version list, diff view, restore confirmation
│   ├── layout/                     # studio shell: sidebar nav (role-filtered), topbar, breadcrumb
│   └── dashboard/                  # dashboard widgets (§10) — kept deliberately small
│
lib/
├── cms/
│   ├── permissions.ts              # §3 — can(), roleGrants, dynamicPermissionGrants
│   ├── collection-config.ts        # §5 — the CollectionConfig type + defineCollection() helper
│   ├── crud-actions.ts             # §5 — createCrudActions(config) generator
│   ├── version-history.ts          # §9 — snapshot-on-publish, diff, restore
│   ├── media.ts                    # §8 — upload pipeline, storage adapter interface
│   └── auth.ts                     # Auth.js config (providers, callbacks, session shape)
├── db.ts                           # existing — unchanged
├── env.ts                          # existing — extended with AUTH_SECRET, MONGODB_URI (already
│                                     read directly in db.ts; see §12 for the one recommended change)
└── utils.ts                        # existing — unchanged

models/
├── lead.ts                         # existing — unchanged (see §12 for why it stays as-is)
├── user.ts                         # new — 11_DATABASE_ARCHITECTURE §1's User shape
├── case-study.ts
├── build.ts
├── labs-project.ts
├── blueprint.ts
├── team-member.ts
├── testimonial.ts
├── service.ts
├── blog-post.ts
├── faq.ts
├── career-listing.ts
├── site-settings.ts
├── version-history.ts
├── media.ts
└── shared/
    └── workflow-fields.ts          # the reusable `status`/`version`/`publishedAt`/`createdBy`
                                      # Mongoose sub-schema mixin every versioned collection
                                      # composes in — see §5's "avoid copy-paste" goal applied
                                      # at the schema layer, not just the CRUD layer

actions/
├── (marketing)/contact/actions.ts  # existing — unchanged
└── studio/
    ├── case-studies.ts             # thin: `export const { list, create, update, remove,
    │                                  submitForReview, publish } = createCrudActions(caseStudyConfig)`
    ├── builds.ts                   # same shape
    ├── ...                         # one file per collection, each a few lines — the generic
    │                                  engine is doing the work; these files exist so Next.js's
    │                                  "use server" file-boundary convention is respected per
    │                                  collection, not so each file reimplements CRUD
    └── users.ts                    # invite/role-assignment, Head Admin only

hooks/
├── use-cms-table.ts                 # URL-search-param-driven sort/filter/page state (§7)
├── use-autosave.ts                  # debounced autosave (§6)
└── use-can.ts                       # client-side `can()` check for conditionally rendering
                                       # controls — reads role/permissions from the session
                                       # context provider, never re-derives them

providers/
└── session-provider.tsx             # wraps Auth.js's SessionProvider; the one new provider
                                       # this document introduces (existing: theme-provider.tsx)

types/
└── cms.ts                           # CollectionConfig, FieldConfig, TableColumn,
                                       # SessionUser — the shared type vocabulary the engine
                                       # and every collection config are written against

utils/
└── (existing src/lib/utils.ts covers this — no separate utils/ folder introduced;
    see the note in §5 on not creating a folder for its own sake)
```

**Why `actions/studio/*.ts` and not colocating each collection's actions inside `app/studio/<collection>/actions.ts`:** Next.js allows either. This document recommends a top-level `actions/` folder (rather than scattering `actions.ts` files through `app/studio/**`) for one reason: several future consumers of a collection's CRUD actions are not routes under `/studio` at all — the public `/work/[slug]` page needs `getPublishedCaseStudy(slug)`, and that read belongs next to the same collection's write actions, not duplicated. A `lib`/`actions` split by concern (not by route) keeps that read-path/write-path pairing honest. This is a genuine, if minor, deviation from the existing `app/(marketing)/contact/actions.ts` colocation pattern — justified because Contact's action has no public-read counterpart to pair with (a Lead is never displayed back to the public), while every CMS-authored collection does.

---

## 5. Generic CRUD architecture

The core abstraction is a **collection config** — one object per collection that declares everything generic about it, consumed by a small number of engine functions that do the actual work.

```ts
// lib/cms/collection-config.ts
interface CollectionConfig<T> {
  resource: Resource;                    // matches permissions.ts's Resource union
  model: Model<T>;                       // the Mongoose model
  zodSchema: ZodSchema;                  // shared create/edit validation
  workflow: "none" | "draft-publish" | "draft-review-publish"; // Lead uses "none"; most
                                          // collections use "draft-review-publish" per
                                          // 09_CMS_ARCHITECTURE §3's hybrid model
  listColumns: TableColumn<T>[];         // §7
  filters: FilterConfig[];               // §7
  formFields: FieldConfig[];             // §6
  searchableFields: (keyof T)[];
  revalidatesPaths?: (doc: T) => string[]; // e.g. ["/work", `/work/${doc.slug}`] on publish
}

export function defineCollection<T>(config: CollectionConfig<T>): CollectionConfig<T> {
  return config; // exists for type inference ergonomics, not runtime behavior — the same
                 // reason `defineConfig()` helpers exist in Vite/Next/etc.
}
```

```ts
// lib/cms/crud-actions.ts
export function createCrudActions<T>(config: CollectionConfig<T>) {
  async function list(searchParams: TableSearchParams) { /* pagination + filter + sort,
    generic across every collection using config.listColumns/filters — see §7 */ }

  async function getOne(id: string) { /* ... */ }

  async function create(formData: FormData) {
    const user = await requireSession();
    if (!can(user, "create", config.resource)) throw new ForbiddenError();
    const parsed = config.zodSchema.safeParse(rawFromFormData(formData));
    if (!parsed.success) return { status: "error", fieldErrors: flattenZodErrors(parsed.error) };
    const doc = await config.model.create({ ...parsed.data, createdBy: user.id, status: "draft" });
    return { status: "success", id: doc._id };
  }

  async function update(id: string, formData: FormData) { /* same shape: auth → validate →
    ownership check for editOwn → write → (if workflow !== "none") no version snapshot yet,
    drafts aren't versioned, only publishes are, per §9 */ }

  async function submitForReview(id: string) { /* draft → review, only if config.workflow
    includes a review step */ }

  async function publish(id: string) {
    const user = await requireSession();
    if (!can(user, "publish", config.resource)) throw new ForbiddenError();
    const doc = await config.model.findById(id);
    await snapshotVersion(config.resource, doc);           // §9 — before, not after, the mutation
    doc.status = "published"; doc.publishedAt = new Date(); doc.version += 1;
    await doc.save();
    for (const path of config.revalidatesPaths?.(doc) ?? []) revalidatePath(path); // §1/§9's
                                                                                     // ISR-on-publish rule
    return { status: "success" };
  }

  async function remove(id: string) {
    const user = await requireSession();
    if (!can(user, "delete", config.resource)) throw new ForbiddenError();
    await requireNoBlockingReferences(config.resource, id);  // 11_DATABASE_ARCHITECTURE §2's
                                                               // "never a silent dangling reference"
    await config.model.findByIdAndDelete(id);
  }

  return { list, getOne, create, update, submitForReview, publish, remove };
}
```

**Forms, tables, filters, pagination, search, status, modals, delete flow, confirmation — how each maps onto this:**

- **Forms** are driven by `config.formFields` (§6) — the `create`/`update` actions above are already generic; only the *field list* differs per collection.
- **Tables** are driven by `config.listColumns` + `config.filters` (§7) — `list()` above is generic; only *which columns and filters exist* differs per collection.
- **Pagination and search** are a single implementation inside `list()` (cursor-based pagination on `_id`/`createdAt`, since offset pagination degrades on large collections and MongoDB cursors are the idiomatic fit) plus a `$text` index built from `config.searchableFields` — declared once per collection, implemented once in the engine.
- **Status/workflow** is the `workflow` field on the config — `"none"` (Lead — a status field exists but it's a triage state, not a publish workflow, see §12), `"draft-publish"` (lower-risk collections: Team, Services, FAQs, Testimonials, Labs, Career Listings — matches `09_CMS_ARCHITECTURE.md` §4's "simpler draft/publish, no approval step" tier), or `"draft-review-publish"` (Case Studies, Builds, Blueprints, Blog Posts — the approval-gated tier). The engine renders the correct status control and exposes the correct actions (`submitForReview`/`publish` vs. just `publish`) based on this one field — a collection never hand-builds its own status machine.
- **Modals and confirmation dialogs** (delete, publish, restore-version) are one shared `<ConfirmDialog>` component (Radix `Dialog`, already a dependency) parameterized by title/body/confirm-label/destructive-boolean — used identically whether the thing being confirmed is "delete this Blueprint" or "restore this version," because the interaction pattern (a destructive or state-changing action needs an explicit second click) doesn't vary by collection.

This is the concrete mechanism behind "avoid copy-paste" — the eleven `actions/studio/*.ts` files in §4 are each a few lines of `createCrudActions(config)` re-export, not eleven reimplementations of validate/authorize/persist/revalidate.

---

## 6. Shared form system

**No new form library** (react-hook-form, Formik) — the existing pattern in `contact-form.tsx`/`actions.ts` (Server Actions + `useActionState` + Zod `safeParse`, controlled inputs that preserve typed values across a failed submit) already solves the exact problem a form library exists to solve, with zero added dependency weight, and the CMS should extend that pattern rather than introduce a second one alongside it.

- **Validation:** `config.zodSchema`, shared across the create action, the update action, and (for client-side inline validation, e.g. "message too short") the form component itself — the same "single source of truth" principle `lead-schema.ts` already documents in its own file header.
- **Default values:** a collection's Mongoose schema already declares defaults (`status: "draft"` default, etc.); the create form simply doesn't render a value for fields with a schema default, and the engine passes `{}` rather than re-declaring defaults a second time in the form config.
- **Editing vs. creation:** one `<CmsForm config={fields} initialValues={doc}>` component for both — `initialValues={}` for create, `initialValues={existingDoc}` for edit. Not two components, since the field set and validation are identical; only whether a document already exists differs, and that's a prop, not an architectural fork.
- **Autosave:** `useAutosave(formState, { intervalMs: 30_000, onBlur: true })` — a hook that debounces a call to a lightweight `autosaveDraft` action (writes the current form state to the document without touching `status`/`version`/triggering any workflow transition or revalidation) and exposes a `"saved" | "saving" | "error"` indicator, matching `12_ADMIN_PANEL_SPECIFICATION.md` §4's "visible 'saved' indicator" requirement exactly. Autosave never auto-publishes and never auto-submits-for-review — it only ever persists the draft's current field values, which is the safe, boring behavior an editor actually wants from autosave.
- **Draft handling:** a draft is just a document with `status: "draft"` — there is no separate "drafts" collection or table. This deliberately avoids the complexity of a shadow/staging document model; `09_CMS_ARCHITECTURE.md` §3's version-history requirement is what protects a published document from a bad draft edit (see §9), not a separate drafts table.
- **Error handling:** field-level errors render inline next to the relevant input (already the `contact-form.tsx` pattern via `LeadFieldErrors`); a form-level error (e.g. a database write failure) renders as a dismissible banner above the form. Both states flow through the same `useActionState` result shape every CMS form action returns, so the form-rendering component doesn't need to know which collection it's editing to know how to display an error.

**Field types the engine needs to support**, driven by `FieldConfig.type`: `text`, `textarea`, `richtext` (see below), `select`, `multiselect` (tag arrays like `techTags`), `image` (single, via the media picker — §8), `imageArray`, `boolean` (Radix `Switch`, already a dependency and already used for `isCoreMember`-style toggles), `reference` (a searchable select bound to another collection, e.g. `BlogPost.authorId` → `TeamMember`), `date`, `url`, `status` (the workflow-aware control from §5). Eleven collections' worth of fields are all instances of this fixed vocabulary — no collection should need a genuinely new field type; if one seems to, that's a signal to check whether the content type is actually well-modeled first (the same discipline `17_COMPANY_STRUCTURE.md` §7 applies to proposing a new pillar, applied here to proposing a new field primitive).

**Rich text:** a single markdown/MDX-shortcut editor (per `09_CMS_ARCHITECTURE.md` §5) used for every `RichText` field across every collection — `CaseStudy.problem/approach/result`, `BlogPost.body`, `LabsProject.description`, etc. One library decision here, reused everywhere, is what makes `09_CMS_ARCHITECTURE.md` §6's "one rendering pipeline for editor preview and published output" achievable in practice — a second rich-text editor anywhere would reintroduce the exact legacy bug (`ARCHIVED_PROJECT_ANALYSIS.md` §16 #9) this system exists to prevent.

---

## 7. Shared table system

One `<DataTable config={listColumns} data={...} />` component, parameterized entirely by config, used for every collection's list screen.

- **Sorting:** column-header click toggles sort direction; sort state lives in the URL (`?sort=createdAt&dir=desc`), not component state — so a bookmarked/shared list-view URL reproduces the exact same view, and the back button works correctly. `use-cms-table.ts` (§4) is the shared hook that reads/writes this URL state.
- **Pagination:** cursor-based (§5), with "Next"/"Previous" controls rather than numbered pages — numbered pages imply a stable total count, which is more expensive to compute correctly on every request than the product need justifies at this content volume (`11_DATABASE_ARCHITECTURE.md` §5's own indexing choices already anticipate cursor-style "published, newest first" queries).
- **Filtering:** `config.filters` declares which fields are filterable and how (`select` for `status`/`practiceArea`, `dateRange` for `createdAt`, `text` for a quick search) — filter state also lives in the URL, for the same shareable-link reason as sort.
- **Bulk actions:** row-selection checkboxes (Radix `Checkbox`, already a dependency) plus a bulk-action bar that appears once ≥1 row is selected — scoped deliberately narrow for v1: bulk delete (with the same `ConfirmDialog` as single delete) and bulk status change, both routed through the exact same `crud-actions.ts` functions as the single-row versions, just called in a loop server-side inside one Server Action invocation (not N client-triggered requests).
- **Selection:** standard checkbox-per-row plus header "select all on this page" — deliberately not "select all matching filter across every page," which is a common source of accidental mass-mutation bugs in admin panels and not a real need at HubZero's content volume.
- **Responsive behaviour:** below a tablet breakpoint, the table collapses to a stacked card-per-row layout (each row's `listColumns` render as labeled key/value pairs instead of table cells) — this is a generic transformation the `DataTable` component performs once, not a per-collection responsive design task, consistent with `16_RESPONSIVE_DESIGN_STANDARDS.md`'s "each tier is its own composition" principle applied to a utility surface rather than an editorial one (the admin panel is explicitly the "utility-style UI" `PROJECT_CONTEXT.md` §4 already carves out as exempt from the editorial component-vocabulary override).
- **Loading states:** skeleton rows (`src/components/ui/skeleton.tsx` already exists) matching the shape of `listColumns`, shown during a pending navigation/filter-change — not a full-page spinner, so the table's structure doesn't visually jump.
- **Empty states:** `src/components/ui/empty-state.tsx` already exists — reused here with collection-specific copy (`config` supplies an `emptyStateMessage`), distinguishing "no items exist yet" from "no items match this filter" (the same honest-empty-state discipline `17_COMPANY_STRUCTURE.md` §5 already applies to the public site's nav rollout, applied here to the admin list screens).

---

## 8. Media strategy

- **Storage:** a **storage adapter interface** (`upload(file): Promise<{url, key}>`, `delete(key): Promise<void>`) with a **local-filesystem implementation as the v1 default**, consistent with `08_TECHNICAL_ARCHITECTURE.md` §8's self-hosted deployment model — files land in a directory outside `public/` (e.g. `storage/media/`, served through a Route Handler that streams the file with correct caching headers, not directly from `public/`, so access could later be gated or moved behind a CDN without changing the URL scheme the rest of the app references). The adapter interface is the actual deliverable here, not the local implementation — swapping to an S3-compatible provider later (see "Future CDN" below) means writing one new adapter, not touching any calling code.
- **Uploads:** a `<MediaPicker>` component used from any `image`/`imageArray` form field (§6) — either upload a new file or select an existing one from the library, so the same cover image isn't re-uploaded as a duplicate file every time it's reused (e.g. a Team Member's photo referenced from both their profile and a Blog Post's author byline).
- **Naming:** content-hash-based filenames (`sha256(file).slice(0, 16) + ext`) rather than the original filename or a random UUID — this makes re-uploading the exact same file a no-op (the hash already exists, return the existing record) and avoids both filename-collision bugs and the minor information leak of preserving a contributor's original local filename.
- **Optimization:** `sharp` (already the natural pairing with `next/image`, per `08_TECHNICAL_ARCHITECTURE.md` §7's existing decision to enable image optimization) runs at upload time, not at request time — generate a small set of fixed-width variants (e.g. 400/800/1600px, WebP) once, stored alongside the original, so the request path never re-encodes an image. A `Media` collection (`_id, key, originalName, mimeType, size, width, height, variants: {width, url}[], uploadedBy, createdAt`) stores this metadata; every `image`/`coverImage` field elsewhere in the schema stores a `Media._id` reference, not a raw URL string — this is what makes "which documents use this image" a real query (needed for the deletion-safety rule below), not a manual audit.
- **Deletion:** soft-delete by default (`Media.deletedAt` set, file retained) with a scheduled hard-delete only after confirming no collection document still references the `Media._id` — mirrors `11_DATABASE_ARCHITECTURE.md` §2's "never a silent dangling reference" rule, applied to media instead of `TeamMember`/`BlogPost` references. A media item still in use cannot be hard-deleted; the UI surfaces "used in: [list]" instead of allowing the delete.
- **Future CDN:** the adapter interface above is the entire mechanism — when HubZero's traffic or team size justifies it, add an S3-compatible adapter (Cloudflare R2 is a natural fit alongside the existing Cloudflare/NGINX deployment per `08_TECHNICAL_ARCHITECTURE.md` §8) and change one config value. No calling code, no schema, and no `next/image` loader configuration needs to change beyond that loader's own remote-pattern allowlist.

---

## 9. Version history

`11_DATABASE_ARCHITECTURE.md` §1 already specifies the `VersionHistory` shape (`{_id, collection, documentId, snapshot, editedBy, editedAt}`); this section specifies the mechanics `09_CMS_ARCHITECTURE.md` §3's "version history built from day one, for every content type" actually runs on.

- **When a snapshot is taken:** on every **publish**, not on every save/autosave. Snapshotting every autosave would flood `VersionHistory` with near-duplicate noise (an editor pausing mid-sentence shouldn't create a permanent version entry) and would blur "draft in progress" with "a real published revision," which is exactly the distinction `09_CMS_ARCHITECTURE.md` §3 draws by scoping version history to the *publish* action. The snapshot is taken of the document's state **immediately before** the publish mutation applies (see `publish()` in §5) — so a version entry always represents "what was live before this change," which is what a rollback actually needs to restore.
- **Drafts:** not versioned individually — a draft is provisional by definition (§6), and its safety net is that publishing always snapshots the prior published state, never that every intermediate draft edit is independently recoverable. If an editor needs to recover from a bad draft edit before publishing, that's what autosave's own interval provides a reasonable (if not infinite) undo window for — a deliberately simpler guarantee than full draft-level versioning, appropriate for a five-person team, not an enterprise multi-author system.
- **Publishing:** `publish()` (§5) is the one and only path that both creates a version snapshot and flips `status`/`version`/`publishedAt` — there is no second code path that publishes without versioning, because both actions live inside the same generic function every collection shares.
- **Restore:** restoring version N does **not** directly overwrite the live published document. It creates a new **draft** pre-filled with version N's snapshot content, which then goes through the normal publish (or draft-review-publish) path again. This is a deliberate choice: a direct overwrite-and-republish would bypass the approval step for company-wide content (`09_CMS_ARCHITECTURE.md` §3) on exactly the operation — reverting a possibly-controversial change — that most needs a second set of eyes. "Restore" in the UI reads as one click, but underneath it's "create a draft from this snapshot," which is both more honest about what's happening and consistent with every other write going through the same workflow gate. **[Implementation note, 2026-07-05 — see `18_ARCHITECTURE_CHANGELOG.md`'s Phase C entry]:** in this system's single-document model (§6 — no separate staging/drafts collection), restoring an already-*published* document's status back to `"draft"` will 404 its public page for the duration of the review window, once a public page dynamically reads `status: "published"` from this collection (not yet true for Case Study — see the changelog entry). Confirm this is the intended tradeoff before that public page ships.
- **Audit history / diff view:** the version list for any document shows every past `VersionHistory` entry (timestamp, editor name — `12_ADMIN_PANEL_SPECIFICATION.md` §4) with a diff view comparing two snapshots (or a snapshot against the current live document) field-by-field — a generic JSON-diff renderer (no collection-specific diff logic needed, since every snapshot is already a plain object matching the collection's schema shape).
- **Pruning:** `VersionHistory` will grow unboundedly if never pruned — flagged here as a real operational concern (see §13), not solved by this document. A reasonable default once volume becomes a real cost: retain all versions for the first year, then collapse to monthly snapshots for anything older, mirroring how the backup policy in `08_TECHNICAL_ARCHITECTURE.md` §9 already thinks about retention tiers. Not needed at launch volume; worth deciding *before* it becomes a storage-cost surprise, not after.

---

## 10. Dashboard

Kept deliberately small, per this document's brief and `12_ADMIN_PANEL_SPECIFICATION.md` §2's own "at-a-glance" framing — a dashboard that tries to be a BI tool for a five-person team is solving a problem HubZero doesn't have yet.

**What it should contain, and why each item earns its place:**

1. **New leads count + the 5 most recent** (name, project type, submitted date, a direct link into the Leads inbox) — this is the single highest-value, most time-sensitive thing the dashboard can surface, since `01_PRODUCT_VISION.md`'s entire operating mandate is lead generation, and a lead sitting unnoticed for days is a real cost. Nothing else on the dashboard is this time-sensitive.
2. **Content awaiting review** (role-gated: only visible to Admin/Head Admin, per `12_ADMIN_PANEL_SPECIFICATION.md` §1) — a count plus a direct link into a unified review queue spanning every `draft-review-publish` collection, so an Admin doesn't need to check seven separate list screens for anything sitting in "review."
3. **Recent activity** — the last ~10 `VersionHistory` entries across all collections (who published what, when) — a lightweight audit trail an eye can glance at, not a full activity-feed product.
4. **Quick-create links** for the collections actually created often (Blog Post, Case Study) — a small affordance, not a tile grid of all eleven collections (which would just duplicate the sidebar nav with worse information density).

**What it should explicitly not contain, and why:** analytics charts (no product need for this yet — `13_SEO_STRATEGY.md`'s own analytics integration is a separate, already-deferred concern per `10_FEATURE_SPECIFICATION.md` §6), a vanity stats row (directly contradicts the zero-fabrication discipline this whole codebase already enforces on the *public* site — an internal dashboard shouldn't invent a different standard for itself), a full project-management view (`12_ADMIN_PANEL_SPECIFICATION.md` §6 already explicitly rules this out — "not a project-management tool"), or per-role customizable widgets (a configurability feature with no user at HubZero's current size who's asked for it — the kind of speculative flexibility this document's brief explicitly warns against building "because enterprise").

---

## 11. Collections — review and recommendations

Reviewing each collection named in the brief against the schema already specified in `11_DATABASE_ARCHITECTURE.md` §1. The finding, stated plainly up front: **the existing schema design is sound and needs no structural changes** — every recommendation below is either "use the generic engine's existing mechanism" (nothing new to design) or a small, explicitly-scoped addition.

- **Lead** — see §12 for the dedicated review; the short version is this collection correctly has *no* draft/publish workflow (`workflow: "none"` in its collection config) because it's system-generated, not authored, per `11_DATABASE_ARCHITECTURE.md` §1's own framing. No changes recommended.
- **Team** — maps cleanly to `workflow: "draft-publish"`. One recommendation: the `editOwn` permission (§3) needs `TeamMember.linkedUserId` (the inverse of `User.linkedTeamMemberId`, already implied but worth stating explicitly as a required field, not merely inferable) so the ownership check in `can()` has something concrete to compare against — a small, explicit addition to `11_DATABASE_ARCHITECTURE.md` §1's `TeamMember` shape, not a redesign.
- **CaseStudy** — maps cleanly to `workflow: "draft-review-publish"`. No changes; this is the collection this document expects to be built *first* against the generic engine (see §14), precisely because `14_IMPLEMENTATION_ROADMAP.md` Phase 1 already names it as one of "the two collections every other phase depends on."
- **Labs** — maps to `workflow: "draft-publish"` (per `12_ADMIN_PANEL_SPECIFICATION.md` §2's "simple draft/publish, no approval step required"). The "mark as graduated" action (§4) is a small collection-specific Server Action *beside* the generic `crud-actions.ts` set, not a special case bolted into the generic engine — it's the one genuinely bespoke piece of business logic this collection needs, and it should stay exactly that scoped (write `LabsProject.stage`/`graduatedToBuildId` and `Build.graduatedFromLabsId` transactionally, per `11_DATABASE_ARCHITECTURE.md` §2's bidirectional-validation requirement) rather than becoming a precedent for special-casing the generic engine itself.
- **Build** — maps to `workflow: "draft-review-publish"` (treated as company content, since it's a HubZero-owned product being presented publicly, not personal content). No changes.
- **Blueprint** — maps to `workflow: "draft-review-publish"`, with one **required** addition to the generic `publish()` action: a collection-specific publish guard rejecting publish unless `demoStatus === "live"` (`09_CMS_ARCHITECTURE.md` §2 already specifies this as a hard rule, not a soft warning). This is implemented as an optional `config.publishGuard?: (doc) => string | null` hook on `CollectionConfig` (§5) — returning an error message blocks publish — which is itself a generic engine mechanism (any future collection can supply a publish guard), not a Blueprint-specific fork of `publish()`.
- **Blog** — maps to `workflow: "draft-review-publish"`. `readingTimeMinutes` (computed, not author-entered, per `11_DATABASE_ARCHITECTURE.md` §1) is computed in the `create`/`update` action before validation, from the rich-text body's word count — a small, generic-engine-friendly computed-field pattern (`config.computedFields?: (doc) => Partial<T>`) that other collections can reuse if a future field needs the same treatment.
- **VersionHistory** — not user-authored, has no admin editor screen of its own beyond the read-only diff/restore UI (§9) — correctly excluded from the `defineCollection()` pattern entirely, since it's infrastructure, not content.
- **Settings** (`SiteSettings`) — a genuine single-document collection, not a list. The generic `DataTable`/list screen doesn't apply; `/studio/settings` is a single `CmsForm` bound directly to the one document (`findOneAndUpdate` with `upsert: true` rather than the create/list/delete verbs the rest of the engine assumes). Worth calling out explicitly because it's the one collection that doesn't fit the list-of-documents shape the rest of this document assumes — the recommendation is to let it be a deliberate, small exception (a form with no table, no workflow, Head-Admin-only) rather than forcing it through machinery built for a different shape.

**Testimonials, Services, FAQs, Career Listings** (named in `09_CMS_ARCHITECTURE.md` §2 but not explicitly re-listed in the brief's §11) are included here for completeness since they're part of the same collection set this engine must support at launch: all four map to `workflow: "draft-publish"`, all four are straightforward `defineCollection()` instances with no bespoke logic beyond Testimonial's existing schema-level "reject unattributed entries" constraint (`11_DATABASE_ARCHITECTURE.md` §1) — which belongs in the Mongoose schema and Zod validation, not as special-cased CRUD logic.

---

## 12. Technical review — the Lead implementation as the pattern for every future collection

**Direct answer: mostly yes, with one specific extraction recommended before it becomes the template — not because anything is wrong with it, but because generalizing it for reuse surfaces one piece of repeated boilerplate worth naming once.**

What the current implementation (`src/lib/db.ts`, `src/models/lead.ts`, `src/lib/lead-schema.ts`, `src/app/(marketing)/contact/actions.ts`) already gets right, and which this document's engine should preserve rather than replace:

- **The connection-caching pattern in `db.ts`** (`global._mongooseCache`, lazy env-var read inside `connectToDatabase()` rather than at module load) is the correct, standard pattern for Mongoose in a Next.js serverless/hot-reload environment. No change needed — every collection's Server Actions call this same function.
- **The single-source-of-truth Zod schema** (`lead-schema.ts`, imported by the client form, the Server Action, and re-derived into the Mongoose enum values) is exactly the pattern §5's `CollectionConfig.zodSchema` generalizes. This document's engine is, in a real sense, "what the Lead pattern looks like once there are eleven collections instead of one," not a different pattern.
- **The `models.X ?? model(...)` hot-reload guard** in `lead.ts` is correct and should be extracted into a one-line shared helper (`defineModel(name, schema)` in `models/shared/`) purely to avoid retyping the same guard in fourteen model files — a DRY observation, not a correctness issue with the existing code.
- **The Server Action's shape** (honeypot/spam check → Zod `safeParse` → try/catch around the database write → typed field/form error result) is exactly the shape `createCrudActions()`'s `create()` (§5) generalizes, plus the `can()` authorization check that Lead doesn't need (a public, unauthenticated form has no "role" to check) but every authored CMS collection does.
- **`console.error("Failed to save lead submission:", error)`** at `actions.ts:61` — flagged during this review as the one place worth a deliberate decision, not a defect: it's a legitimate server-side error log on a real failure path, not debug cruft (confirmed: no `TODO`/`FIXME`, no commented-out code, no stray `console.log`, no duplicate database utilities anywhere in the Contact/Lead feature — see the Repository Verification section of this session's report). The recommendation is to leave it as `console.error` for now — introducing a structured logging service is real infrastructure that has no other consumer yet, and would be exactly the "invent infrastructure because enterprise" this document's brief warns against. Revisit once the CMS's Server Actions (§5) give this pattern eleven more call sites and a real operational need to correlate errors across them emerges.

**What should change before Lead's pattern becomes the literal template — one item:** `MONGODB_URI` is read directly from `process.env` inside `db.ts`, deliberately bypassing the validated `env.ts` schema (per `db.ts`'s own comment, so pages that don't touch the database still build without a live URI). That reasoning is sound and should be preserved — but once auth introduces `AUTH_SECRET` (and, eventually, media storage introduces its own config), the same "some env vars are load-bearing everywhere, some only where they're used" split should be made explicit as a documented convention in `env.ts` itself (a comment distinguishing "always-validated" vars from "lazily-read-where-used" vars), rather than left as a pattern only discoverable by reading `db.ts`'s own inline comment. This is a documentation clarity fix, not a code change.

**What should not change:** Lead should **not** be retrofitted with a draft/publish workflow, version history, or the `status: draft/review/published` enum the other ten collections use. `11_DATABASE_ARCHITECTURE.md` §1 already correctly distinguishes Lead's `status` (a follow-up triage state: new/contacted/closed) from every other collection's workflow `status` (a publish-lifecycle state) — collapsing these into one shape because "every other collection has a workflow" would be a real architectural mistake, imposing an approval-workflow mental model onto a system-generated record nobody is "authoring." The Leads inbox (§4, §10) uses the generic `DataTable` (§7) for its list view — that reuse is legitimate and free — but its collection config correctly declares `workflow: "none"`, and no publish/version-history machinery is wired to it.

---

## 13. Risks

- **Performance.** MongoDB's lack of enforced joins (`08_TECHNICAL_ARCHITECTURE.md` §6's own honest tradeoff note) means every cross-collection reference (`BlogPost.authorId` → `TeamMember`, `Build.graduatedFromLabsId` → `LabsProject`) is a `populate()` call or a manual second query — fine at HubZero's content volume, but a real risk if a future list screen naively `populate()`s inside a loop rather than batching. Mitigation: the generic `list()` (§5) batches any needed population once per page of results, never per-row, as a property of the shared engine rather than something each collection has to remember to do correctly.
- **Maintainability.** The generic-engine approach (§1, §5–7) is a real bet: if a future collection's needs genuinely don't fit the config shape, the temptation will be to special-case the engine itself repeatedly until it's not generic anymore. Mitigation: the `publishGuard`/`computedFields` escape hatches named in §11 are the *sanctioned* extension points — a new requirement should first be checked against "does this fit an existing escape hatch" before adding a new one, the same governance discipline `17_COMPANY_STRUCTURE.md` §7 applies to proposing a new pillar.
- **Security.** The single most important rule from §3 bears repeating as a risk, not just a design decision: **UI-level permission checks (`use-can.ts`) are convenience, never protection** — every Server Action must independently call `can()`, because a Server Action is a public network endpoint the moment it's defined, regardless of whether any rendered UI happens to hide the button that triggers it. A second, concrete risk: file uploads (§8) need server-side MIME-type and size validation (not just an `accept=""` attribute, which is trivially bypassed) before this document's media system is implemented — flagged explicitly since it's the one part of this system that accepts arbitrary binary input from an authenticated-but-not-fully-trusted user tier (Teammate).
- **Scalability.** A single managed MongoDB instance (already the plan per `08_TECHNICAL_ARCHITECTURE.md` §8) comfortably handles HubZero's eleven collections at any realistic content volume for years — the one collection worth watching is `VersionHistory` (§9's pruning note), since it's the only one that grows without bound as a function of *editing activity* rather than *content volume*.
- **Editor experience.** Autosave (§6) risks a subtle multi-tab conflict: two tabs editing the same draft, each autosaving independently, silently overwrite each other with no warning. Not solved by this document (a real-time collaborative editing solution is explicitly out of MVP scope per `09_CMS_ARCHITECTURE.md` §3) — the pragmatic mitigation is an optimistic-concurrency check (compare `updatedAt` on save; if it's moved since the form loaded, warn rather than silently overwrite) rather than building actual conflict resolution.
- **Migration.** Two existing static, config-driven data sources need a one-time migration into the database once the CMS exists: `src/config/case-studies.ts` (the Work index) and the hand-written `work/bhatkal-time-luxe/page.tsx` route (`PROJECT_CONTEXT.md` §8 already flags this as pending). This is real, scoped migration work — a seed script reading the existing static array/page content into `CaseStudy` documents — not a schema risk, but worth sequencing deliberately (§14) rather than discovering it late.
- **Testing.** No test framework exists in this repository yet (`package.json` has none). This document's generic engine (§5–7) is exactly the kind of shared infrastructure a regression in one collection's use of it would silently break for every other collection — the risk isn't "no tests exist," it's specifically "a bug in the shared engine has an eleven-collection blast radius instead of a one-collection blast radius." Recommendation: introduce a minimal integration-test setup (even just Vitest + a test MongoDB instance) at the point the generic engine is first built (§14 Phase B), covering `can()`'s permission matrix and one full CRUD-plus-publish-plus-version cycle — not deferred until "there's time for tests" after eleven collections already depend on the untested engine.
- **Deployment.** `AUTH_SECRET` (and any future storage credentials) need the same environment-variable-management rigor `14_IMPLEMENTATION_ROADMAP.md` Phase 0 already calls for generally — flagged specifically because an admin-panel secret is a meaningfully higher-stakes secret to mismanage than anything the marketing site alone has needed so far.

---

## 14. Engineering roadmap

Each phase below is independently shippable — it leaves the system in a working, deployable state, even if the next phase never happens. Complexity is a rough relative estimate (S/M/L/XL), not a time estimate, given `14_IMPLEMENTATION_ROADMAP.md` §0's existing solo-builder constraint.

**Phase A — Auth foundation.** Auth.js + Credentials provider (§2), `User` model, `middleware.ts`, `/studio/login`, session provider, the `sessionVersion` revocation mechanism. No content-management functionality yet — this phase's exit criterion is identical to `14_IMPLEMENTATION_ROADMAP.md` Phase 0's own bar: "a working login," now made concrete. **Complexity: M.** **Dependencies: none** — can start immediately; does not depend on any other phase below.

**Phase B — Generic engine, proven against one collection.** Build `permissions.ts` (§3), `collection-config.ts` + `crud-actions.ts` (§5), the `DataTable` and `CmsForm` component sets (§6–7), and the shared Mongoose workflow mixin (§4's `shared/workflow-fields.ts`) — then validate all of it against exactly **one** real collection end-to-end. **Recommendation: Case Studies**, both because `14_IMPLEMENTATION_ROADMAP.md` Phase 1 already names it (alongside Team) as the collection every other phase depends on, and because it exercises the hardest workflow tier (`draft-review-publish`) first, so easier collections (`draft-publish`) are a strict subset of what's already proven. Introduce the minimal integration-test setup (§13) in this phase, not after. **Complexity: L** — this is the phase where the real engineering investment happens; every subsequent collection is cheap specifically because this phase wasn't rushed. **Dependencies: Phase A** (every mutation needs `requireSession()`/`can()`).

**Phase C — Version history and the approval queue.** `snapshotVersion`/restore (§9), the unified cross-collection review queue (§10 item 2), the version-diff UI. Built once Case Studies (Phase B) gives it a real collection to operate on. **Complexity: M.** **Dependencies: Phase B.**

**Phase D — Media library.** Storage adapter interface, local implementation, `sharp` pipeline, `Media` collection, `<MediaPicker>` (§8). Sequenced after B/C rather than alongside them because no collection strictly needs it to reach "end-to-end working" — Case Studies can ship with a placeholder/manual image-path field first, then gain the real picker once this phase lands, without a schema change (the field was always a `Media` reference). **Complexity: M.** **Dependencies: Phase B** (needs the `image` field type in the form engine); does not depend on C.

**Phase E — Roll out the remaining ten collections.** Team, Labs, Builds, Blueprints, Blog, Testimonials, Services, FAQs, Career Listings, Settings — each is now `defineCollection({...})` plus a Mongoose model plus (where needed) a small collection-specific extension (Labs' graduation action, Blueprint's publish guard, §11). **Complexity: S each, M in aggregate** — explicitly the payoff phase for Phase B's larger upfront investment; if any one of these collections feels like L-complexity work, that's a signal the engine has a gap worth fixing rather than working around per-collection. **Dependencies: Phase B** (all), **Phase D** (any collection with an image field — most of them), **Phase C** (any `draft-review-publish` collection).

**Phase F — Dashboard and the Leads inbox UI.** The dashboard (§10) and the Leads list/detail screens (§4, §11) — sequenced last deliberately, even though `Lead` itself already exists as a working collection, because both consume data from across the other collections (recent activity spans all of them) and are genuinely lower-stakes to get slightly wrong than getting the core CRUD/auth/versioning engine right first. **Complexity: S.** **Dependencies: Phase A** (Leads inbox needs auth); benefits from but doesn't strictly require B–E.

**Phase G — Data migration.** Seed `CaseStudy` from `src/config/case-studies.ts` and the hand-written Bhatkal Time Luxe page (§13); retire the static config and hand-written route in favor of the dynamic `/work/[slug]` template `06_PAGE_SPECIFICATIONS.md` already specifies. **Complexity: S.** **Dependencies: Phase B, Phase D** (the real case study has real images that need to land in the media system, not stay as static `public/` paths).

**Recommended ordering:** A → B → (C and D in parallel, both only depending on B) → E → F → G. This is a tighter, CMS-internal sequencing that sits *inside* what `14_IMPLEMENTATION_ROADMAP.md` calls "Phase 1 — Data layer and CMS core" — it doesn't replace that document's phase numbering, it's the answer to "what does Phase 1 actually break down into, day to day," which is exactly what this document's brief asked for and what `14`'s own Phase 1 description (correctly, at the time it was written) left unspecified.

---

## 15. Summary

The central engineering bet this document makes is narrow and explicit: **build one small, generic content-management engine once (§5–7), prove it against one real, hard collection (Phase B), and let the other ten collections be cheap additions rather than ten separate systems.** Everything else in this document — the RBAC model, the folder structure, the media/versioning strategy — exists in service of making that one bet pay off, and every risk in §13 is, not coincidentally, a way that bet could fail to pay off if rushed. The Lead implementation already shipped is not an exception to this plan; it's the first data point that the plan's underlying instincts (shared validation, cached connections, typed Server Actions, defense-in-depth checks) were already right, one collection before this document existed to name them as a system.
