# 20 — Editorial Content Blocks

> **Status: Implemented — 2026-07-06.** This document specifies the editorial block system that replaces the fixed-markdown-field content model (`CaseStudy.problem/approach/result`, `Build.description`, `LabsProject.description`, `Blueprint.description/customizationNotes`, `Note.body`) across all five narrative collections. It is an *evolution* of `19_CMS_FOUNDATION.md`'s generic CRUD/form engine, not a parallel system — every mechanism below is the same `CollectionConfig`/`FieldConfig`/`createCrudActions()` engine that document already specifies, extended by exactly the field-type vocabulary this document adds. See `18_ARCHITECTURE_CHANGELOG.md`'s corresponding entry for what changed and why, session by session.

## 0. Why this exists

`09_CMS_ARCHITECTURE.md` §2 originally modeled every narrative collection as a small, fixed set of named markdown fields — Case Study's `problem`/`approach`/`result` being the clearest example. That shape forces every case study, every Labs project, every Note into the same three-beat (or one-beat) narrative regardless of what the actual project needs to say. A hardware bring-up log and a client web platform are not the same kind of story; forcing both through "Problem → Approach → Result" is a template, not editorial judgment.

This document replaces the fixed fields with a single ordered field — `content: Block[]` — on each of the five narrative collections (Case Studies, Labs Projects, Builds, Blueprints, Notes). The CMS supplies a fixed vocabulary of building blocks; the author decides how many of which kind, in what order. Metadata (client, industry, practice area, slug, status, dates, etc.) remains structured, unchanged — this document only touches the long-form content fields and adds the card/contributor metadata described in §3-4.

**Explicitly out of scope** (per `00_FOUNDER_APPROVAL.md`'s convention of not silently widening a phase's brief): Team Members, Testimonials, Careers, FAQs, Site Settings, and Leads keep their existing structured-form model. None of them are narrative content — a block system would be solving a problem they don't have.

## 1. The block model

A block is `{ id, type, data }`:

- `id` — a client-generated `crypto.randomUUID()` string, stable across reorders/duplicates/edits, used as the React key and the diff/version-history identity for that block.
- `type` — one of the fifteen types below, a closed, deliberately non-extensible union (the same "closed vocabulary, not a plugin registry" posture `19_CMS_FOUNDATION.md` §6 already takes for `FieldConfig.type`).
- `data` — the type-specific payload, validated by a per-type Zod schema (`lib/cms/blocks/schema.ts`).

Stored as `content: [Schema.Types.Mixed]` on each collection's Mongoose schema (`models/shared/card-fields.ts`'s `contentField()`) — Mongoose doesn't enforce the block shape (it's heterogeneous), Zod does, the identical "MongoDB doesn't enforce this, Zod does" division of labor `11_DATABASE_ARCHITECTURE.md` §2 already uses for reference integrity, applied here to structural integrity instead.

### 1.1 The fifteen block types, and why each earns its place

| Type | Purpose |
|---|---|
| `heading` | A section break (level 2 or 3) — used when the author wants one, never implied by field position. |
| `paragraph` | Short-form prose with inline markdown (bold/italic/links). |
| `markdown` | A full markdown document in one block — "quick writing" for an author who wants to write the way the old single `richtext` field worked, without adopting the rest of the block vocabulary. |
| `image` | A single `Media` reference, with caption, alignment (left/center/right), and width (content/wide/full-bleed). |
| `gallery` | Multiple `Media` references shown together, with a shared caption. |
| `quote` | A pull quote with optional attribution/role — the editorial equivalent of `CaseStudy`'s previously-deferred `quote` field, now expressible inline, anywhere in the narrative. |
| `callout` | A tonal highlight (note/info/success/warning) for an aside that shouldn't read as body prose. |
| `code` | A formatted snippet with optional language/filename — load-bearing for Labs/Builds content that needs to show real code. |
| `divider` | A plain visual break — no data. |
| `metrics` | A row of label/value stats — the "by the numbers" pattern the original hand-written Bhatkal Time Luxe page had no schema home for until now. |
| `timeline` | A dated sequence of milestones — for a project with a real chronology worth showing. |
| `video` | A YouTube/Vimeo/direct-file URL, embedded when recognized, linked otherwise. |
| `spacer` | Deliberate extra vertical space — a narrative pacing tool, not a layout hack. |
| `twoColumn` | Side-by-side content, each column holding its own list of simple blocks. **Cannot contain another `twoColumn`** — enforced by both the TypeScript type (`SimpleBlock` excludes `twoColumn`) and the Zod schema (`schema.ts`'s `simpleBlockSchema` union omits it), not just documented, so the two can't drift apart. |
| `html` | Raw HTML, admin-only in effect (§5). |

Every type maps to a real, pre-existing editorial need identified in the brief (or, for `quote`/`metrics`, a field the pre-block schema had explicitly deferred or a gap the original hand-written Bhatkal Time Luxe page exposed). No type was added "because it sounded interesting" — `lib/cms/blocks/registry.ts`'s `BLOCK_TYPE_META` is the one place a sixteenth type would touch, and adding one should clear the same bar these fifteen did.

## 2. Engine integration — one new field type, not a parallel system

The block editor is the `"blocks"` addition to `FieldConfig.type` (`types/cms.ts`) — the same kind of sanctioned, minimal vocabulary extension `"json"` was for `TeamMember`'s nested fields (`18_ARCHITECTURE_CHANGELOG.md`'s Phase D entry). Nothing else about the generic engine changed:

