import { createHash } from "crypto";
import { Types } from "mongoose";
import sharp from "sharp";

import { listCollections } from "@/lib/cms/collection-config";
import { connectToDatabase } from "@/lib/db";
import { serializeDocument } from "@/lib/cms/serialize";
import { getStorageAdapter } from "@/lib/cms/storage";
import { Media, type MediaDocument } from "@/models/media";
import type { Resource } from "@/types/cms";

/**
 * The upload/read/delete pipeline behind the `image`/`imageArray` field type
 * (`ARCHITECTURE/19_CMS_FOUNDATION.md` §8). Every collection's `image`/
 * `imageArray` field stores the `id` this module returns, never a raw URL.
 */

const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "application/pdf": "pdf",
};

/**
 * Magic-byte signatures for every allowed type — a browser-supplied
 * `mimeType` (`File.type`) is trivially spoofable, so `sharp(...).metadata()`
 * incidentally validating jpeg/png/webp isn't a real content check for gif
 * or pdf (both skip that pipeline, see `isProcessableImage` below). Checked
 * explicitly for all five types rather than relying on that side effect.
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

/** Resized WebP copies generated once, at upload time, so the request path never re-encodes an image (§8). Skipped for widths ≥ the original. */
const VARIANT_WIDTHS = [400, 800, 1600];

const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

export class MediaUploadError extends Error {}

export interface ClientMediaVariant {
  width: number;
  url: string;
}

export interface ClientMedia {
  id: string;
  url: string;
  alt: string;
  caption?: string;
  originalName: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  variants: ClientMediaVariant[];
  createdAt: string;
}

function toClientMedia(doc: Record<string, unknown>): ClientMedia {
  const s = serializeDocument(doc) as Record<string, unknown>;
  return {
    id: String(s._id),
    url: s.url as string,
    alt: s.alt as string,
    caption: (s.caption as string | undefined) || undefined,
    originalName: s.originalName as string,
    mimeType: s.mimeType as string,
    size: s.size as number,
    width: s.width as number | undefined,
    height: s.height as number | undefined,
    variants: (s.variants as ClientMediaVariant[] | undefined) ?? [],
    createdAt: s.createdAt as string,
  };
}

export function mediaUrl(key: string): string {
  return `/api/media/${key}`;
}

export interface UploadMediaInput {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  alt: string;
  caption?: string;
  uploadedBy: string;
}

/**
 * Content-hash-based dedup (§8): re-uploading the exact same bytes returns
 * the existing `Media` record rather than writing a second copy. Runs sharp
 * at upload time, not at request time, generating a fixed set of WebP
 * variants — the request path (the streaming Route Handler) only ever reads
 * pre-encoded bytes off disk.
 */
export async function uploadMedia(input: UploadMediaInput): Promise<ClientMedia> {
  const ext = ALLOWED_MIME_TYPES[input.mimeType];
  if (!ext) {
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
  const key = `${hash}.${ext}`;

  let width: number | undefined;
  let height: number | undefined;
  const variants: ClientMediaVariant[] = [];

  // GIF is deliberately excluded from variant generation: sharp's default
  // pipeline flattens an animated GIF to its first frame, which would
  // silently turn an animation into a static image.
  const isProcessableImage = input.mimeType.startsWith("image/") && input.mimeType !== "image/gif";

  if (isProcessableImage) {
    const metadata = await sharp(input.buffer).metadata();
    width = metadata.width;
    height = metadata.height;

    for (const variantWidth of VARIANT_WIDTHS) {
      if (!metadata.width || metadata.width <= variantWidth) continue;
      const variantBuffer = await sharp(input.buffer)
        .resize({ width: variantWidth })
        .webp({ quality: 82 })
        .toBuffer();
      const variantKey = `${hash}-${variantWidth}.webp`;
      await storage.write(variantKey, variantBuffer);
      variants.push({ width: variantWidth, url: mediaUrl(variantKey) });
    }
  }

  await storage.write(key, input.buffer);

  const created = await Media.create({
    key,
    url: mediaUrl(key),
    hash,
    originalName: input.originalName,
    mimeType: input.mimeType,
    size: input.buffer.byteLength,
    width,
    height,
    alt: input.alt.trim(),
    caption: input.caption?.trim() || undefined,
    variants,
    uploadedBy: new Types.ObjectId(input.uploadedBy),
  });

  return toClientMedia(created.toObject() as unknown as Record<string, unknown>);
}

export interface ListMediaResult {
  items: ClientMedia[];
  hasNext: boolean;
  nextCursor?: string;
}

const MEDIA_PAGE_SIZE = 24;

/** The library grid + the picker modal's "choose existing" tab share this — newest first, optional filename/alt/caption search. */
export async function listMedia(params: { q?: string; cursor?: string }): Promise<ListMediaResult> {
  await connectToDatabase();

  const filter: Record<string, unknown> = { deletedAt: null };
  if (params.q) {
    const escaped = params.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { alt: { $regex: escaped, $options: "i" } },
      { caption: { $regex: escaped, $options: "i" } },
      { originalName: { $regex: escaped, $options: "i" } },
    ];
  }
  if (params.cursor) {
    const { createdAt, id } = JSON.parse(
      Buffer.from(params.cursor, "base64url").toString("utf8"),
    ) as { createdAt: string; id: string };
    filter.$and = [
      {
        $or: [
          { createdAt: { $lt: new Date(createdAt) } },
          { createdAt: new Date(createdAt), _id: { $lt: new Types.ObjectId(id) } },
        ],
      },
    ];
  }

  const docs = await Media.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .limit(MEDIA_PAGE_SIZE + 1)
    .lean<MediaDocument[]>();

  const hasNext = docs.length > MEDIA_PAGE_SIZE;
  const page = docs.slice(0, MEDIA_PAGE_SIZE);
  const last = page[page.length - 1];
  const nextCursor =
    hasNext && last
      ? Buffer.from(
          JSON.stringify({
            createdAt: (last as unknown as { createdAt: Date }).createdAt.toISOString(),
            id: last._id.toString(),
          }),
        ).toString("base64url")
      : undefined;

  return {
    items: page.map((doc) => toClientMedia(doc as unknown as Record<string, unknown>)),
    hasNext,
    nextCursor,
  };
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
 */
export async function getMediaUsage(mediaId: string): Promise<MediaUsage[]> {
  await connectToDatabase();
  const usage: MediaUsage[] = [];

  for (const config of listCollections()) {
    const imageFields = config.formFields.filter(
      (field) => field.type === "image" || field.type === "imageArray",
    );
    if (imageFields.length === 0) continue;

    let count = 0;
    for (const field of imageFields) {
      count += await config.model.countDocuments({ [field.name]: mediaId });
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
