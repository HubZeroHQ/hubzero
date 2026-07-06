import { createHash } from "crypto";
import { Types } from "mongoose";

import { listCollections } from "@/lib/cms/collection-config";
import { connectToDatabase } from "@/lib/db";
import { collectBlockMediaIds } from "@/lib/cms/blocks/guard";
import type { Block } from "@/lib/cms/blocks/types";
import { serializeDocument } from "@/lib/cms/serialize";
import { getStorageAdapter } from "@/lib/cms/storage";
import type { MediaResourceType } from "@/lib/cms/storage/adapter";
import { escapeRegExp } from "@/lib/utils";
import { Media, type MediaDocument } from "@/models/media";
import type { Resource } from "@/types/cms";

/**
 * The upload/read/delete pipeline behind the `image`/`imageArray` field type
 * (`ARCHITECTURE/19_CMS_FOUNDATION.md` §8). Every collection's `image`/
 * `imageArray` field stores the `id` this module returns, never a raw URL.
 *
 * Bytes are handed to whichever `StorageAdapter` is active (`storage/index.ts`
 * — Cloudinary in production, local disk as a graceful fallback) and only the
 * adapter's returned metadata is persisted; no resize/variant pipeline runs
 * here — Cloudinary's own `q_auto`/`f_auto`/width transformations
 * (`lib/cms/media-url.ts`) replace the old fixed-width WebP variants.
 */

const ALLOWED_MIME_TYPES: Record<string, { format: string; resourceType: MediaResourceType }> = {
  "image/jpeg": { format: "jpg", resourceType: "image" },
  "image/png": { format: "png", resourceType: "image" },
  "image/webp": { format: "webp", resourceType: "image" },
  "image/gif": { format: "gif", resourceType: "image" },
  "application/pdf": { format: "pdf", resourceType: "raw" },
};

/**
 * Magic-byte signatures for every allowed type — a browser-supplied
 * `mimeType` (`File.type`) is trivially spoofable, so this is a real content
 * check rather than trusting the client's claim.
 */
const FILE_SIGNATURES: Record<string, (buffer: Buffer) => boolean> = {
  "image/jpeg": (buffer) => buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])),
  "image/png": (buffer) =>
    buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  "image/webp": (buffer) =>
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP",
  "image/gif": (buffer) => {
    const header = buffer.subarray(0, 6).toString("ascii");
    return header === "GIF87a" || header === "GIF89a";
  },
  "application/pdf": (buffer) => buffer.subarray(0, 5).toString("ascii") === "%PDF-",
};

const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

export class MediaUploadError extends Error {}

export interface ClientMedia {
  id: string;
  provider: "cloudinary" | "local";
  publicId: string;
  secureUrl: string;
  alt: string;
  caption?: string;
  originalName: string;
  mimeType: string;
  bytes: number;
  format: string;
  resourceType: MediaResourceType;
  folder?: string;
  width?: number;
  height?: number;
  createdAt: string;
}

function toClientMedia(doc: Record<string, unknown>): ClientMedia {
  const s = serializeDocument(doc) as Record<string, unknown>;
  return {
    id: String(s._id),
    provider: s.provider as "cloudinary" | "local",
    publicId: s.publicId as string,
    secureUrl: s.secureUrl as string,
    alt: s.alt as string,
    caption: (s.caption as string | undefined) || undefined,
    originalName: s.originalName as string,
    mimeType: s.mimeType as string,
    bytes: s.bytes as number,
    format: s.format as string,
    resourceType: s.resourceType as MediaResourceType,
    folder: (s.folder as string | undefined) || undefined,
    width: s.width as number | undefined,
    height: s.height as number | undefined,
    createdAt: s.createdAt as string,
  };
}

export interface UploadMediaInput {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  alt: string;
  caption?: string;
  folder?: string;
  uploadedBy: string;
}

/**
 * Content-hash-based dedup (§8): re-uploading the exact same bytes returns
 * the existing `Media` record rather than uploading a second copy to
 * storage. The hash also becomes the `publicId` handed to the storage
 * adapter — deterministic, so a hash collision reuses the same remote asset
 * rather than the adapter needing its own dedup logic.
 */
