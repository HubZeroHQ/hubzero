/**
 * The one interface every media storage backend implements
 * (`ARCHITECTURE/19_CMS_FOUNDATION.md` §8). `lib/cms/media.ts`'s upload/read
 * pipeline is written against this interface only — swapping backends is one
 * new file implementing this shape plus a one-line change in `storage/index.ts`,
 * never a change to any calling code, schema, or `next/image` usage.
 *
 * Upload-time metadata (`width`/`height`/`bytes`/`format`) comes back from the
 * adapter itself rather than being computed by the caller — a remote backend
 * (Cloudinary) already returns this from its own upload response, and a local
 * fallback derives it once at upload time too, so `lib/cms/media.ts` never
 * needs backend-specific logic to know what an upload produced.
 */
export type MediaResourceType = "image" | "video" | "raw";

export interface StorageUploadOptions {
  /** Content-hash-derived, extension-free identifier (see `media.ts`) — never a caller-supplied path, so an adapter never needs to guard against path traversal from user input. */
  publicId: string;
  /** The file extension implied by the upload's validated mime type (e.g. `"png"`, `"pdf"`) — not re-derived by the adapter. */
  format: string;
  resourceType: MediaResourceType;
  /** A logical grouping (the Media Library's "folder" concept) — Cloudinary stores this as a real path prefix; the local adapter records it as metadata only, since local storage is flat on disk. */
  folder?: string;
}

export interface StorageUploadResult {
  publicId: string;
  /** Present for Cloudinary uploads (its own immutable asset identifier); absent for local storage, which has no equivalent concept. */
  assetId?: string;
  secureUrl: string;
  width?: number;
  height?: number;
  bytes: number;
  format: string;
  folder?: string;
  resourceType: MediaResourceType;
}

export interface StorageDeleteOptions {
  resourceType: MediaResourceType;
  format: string;
}

/**
 * Deliberately has no `url()`/transformation-building method: building a
 * `q_auto,f_auto` responsive Cloudinary delivery URL needs only the (public,
 * safe-to-expose) cloud name and a publicId — never the API secret this
 * server-only adapter is constructed with — so that logic lives in the
 * client-safe `lib/cms/media-url.ts` instead, callable from `"use client"`
 * components without pulling the `cloudinary` SDK into the client bundle.
 */
export interface StorageAdapter {
  readonly provider: "cloudinary" | "local";
  upload(data: Buffer, options: StorageUploadOptions): Promise<StorageUploadResult>;
  delete(publicId: string, options: StorageDeleteOptions): Promise<void>;
}