- **Wire format:** `<BlockEditor>` (`components/admin/blocks/block-editor.tsx`) emits a single hidden `<input>` carrying `JSON.stringify(blocks)` — `crud-actions.ts`'s `rawFromFormData` needed no new case, since it already falls through to reading an opaque string for any field type it doesn't special-case. `lib/cms/blocks/schema.ts`'s `blocksField()` is the Zod-side adapter: `z.preprocess` JSON-parses the string, then validates it against `blocksArraySchema`.
- **Validation:** every block's `data` is validated by its own Zod case in a `z.discriminatedUnion("type", …)` — an invalid block fails the same `safeParse`/`flattenZodErrors` path every other field already uses; there is no second validation mechanism for blocks.
- **CRUD actions:** `create()`/`update()`/`publish()`/`autosaveDraft()` are entirely unmodified in their control flow — a `content: Block[]` field is just another key in `parsed.data`. The one addition is a generic publish-time guard (§5).
- **Media integration:** Image/Gallery blocks store a `Media` `_id`, never a URL, resolved through the same `getMediaById`/`getMediaByIds` (`lib/cms/media.ts`) every other `image`/`imageArray` field already uses. `getMediaUsage()` (media-in-use scanning, §8's "never a silent dangling reference" rule) was extended to scan any `"blocks"`-type field's content for embedded media ids (`lib/cms/blocks/guard.ts`'s `collectBlockMediaIds`), so "which documents use this image" stays correct for images referenced only inside a block, not just a top-level `image` field.
- **Team relationships:** `contributors` (§4) is a plain `referenceArray` field — the existing generic searchable picker (`<ReferencePickerList>`) needed zero changes to support it.

## 3. Card metadata — independently editable, never derived from the first paragraph

Every narrative document's public card is authored separately from its long-form content:

- `summary` — a short, required card blurb. Added to Case Study, Labs Project, and Blueprint (which had no equivalent field); `Build.tagline` and `Note.summary` already served this role and are unchanged.
- `featured` — a boolean, default `false`. Powers the homepage feature system (§6) for Case Studies; generically useful for any future "featured" rail on another collection's index page.
- `readingTimeMinutes` — computed, never author-entered, derived from `content`'s word count (`lib/cms/blocks/text.ts`'s `computeReadingTimeMinutes`) via each collection's `computedFields` hook — the same escape hatch `Note.readingTimeMinutes` already used pre-blocks, now generalized to all five collections since it's cheap and genuinely useful for browsing (estimated read time on any card).
- `stage` (Labs) and `version`/`status` (all five, from the existing `workflowFields()` mixin) already existed and needed no change.

**Deliberately not added:** a dedicated `accentImage` field distinct from `coverImage`, and a `difficulty` field for Notes. Both were named as *examples* in the brief, not requirements, and neither has a concrete design (what does an accent image do differently from a cover image on the card vs. the detail page? what does Notes' difficulty mean — reader difficulty, or the author's implementation difficulty?) that this pass could implement without inventing behavior no one asked for. Flagged in the engineering report as an open founder decision, not silently built.

## 4. Team relationships — real references, not free text

`contributors: TeamMember[]` (stored as `ObjectId[]`) is added to all five narrative collections via a `referenceArray` field (`resource: "teamMember"`), reusing the existing generic searchable picker unchanged. `Note.authorId` remains the collection's single required primary-author field; `contributors` is additional people, optional, on every collection including Note.

Public rendering resolves `contributors` (and `Note.authorId`) through `getPublicTeamMembers()` (`lib/cms/public-content.ts`) — order-preserving, and silently excludes anyone not `profileVisible`/published, so an unpublished or intentionally-hidden profile never leaks into a public contributor chip. `<ContributorChips>` (`components/marketing/blocks/contributor-chips.tsx`) renders the chip row with a photo, name, role, and a link to `/team/[username]`; it renders nothing if every contributor turned out to be hidden, the same honest-empty-state discipline used elsewhere.

## 5. The Raw HTML block is a publish-time rule, not a save-time one

The brief calls for an "admin-only" Raw HTML block. Rather than rejecting an `html` block at `create()`/`update()`/autosave time (which would brick a Teammate's in-progress draft the moment they experiment with the block, for a restriction that only actually matters once content goes live), the rule is enforced generically inside `publish()`: `checkBlocksPublishGuard()` (`crud-actions.ts`) introspects a collection's `formFields` for any `"blocks"`-type field, and `lib/cms/blocks/guard.ts`'s `checkHtmlBlockPublishGuard()` blocks the publish (with a clear message) unless the publishing user's role is `admin` or `head_admin`. This composes with, and runs alongside, a collection's own `publishGuard` (Blueprint's `demoStatus` gate) — the same sanctioned-extension-point pattern, not a second guard mechanism.

The admin editor itself does not hide the Raw HTML block type from any role — per this codebase's own explicit security posture (`19_CMS_FOUNDATION.md` §13: "UI-level permission checks are convenience, never protection"), the publish-time guard is the actual boundary. `dangerouslySetInnerHTML` on the public side is an accepted, disclosed tradeoff for a five-person internal-team CMS where every author is a trusted employee, not an XSS surface against untrusted public input.

## 6. Homepage feature system

`SiteSettings.featuredCaseStudyId?: ObjectId` (optional, `ref: "CaseStudy"`) replaces the hardcoded "Bhatkal Time Luxe" homepage component. `getFeaturedCaseStudy()` (`lib/cms/public-content.ts`) resolves, in order:

1. `SiteSettings.featuredCaseStudyId`, if set and the referenced Case Study is still published.
2. The most recently published Case Study with `featured: true`.
3. The most recently published Case Study of any kind.
4. `null` — the homepage's Case Study section renders nothing (an honest empty state, not a broken section) if no Case Study has ever been published.

`components/marketing/case-study.tsx` is now an async Server Component reading this, rendering the same visual composition (asymmetric image placement, serif pull-line, tech-tag line, CTA link) with real data (`doc.client`, resolved `coverImage`, `doc.summary`, `doc.techTags`, `/work/${doc.slug}`) instead of hardcoded JSX. `CaseStudy.revalidatesPaths` includes `"/"` (in addition to `/work` and `/work/[slug]`) so publishing/unpublishing/editing the featured Case Study invalidates the homepage immediately; `updateSiteSettings` also calls `revalidatePath("/")` when the featured pick itself changes.

**Future rotating featured work** (explicitly named in the brief as a later need): the schema is already shaped for it — `featuredCaseStudyId` becoming `featuredCaseStudyIds: ObjectId[]` and `getFeaturedCaseStudy()` becoming `getFeaturedCaseStudies()` returning a rotation is an additive schema change, not a redesign, whenever that need becomes real. Not built now because nothing in the brief asked for rotation logic (a cron/scheduling concern) today, and building it speculatively would be exactly the "invent infrastructure because enterprise" pattern this codebase's own architecture consistently rejects.

## 7. Public rendering — a generic renderer, small pages

`<ContentRenderer blocks={doc.content} />` (`components/marketing/blocks/content-renderer.tsx`) is the entire integration surface a detail page needs — it replaces the old fixed sequence of `<RichText>{doc.problem}</RichText>`-style sections. It is an async Server Component: every `Media` id referenced anywhere in the block tree is resolved once, in a single batched query (`resolveMediaMap`), before any block renders — never a per-block `getMediaById` call, the same "batch population, never per-row" discipline `19_CMS_FOUNDATION.md` §13 already calls for on admin list screens.

`<BlockRenderer>` (`components/marketing/blocks/block-renderer.tsx`) is a switch over block type — deliberately a switch, not a per-type component registry, mirroring `CmsField`'s own precedent and rationale (`components/admin/form/cms-field.tsx`'s header comment). Each block wraps itself in the appropriate `Container` width (prose/default/full) for its type; a block rendered inside a `twoColumn` column (`bare` prop) skips its own `Container` since the column's grid cell already provides one.