export async function uploadMedia(input: UploadMediaInput): Promise<ClientMedia> {
  const typeInfo = ALLOWED_MIME_TYPES[input.mimeType];
  if (!typeInfo) {
    throw new MediaUploadError(`Unsupported file type: "${input.mimeType}".`);
  }
  if (input.buffer.byteLength === 0) {
    throw new MediaUploadError("The uploaded file is empty.");
  }
  if (input.buffer.byteLength > MAX_UPLOAD_BYTES) {
    throw new MediaUploadError("Files must be 15MB or smaller.");
  }
  if (!FILE_SIGNATURES[input.mimeType]!(input.buffer)) {
    throw new MediaUploadError("The file's contents don't match its declared type.");
  }
  if (!input.alt.trim()) {
    throw new MediaUploadError("Alt text is required.");
  }

  await connectToDatabase();

  const hash = createHash("sha256").update(input.buffer).digest("hex").slice(0, 16);

  const existing = await Media.findOne({ hash, deletedAt: null }).lean<MediaDocument>();
  if (existing) return toClientMedia(existing as unknown as Record<string, unknown>);

  const storage = getStorageAdapter();
  const result = await storage.upload(input.buffer, {
    publicId: hash,
    format: typeInfo.format,
    resourceType: typeInfo.resourceType,
    folder: input.folder,
  });

  const created = await Media.create({
    provider: storage.provider,
    publicId: result.publicId,
    assetId: result.assetId,
    secureUrl: result.secureUrl,
    hash,
    originalName: input.originalName,
    mimeType: input.mimeType,
    bytes: result.bytes,
    format: result.format,
    resourceType: result.resourceType,
    folder: result.folder,
    width: result.width,
    height: result.height,
    alt: input.alt.trim(),
    caption: input.caption?.trim() || undefined,
    uploadedBy: new Types.ObjectId(input.uploadedBy),
  });

  return toClientMedia(created.toObject() as unknown as Record<string, unknown>);
}

/**
 * Replaces an existing `Media` document's underlying asset with new bytes
 * while keeping the same `_id` — every collection field/block that already
 * references this media keeps working with no update needed anywhere else
 * (`ARCHITECTURE/19_CMS_FOUNDATION.md` §8's "never a silent dangling
 * reference," applied to swapping a file rather than only deleting one). The
 * old asset is deleted from storage after the new one is safely uploaded and
 * saved, never before.
 */
export async function replaceMedia(
  id: string,
  input: { buffer: Buffer; originalName: string; mimeType: string },
): Promise<ClientMedia> {
  const typeInfo = ALLOWED_MIME_TYPES[input.mimeType];
  if (!typeInfo) {
    throw new MediaUploadError(`Unsupported file type: "${input.mimeType}".`);
  }
  if (input.buffer.byteLength === 0) {
    throw new MediaUploadError("The uploaded file is empty.");
  }
  if (input.buffer.byteLength > MAX_UPLOAD_BYTES) {
    throw new MediaUploadError("Files must be 15MB or smaller.");
  }
  if (!FILE_SIGNATURES[input.mimeType]!(input.buffer)) {
    throw new MediaUploadError("The file's contents don't match its declared type.");
  }

  await connectToDatabase();
  const existing = await Media.findOne({ _id: id, deletedAt: null });
  if (!existing) throw new MediaUploadError("This file no longer exists.");

  const hash = createHash("sha256").update(input.buffer).digest("hex").slice(0, 16);
  const storage = getStorageAdapter();
  const result = await storage.upload(input.buffer, {
    publicId: hash,
    format: typeInfo.format,
    resourceType: typeInfo.resourceType,
    folder: existing.folder ?? undefined,
  });

  const oldPublicId = existing.publicId;
  const oldFormat = existing.format;
  const oldResourceType = existing.resourceType as MediaResourceType;
  const oldProvider = existing.provider;

  existing.set({
    provider: storage.provider,
    publicId: result.publicId,
    assetId: result.assetId,
    secureUrl: result.secureUrl,
    hash,
    originalName: input.originalName,
    mimeType: input.mimeType,
    bytes: result.bytes,
    format: result.format,
    resourceType: result.resourceType,
    width: result.width,
    height: result.height,
  });
  await existing.save();

  if (oldPublicId !== result.publicId && oldProvider === storage.provider) {
    await storage
      .delete(oldPublicId, { resourceType: oldResourceType, format: oldFormat })
      .catch((error) => console.error(`Failed to delete replaced asset "${oldPublicId}":`, error));
  }

  return toClientMedia(existing.toObject() as unknown as Record<string, unknown>);
}

export async function renameMedia(
  id: string,
  input: { originalName?: string; alt?: string; caption?: string },
): Promise<ClientMedia> {
  await connectToDatabase();
  const update: Record<string, unknown> = {};
  if (input.originalName !== undefined) update.originalName = input.originalName.trim();
  if (input.alt !== undefined) {
    if (!input.alt.trim()) throw new MediaUploadError("Alt text is required.");
    update.alt = input.alt.trim();
  }
  if (input.caption !== undefined) update.caption = input.caption.trim() || undefined;

  const updated = await Media.findOneAndUpdate({ _id: id, deletedAt: null }, update, {
    returnDocument: "after",
  }).lean<MediaDocument>();
  if (!updated) throw new MediaUploadError("This file no longer exists.");
  return toClientMedia(updated as unknown as Record<string, unknown>);
}

