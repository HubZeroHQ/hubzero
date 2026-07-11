import { Schema, type Types } from "mongoose";

/**
 * The two workflow tiers `ARCHITECTURE/09_CMS_ARCHITECTURE.md` §3 and
 * `ARCHITECTURE/19_CMS_FOUNDATION.md` §5 define for authored content.
 * `"none"` (e.g. `Lead`) isn't a publish workflow at all and doesn't use this
 * mixin — that collection keeps its own unrelated status enum (a triage
 * state, not a publish-lifecycle state).
 */
/**
 * `"scheduled"`/`"archived"` (Phase B — scheduling) are additive to both
 * tiers: a document reaches `"scheduled"` only via `schedulePublish()` and
 * `"archived"` only via `archive()` (`lib/cms/crud-actions.ts`) — every
 * existing query/status check written against the original two/three values
 * keeps working unchanged, since those two are simply never produced by any
 * existing code path.
 */
export const draftPublishStatusValues = ["draft", "published", "scheduled", "archived"] as const;
/**
 * `"changes_requested"`/`"approved"` (Phase C — the review system) are
 * additive here too, `"draft-review-publish"`-only: `draft → review →
 * changes_requested → approved → published`, with `review → draft` (reject)
 * and `changes_requested → review` (resubmit) as the two ways back into the
 * pipeline (`lib/cms/crud-actions.ts`'s `requestChanges`/`reject`/`approve`/
 * `submitForReview`). `publish()` itself still has no status precondition
 * (`ARCHITECTURE/19_CMS_FOUNDATION.md`'s existing, deliberate laxity — an
 * Admin/Head Admin's `publish` grant already lets them bypass review
 * entirely, unchanged by this addition), so `"approved"` is the *expected*
 * pre-publish state, not an *enforced* one.
 */
export const draftReviewPublishStatusValues = [
  "draft",
  "review",
  "changes_requested",
  "approved",
  "published",
  "scheduled",
  "archived",
] as const;

export type DraftPublishStatus = (typeof draftPublishStatusValues)[number];
export type DraftReviewPublishStatus = (typeof draftReviewPublishStatusValues)[number];

/**
 * The shape every workflow-participating document has, regardless of
 * collection — what `lib/cms/crud-actions.ts` is written against so it never
 * needs to know a specific collection's field set beyond this.
 *
 * `scheduledPublishAt`/`scheduledUnpublishAt`/`archivedAt` back Phase B's
 * scheduling actions — a document can hold at most one of
 * `scheduledPublishAt` (while `status === "scheduled"`) or
 * `scheduledUnpublishAt` (set on an already-`"published"` document, status
 * unchanged until the scheduled moment arrives), never both at once
 * (`schedulePublish`/`scheduleUnpublish` each clear the other).
 */
export interface WorkflowFields<S extends string = string> {
  status: S;
  version: number;
  publishedAt?: Date;
  createdBy: Types.ObjectId;
  scheduledPublishAt?: Date;
  scheduledUnpublishAt?: Date;
  archivedAt?: Date;
}

/**
 * The reusable `status`/`version`/`publishedAt`/`createdBy` mixin every
 * versioned collection composes into its own Mongoose schema definition —
 * `ARCHITECTURE/19_CMS_FOUNDATION.md` §4's "avoid copy-paste" goal applied at
 * the schema layer, not just the CRUD layer.
 *
 * Spread the result into a collection's own `new Schema({
 * ...workflowFields(statusValues), title: ... })` call. `statusValues` must
 * be passed as a literal, non-empty tuple (`["draft", "published"] as const`,
 * not `.map()`'d into a widened `string[]`) — this is the same distinction
 * `lead-schema.ts` documents: a widened array type still satisfies Mongoose's
 * `enum` option, but silently loses the literal-union type `InferSchemaType`
 * would otherwise derive for `status`.
 */
export function workflowFields<S extends readonly [string, ...string[]]>(statusValues: S) {
  return {
    status: {
      type: String,
      required: true,
      enum: statusValues,
      default: statusValues[0],
    },
    version: { type: Number, required: true, default: 0 },
    publishedAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    scheduledPublishAt: { type: Date },
    scheduledUnpublishAt: { type: Date },
    archivedAt: { type: Date },
  };
}
