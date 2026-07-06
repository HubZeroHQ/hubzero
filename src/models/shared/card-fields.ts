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
