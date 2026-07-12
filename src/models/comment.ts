import { Schema, type InferSchemaType, type Types } from "mongoose";

import { defineModel } from "@/models/shared/define-model";

/**
 * The one generic, cross-collection comment shape — the same
 * `{collection, documentId}`-keyed pattern `VersionHistory` already
 * establishes (`ARCHITECTURE/11_DATABASE_ARCHITECTURE.md` §1), applied here
 * instead of a second pattern. Backs **both** Phase C's review comments and
 * Phase D's internal/threaded comments — `type` is the only thing that tells
 * them apart, never two collections or two engines. `collection` is a plain
 * `String` (not the `Resource` union) for the identical reason
 * `version-history.ts` documents: this model must stay importable from the
 * generic engine without pulling in `types/cms.ts` as a schema dependency.
 */
const commentSchema = new Schema(
  {
    collection: { type: String, required: true },
    documentId: { type: Schema.Types.ObjectId, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true, trim: true, maxlength: 4000 },
    /**
     * `"review"` — written by `requestChanges`/`reject` (`crud-actions.ts`),
     * always about *this specific* review-cycle decision, never edited or
     * threaded. `"note"` — Phase D's collaborative comment thread, which
     * `parentId`/`resolved`/`mentions` below exist for.
     */
    type: { type: String, required: true, enum: ["review", "note"] },
    parentId: { type: Schema.Types.ObjectId, ref: "Comment" },
    resolved: { type: Boolean, required: true, default: false },
    mentions: { type: [Schema.Types.ObjectId], ref: "User", default: [] },
  },
  { timestamps: true, versionKey: false, suppressReservedKeysWarning: true },
);

// "This document's comment thread, oldest first" — the one read pattern
// every consumer needs (the review-comment history, the Phase D thread).
commentSchema.index({ collection: 1, documentId: 1, createdAt: 1 });

export type CommentDocument = InferSchemaType<typeof commentSchema> & {
  _id: Types.ObjectId;
};

export const Comment = defineModel<CommentDocument>("Comment", commentSchema);