export async function moveMediaToFolder(ids: string[], folder: string | null): Promise<void> {
  await connectToDatabase();
  await Media.updateMany(
    { _id: { $in: ids }, deletedAt: null },
    { folder: folder?.trim() || undefined },
  );
}

export async function listMediaFolders(): Promise<string[]> {
  await connectToDatabase();
  const folders = await Media.distinct("folder", { deletedAt: null, folder: { $ne: null } });
  return (folders as string[]).filter(Boolean).sort((a, b) => a.localeCompare(b));
}

export interface ListMediaResult {
  items: ClientMedia[];
  hasNext: boolean;
  page: number;
}

export type MediaSort = "newest" | "oldest" | "largest" | "name";

const MEDIA_PAGE_SIZE = 24;

/** The library grid + the picker modal's "choose existing" tab share this. */
export async function listMedia(params: {
  q?: string;
  folder?: string;
  resourceType?: MediaResourceType;
  sort?: MediaSort;
  page?: number;
}): Promise<ListMediaResult> {
  await connectToDatabase();

  const filter: Record<string, unknown> = { deletedAt: null };
  if (params.q) {
    const escaped = escapeRegExp(params.q);
    filter.$or = [
      { alt: { $regex: escaped, $options: "i" } },
      { caption: { $regex: escaped, $options: "i" } },
      { originalName: { $regex: escaped, $options: "i" } },
    ];
  }
  if (params.folder) filter.folder = params.folder;
  if (params.resourceType) filter.resourceType = params.resourceType;

  const sortMap: Record<MediaSort, Record<string, 1 | -1>> = {
    newest: { createdAt: -1, _id: -1 },
    oldest: { createdAt: 1, _id: 1 },
    largest: { bytes: -1, _id: -1 },
    name: { originalName: 1, _id: 1 },
  };

  const page = Math.max(1, params.page ?? 1);
  const skip = (page - 1) * MEDIA_PAGE_SIZE;

  const docs = await Media.find(filter)
    .sort(sortMap[params.sort ?? "newest"])
    .skip(skip)
    .limit(MEDIA_PAGE_SIZE + 1)
    .lean<MediaDocument[]>();

  const hasNext = docs.length > MEDIA_PAGE_SIZE;
  const items = docs
    .slice(0, MEDIA_PAGE_SIZE)
    .map((doc) => toClientMedia(doc as unknown as Record<string, unknown>));

  return { items, hasNext, page };
}

export async function getMediaById(id: string): Promise<ClientMedia | null> {
  if (!Types.ObjectId.isValid(id)) return null;
  await connectToDatabase();
  const doc = await Media.findOne({ _id: id, deletedAt: null }).lean<MediaDocument>();
  return doc ? toClientMedia(doc as unknown as Record<string, unknown>) : null;
}

export async function getMediaByIds(ids: string[]): Promise<ClientMedia[]> {
  const validIds = ids.filter((id) => Types.ObjectId.isValid(id));
  if (validIds.length === 0) return [];
  await connectToDatabase();
  const docs = await Media.find({ _id: { $in: validIds }, deletedAt: null }).lean<
    MediaDocument[]
  >();
  const byId = new Map(docs.map((doc) => [doc._id.toString(), doc]));
  // Preserve the caller's order (an `imageArray`'s own ordering matters) —
  // `$in` does not guarantee result order.
  return validIds
    .map((id) => byId.get(id))
    .filter((doc): doc is MediaDocument => Boolean(doc))
    .map((doc) => toClientMedia(doc as unknown as Record<string, unknown>));
}

export interface MediaUsage {
  resource: Resource;
  label: string;
  count: number;
}

/**
 * "Which documents use this image" as a real query
 * (`ARCHITECTURE/19_CMS_FOUNDATION.md` §8), generic across every registered
 * collection: scans each collection's own `formFields` for `image`/
 * `imageArray` fields and counts matches — a future collection with an image
 * field is covered the moment it registers, no change here.
 *
 * A `"blocks"` field (`ARCHITECTURE/20_CONTENT_BLOCKS.md`) needs a different
 * check: an Image/Gallery block's media id is nested inside the field's JSON,
 * invisible to a plain `{ [field.name]: mediaId }` equality query. Rather
 * than a fragile dot-path query across a heterogeneous array, this loads the
 * (small, five-person-team-scale) collection's block field and scans it in
 * application code — the same "app-layer integrity check, not an exotic Mongo
 * query" posture `11_DATABASE_ARCHITECTURE.md` §2 already applies to the
 * Labs↔Builds graduation link.
 */