`work/[slug]`, `labs/[slug]`, `blueprints/[slug]`, and `notes/[slug]` were each reduced from three-plus hardcoded `<RichText>` sections to one `<ContentRenderer>` call plus (where contributors exist) one `<ContributorChips>` call — the pages stay small, exactly as this document's brief requires. `Builds` has no public route yet (unchanged from before this evolution — `18_ARCHITECTURE_CHANGELOG.md`'s Phase D entry already noted this), so its `content` field is authored and rendered in Studio preview only until a public route ships.

## 8. Migration — idempotent, loses nothing

`scripts/migrate-content-blocks.ts` converts every pre-existing document's old fields into `content`, using pure, unit-tested transforms (`lib/cms/blocks/legacy-migration.ts`):

- **Case Study** (`problem`/`approach`/`result`): each non-empty field becomes a `heading` + `markdown` pair ("The Brief", "Approach", "Result"), preserving the original section framing as a starting narrative shape the author is now free to rearrange, split, or replace — never a permanent structural requirement.
- **Build, Labs Project, Note** (`description`/`body`): the single field becomes one `markdown` block.
- **Blueprint** (`description` + optional `customizationNotes`): `description` becomes a `markdown` block; `customizationNotes`, if present, becomes a `heading` ("Customization Notes") + `markdown` pair.
- **`summary`** (the new required field on Case Study/Labs Project/Blueprint): derived from the first non-empty line of the primary legacy field via `deriveSummary()` when no value already exists — a safe, content-preserving default, not an invented fact, flagged as worth a human pass in the migration's own output framing.

