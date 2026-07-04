import { Schema, type InferSchemaType, type Types } from "mongoose";

import { defineModel } from "@/models/shared/define-model";

/**
 * `ARCHITECTURE/11_DATABASE_ARCHITECTURE.md` §1's generic `VersionHistory`
 * shape, applying to any versioned collection — not user-authored, no admin
 * editor screen of its own (§11), only the read-only diff/restore UI
 * (`ARCHITECTURE/19_CMS_FOUNDATION.md` §9). `collection` holds the same
 * `Resource` string every collection registers under (`caseStudy`, …), kept
 * as a plain `String` rather than importing `Resource` here — this model
 * must stay importable from the generic engine without pulling in the whole
 * `types/cms.ts` permission vocabulary as a schema-level dependency.
 *
 * `snapshot` is a full `.toObject()` capture of the document *immediately
 * before* the mutation that triggered it (§9) — a plain object matching
 * whatever shape that collection's schema had at the time, deliberately
 * untyped (`Schema.Types.Mixed`) since a `VersionHistory` document spans
 * every collection, not one.
 */
const versionHistorySchema = new Schema(
  {
    collection: { type: String, required: true },
    documentId: { type: Schema.Types.ObjectId, required: true },
    snapshot: { type: Schema.Types.Mixed, required: true },
    editedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    editedAt: { type: Date, required: true, default: Date.now },
  },
  {
    versionKey: false,
    // `collection` is the exact field name `11_DATABASE_ARCHITECTURE.md` §1
    // specifies, and it shadows a hydrated Mongoose document's own
    // `.collection` accessor (the native driver Collection object) — a real
    // collision Mongoose warns about by default. Every read in this codebase
    // goes through `.lean()` (a plain object, where `collection` is simply
    // the field's string value, no shadowing), so the collision is inert in
    // practice; this suppresses the warning rather than renaming the field
    // away from what the architecture doc names it.
    suppressReservedKeysWarning: true,
  },
);

// Every read pattern this system needs: "this document's history, newest
// first" (the version list, restore) and "the last N edits across every
// collection" (the dashboard's recent-activity feed, `ARCHITECTURE/19_CMS_FOUNDATION.md`
// §10 item 3) — the second is a bare `.sort({ editedAt: -1 }).limit(n)` with
// no filter, which the first index's leading fields don't serve, hence the
// second, `editedAt`-only index.
versionHistorySchema.index({ collection: 1, documentId: 1, editedAt: -1 });
versionHistorySchema.index({ editedAt: -1 });

export type VersionHistoryDocument = InferSchemaType<typeof versionHistorySchema> & {
  _id: Types.ObjectId;
};

export const VersionHistory = defineModel<VersionHistoryDocument>(
  "VersionHistory",
  versionHistorySchema,
);
