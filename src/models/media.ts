import { Schema, type InferSchemaType, type Types } from "mongoose";

import { defineModel } from "@/models/shared/define-model";

/**
 * `ARCHITECTURE/19_CMS_FOUNDATION.md` §8's `Media` collection — every
 * `image`/`imageArray` form field across every collection stores a `Media`
 * `_id` reference here, never a raw URL string, so "which documents use this
 * image" is a real query (`lib/cms/media.ts`'s `getMediaUsage`), not a manual
 * audit.
 *
 * `hash` (sha256 of the file's bytes, truncated) is what makes re-uploading
 * the identical file a no-op (`lib/cms/media.ts`'s `uploadMedia` looks up by
 * hash before ever writing a new file) — it is intentionally a separate,
 * indexed field from `key` (the on-disk/storage-adapter filename derived
 * from that same hash) so the lookup doesn't depend on reconstructing the
 * filename convention.
 */
const mediaVariantSchema = new Schema(
  {
    width: { type: Number, required: true },
    url: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const mediaSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    url: { type: String, required: true, trim: true },
    hash: { type: String, required: true, unique: true, trim: true },
    originalName: { type: String, required: true, trim: true, maxlength: 255 },
    mimeType: { type: String, required: true, trim: true },
    size: { type: Number, required: true },
    width: { type: Number },
    height: { type: Number },
    alt: { type: String, required: true, trim: true, maxlength: 300 },
    caption: { type: String, trim: true, maxlength: 500 },
    variants: { type: [mediaVariantSchema], default: [] },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    // Soft-delete only (`ARCHITECTURE/19_CMS_FOUNDATION.md` §8) — the file is
    // retained and the record hidden from the picker; a scheduled hard-delete
    // job is named there as future operational work, not built here.
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

mediaSchema.index({ createdAt: -1 });
mediaSchema.index({ deletedAt: 1 });

export type MediaDocument = InferSchemaType<typeof mediaSchema> & { _id: Types.ObjectId };

export const Media = defineModel<MediaDocument>("Media", mediaSchema);