export async function getMediaUsage(mediaId: string): Promise<MediaUsage[]> {
  await connectToDatabase();
  const usage: MediaUsage[] = [];

  for (const config of listCollections()) {
    const imageFields = config.formFields.filter(
      (field) => field.type === "image" || field.type === "imageArray",
    );
    const blockFields = config.formFields.filter((field) => field.type === "blocks");

    let count = 0;
    for (const field of imageFields) {
      count += await config.model.countDocuments({ [field.name]: mediaId });
    }

    if (blockFields.length > 0) {
      const docs = await config.model
        .find({}, Object.fromEntries(blockFields.map((field) => [field.name, 1])))
        .lean<Record<string, unknown>[]>();
      for (const doc of docs) {
        const usesMedia = blockFields.some((field) =>
          collectBlockMediaIds(doc[field.name] as Block[] | undefined).includes(mediaId),
        );
        if (usesMedia) count += 1;
      }
    }

    if (count > 0) usage.push({ resource: config.resource, label: config.label, count });
  }

  return usage;
}

export class MediaInUseError extends Error {
  constructor(public readonly usage: MediaUsage[]) {
    super(`Still used in: ${usage.map((entry) => `${entry.label} (${entry.count})`).join(", ")}.`);
    this.name = "MediaInUseError";
  }
}

/** Soft-delete only — blocked entirely while any collection still references this media (§8's "never a silent dangling reference," applied to media). */
export async function deleteMedia(id: string): Promise<void> {
  await connectToDatabase();
  const usage = await getMediaUsage(id);
  if (usage.length > 0) throw new MediaInUseError(usage);

  await Media.updateOne({ _id: id }, { deletedAt: new Date() });
}

export interface StorageUsageSummary {
  totalBytes: number;
  count: number;
  byResourceType: { resourceType: MediaResourceType; bytes: number; count: number }[];
}

/** Dashboard "storage usage" card — a real aggregation, not a per-file loop. */
export async function getStorageUsageSummary(): Promise<StorageUsageSummary> {
  await connectToDatabase();
  const rows = await Media.aggregate<{ _id: MediaResourceType; bytes: number; count: number }>([
    { $match: { deletedAt: null } },
    { $group: { _id: "$resourceType", bytes: { $sum: "$bytes" }, count: { $sum: 1 } } },
  ]);

  const byResourceType = rows.map((row) => ({
    resourceType: row._id,
    bytes: row.bytes,
    count: row.count,
  }));

  return {
    totalBytes: byResourceType.reduce((sum, row) => sum + row.bytes, 0),
    count: byResourceType.reduce((sum, row) => sum + row.count, 0),
    byResourceType,
  };
}

/**
 * Dashboard "broken media" card: a document referencing a `Media` `_id` that
 * no longer resolves (hard-deleted, or soft-deleted and thus invisible to
 * every normal read) — a dangling reference, not a "file missing from a CDN"
 * check (which would mean an external network call per asset on every
 * dashboard load; this is the cheap, generic, app-layer integrity check the
 * codebase already prefers, `getMediaUsage`'s own precedent).
 */
export interface BrokenMediaReference {
  resource: Resource;
  label: string;
  documentId: string;
  documentLabel: string;
  field: string;
  mediaId: string;
}

export async function findBrokenMediaReferences(): Promise<BrokenMediaReference[]> {
  await connectToDatabase();
  const broken: BrokenMediaReference[] = [];

  for (const config of listCollections()) {
    const imageFields = config.formFields.filter(
      (field) => field.type === "image" || field.type === "imageArray",
    );
    if (imageFields.length === 0) continue;

    const docs = await config.model
      .find({}, Object.fromEntries(imageFields.map((field) => [field.name, 1])))
      .lean<Record<string, unknown>[]>();
    if (docs.length === 0) continue;

    const referencedIds = new Set<string>();
    for (const doc of docs) {
      for (const field of imageFields) {
        const value = doc[field.name];
        if (Array.isArray(value)) value.forEach((v) => referencedIds.add(String(v)));
        else if (value) referencedIds.add(String(value));
      }
    }
    if (referencedIds.size === 0) continue;

    const existingIds = new Set(
      (
        await Media.find({ _id: { $in: [...referencedIds] } })
          .select("_id")
          .lean()
      ).map((m) => String((m as { _id: unknown })._id)),
    );

    for (const doc of docs) {
      for (const field of imageFields) {
        const value = doc[field.name];
        const ids = Array.isArray(value) ? value.map(String) : value ? [String(value)] : [];
        for (const mediaId of ids) {
          if (!existingIds.has(mediaId)) {
            broken.push({
              resource: config.resource,
              label: config.label,
              documentId: String(doc._id),
              documentLabel: config.recordLabel?.(doc) ?? String(doc._id),
              field: field.name,
              mediaId,
            });
          }
        }
      }
    }
  }

  return broken;
}