**Idempotent by construction:** `needsContentMigration()` skips any document whose `content` is already a non-empty array, so re-running the script (after a partial failure, or safely as a repeatable step) never double-migrates or clobbers content already rewritten in the new block editor. Old fields are `$unset` only after `content` is written successfully, and nothing is deleted from a document until its replacement exists.

## 9. Validation — every existing workflow still works

- **Version history / diff:** `diff-view.tsx`'s existing generic `JSON.stringify` fallback for object/array fields (`18_ARCHITECTURE_CHANGELOG.md`'s Phase D entry) already renders a `content` field's diff without any new code — a raw JSON diff, not a structured per-block diff. Adequate for now; a nicer per-block diff view is a plausible future enhancement, not required for this evolution to be complete.
- **Autosave:** `useAutosave`/`autosaveDraft` are generic over the document's values object and needed no changes — a `content: Block[]` value autosaves exactly like any other field.
- **Draft/Review/Publish:** unchanged; the one addition is the generic Raw HTML publish guard (§5).
- **Restore:** `restoreVersion()` repopulates `content` from an old snapshot exactly like any other field — no special-casing needed, since a snapshot already stores the full plain-JSON block tree.
- **Tests:** `tests/blocks.test.ts` covers block-schema validation (including the two-column no-nesting rule), the `blocksField()` wire adapter, reading-time computation, media-id collection, the HTML publish guard, and every legacy-migration transform as pure functions. `tests/crud-actions.test.ts` and `tests/media.test.ts` were updated for the new schema shape and gained a case proving `getMediaUsage()` finds media referenced only inside a block.

## 10. What was deliberately not built

- **Syntax highlighting for the Code block** — would require a new dependency (Shiki/Prism/rehype-highlight); the current plain monospace rendering matches `RichText`'s own existing inline-code treatment. A real gap if Labs/Builds content leans heavily on code blocks; flagged as a founder/engineering decision, not silently added.
- **A structured per-block version-history diff** — the generic JSON diff (§9) is honest and functional, not a polished per-block comparison view.
- **Drag-and-drop via a dedicated library** — built on `motion`'s `Reorder.Group`/`Reorder.Item`, already a dependency, rather than adding `@dnd-kit/*` — avoids a new dependency for a capability the existing one already provides.
- **Rotating/multiple featured Case Studies** — see §6's forward-compatibility note.
- **`accentImage` / Notes `difficulty`** — see §3.

## 11. Founder decisions still open

1. Whether `accentImage` and/or a Notes `difficulty` field are real product needs, and if so, what they mean concretely (§3).
2. Whether Code blocks need real syntax highlighting badly enough to justify a new dependency (§10).
3. Whether/when rotating featured Case Studies (vs. a single pick) becomes a real need (§6).
4. Whether the Raw HTML block's `dangerouslySetInnerHTML` tradeoff (§5) remains acceptable if the team ever grows past "every author is a trusted employee."
