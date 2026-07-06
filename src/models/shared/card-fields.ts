import { Schema } from "mongoose";

/**
 * Small, additive mixins every narrative collection composes alongside
 * `workflowFields()` — `ARCHITECTURE/20_CONTENT_BLOCKS.md` §3's "the card is
 * independently editable, never derived from the first paragraph" model.
 * Kept as separate one-field mixins, not one bundled `cardFields()`: Build
 * already had `tagline` and Note already had `summary` serving the card-blurb
 * role before this evolution, so a collection composes only the pieces it
 * doesn't already have (`case-study.ts`/`labs-project.ts`/`blueprint.ts` add
 * `summaryField()`; all five add `featuredField()`/`readingTimeField()`).
 */

/** The Mixed-typed block array every narrative collection's `content` field is — validated by the collection's own Zod schema (`lib/cms/blocks/schema.ts`), the same "Mongoose stores it, Zod validates its shape" split `VersionHistory.snapshot` already established. */
export function contentField() {
  return { content: { type: [Schema.Types.Mixed], default: [] } };
}

/** A short, dedicated card blurb — required, distinct from the long-form `content`. */
export function summaryField() {
  return { summary: { type: String, required: true, trim: true, maxlength: 400 } };
}

/** Homepage/index "featured" badge — e.g. which Case Study the homepage shows (`lib/cms/public-content.ts`'s `getFeaturedCaseStudy`). */
export function featuredField() {
  return { featured: { type: Boolean, required: true, default: false } };
}

/** Computed on save from `content`'s word count (`lib/cms/blocks/text.ts`), never author-entered — the same treatment `Note.readingTimeMinutes` already had pre-blocks, generalized to every narrative collection. */
export function readingTimeField() {
  return { readingTimeMinutes: { type: Number, required: true, default: 1 } };
}

/** Additional people who worked on this piece, beyond any primary-author field a collection already has (e.g. `Note.authorId`) — a real `TeamMember` relationship, never free text (`ARCHITECTURE/20_CONTENT_BLOCKS.md` §4). */
export function contributorsField() {
  return { contributors: { type: [Schema.Types.ObjectId], ref: "TeamMember", default: [] } };
}

/**
 * The runtime counterpart to this file's schema `default`s. Mongoose only
 * applies a schema default when a *new* document is created — a document
 * written before `content`/`contributors`/`featured`/`readingTimeMinutes`
 * existed on this collection has none of those keys stored in MongoDB at
 * all, and every read in this codebase uses `.lean()` (for performance —
 * see `public-content.ts`'s header comment), which returns exactly what's
 * stored, never a schema-defaulted value. `scripts/migrate-content-blocks.ts`
 * closes this gap in the *data* (one-time, idempotent); this function closes
 * it at the *read boundary* so a page can never crash on a document that
 * predates that migration having run, or predates this field existing at
 * all — the two are complementary, not redundant (`ARCHITECTURE/20_CONTENT_BLOCKS.md`
 * §8). Every public/studio read of a narrative document should be passed
 * through this before it reaches a renderer.
 */
export function withCardFieldDefaults<
  T extends {
    content?: unknown;
    contributors?: unknown;
    featured?: unknown;
    readingTimeMinutes?: unknown;
  },
>(doc: T): T {
  return {
    ...doc,
    content: Array.isArray(doc.content) ? doc.content : [],
    contributors: Array.isArray(doc.contributors) ? doc.contributors : [],
    featured: typeof doc.featured === "boolean" ? doc.featured : false,
    readingTimeMinutes:
      typeof doc.readingTimeMinutes === "number" && doc.readingTimeMinutes > 0
        ? doc.readingTimeMinutes
        : 1,
  } as T;
}

/**
 * Same hazard as `withCardFieldDefaults`, for the one array field each
 * narrative collection declares itself rather than through a shared mixin
 * (`CaseStudy`/`Build`/`LabsProject`'s `techTags`, `Blueprint`'s
 * `techStack`, `Note`'s `tags`) — kept as a keyed helper rather than one
 * more fixed field name in `withCardFieldDefaults` because the field name
 * differs per collection.
 */
export function withArrayDefault<T extends Record<string, unknown>, K extends keyof T & string>(
  doc: T,
  key: K,
): T {
  if (Array.isArray(doc[key])) return doc;
  return { ...doc, [key]: [] };
}
