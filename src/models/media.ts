import { Schema, type InferSchemaType, type Types } from "mongoose";

import { defineModel } from "@/models/shared/define-model";

/**
 * `ARCHITECTURE/19_CMS_FOUNDATION.md` §8's `Media` collection — every
 * `image`/`imageArray` form field across every collection stores a `Media`
 * `_id` reference here, never a raw URL string, so "which documents use this
 * image" is a real query (`lib/cms/media.ts`'s `getMediaUsage`), not a manual
 * audit.
 *
 * Stores only remote-storage metadata (`publicId`/`assetId`/`secureUrl`/
 * `width`/`height`/`bytes`/`format`/`folder`/`resourceType`) — no bytes, no
 * generated variants. Cloudinary (or the local fallback adapter, `provider`)
 * is the source of truth for the actual file; this document is a pointer plus
 * editorial metadata (`alt`/`caption`) plus dedup bookkeeping (`hash`).
 *
 * `hash` (sha256 of the file's bytes, truncated) is what makes re-uploading
 * the identical file a no-op (`lib/cms/media.ts`'s `uploadMedia` looks up by
 * hash before ever uploading again) — a separate, indexed field from
 * `publicId` (which is *derived* from that same hash, but the lookup
 * shouldn't depend on reconstructing that convention).
 */
const mediaSchema = new Schema(
  {
    provider: { type: String, enum: ["cloudinary", "local"], required: true },
    publicId: { type: String, required: true, unique: true, trim: true },
    assetId: { type: String, trim: true },
    secureUrl: { type: String, required: true, trim: true },
    hash: { type: String, required: true, unique: true, trim: true },
    originalName: { type: String, required: true, trim: true, maxlength: 255 },
    mimeType: { type: String, required: true, trim: true },
    bytes: { type: Number, required: true },
    format: { type: String, required: true, trim: true },
    resourceType: { type: String, enum: ["image", "video", "raw"], required: true },
    folder: { type: String, trim: true, maxlength: 200 },
    width: { type: Number },
    height: { type: Number },
    alt: { type: String, required: true, trim: true, maxlength: 300 },
    caption: { type: String, trim: true, maxlength: 500 },
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
mediaSchema.index({ folder: 1 });

export type MediaDocument = InferSchemaType<typeof mediaSchema> & { _id: Types.ObjectId };

export const Media = defineModel<MediaDocument>("Media", mediaSchema);
