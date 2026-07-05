import type { Model } from "mongoose";

import { getMediaById } from "@/lib/cms/media";
import { serializeDocument } from "@/lib/cms/serialize";
import { connectToDatabase } from "@/lib/db";

/**
 * The public-read half of every workflow collection — deliberately not
 * routed through `createCrudActions()`'s `list()`/`getOne()` (both call
 * `requirePermission("view", ...)`, which a public marketing page visitor
 * can never satisfy). Public pages only ever need "the published ones,"
 * never draft/review content, so `status: "published"` is baked in here
 * rather than left to each page to remember. One implementation, reused by
 * every collection with a public page (Case Study, Team, Notes, Careers,
 * Labs) — matches `19_CMS_FOUNDATION.md`'s own framing that this read
 * "belongs next to the same collection's write actions," generalized once
 * five collections needed the identical query shape.
 */

export async function findPublished<T>(
  model: Model<T>,
  filter: Record<string, unknown> = {},
  sort: Record<string, 1 | -1> = { publishedAt: -1 },
): Promise<T[]> {
  await connectToDatabase();
  const docs = await model
    .find({ ...filter, status: "published" })
    .sort(sort)
    .lean();
  return serializeDocument(docs) as T[];
}

export async function findOnePublished<T>(
  model: Model<T>,
  filter: Record<string, unknown>,
): Promise<T | null> {
  await connectToDatabase();
  const doc = await model.findOne({ ...filter, status: "published" }).lean();
  return doc ? (serializeDocument(doc) as T) : null;
}

export interface ResolvedImage {
  url: string;
  alt: string;
  width?: number;
  height?: number;
}

/**
 * Resolves a `Media` reference (an `image` field's stored `_id`) to a
 * renderable URL — the public-page counterpart to the Studio's
 * `<MediaThumbnail>`. `getMediaById` (`lib/cms/media.ts`) has no permission
 * gate of its own (enforcement lives at the Server Action boundary, not the
 * data layer), so it's safe to call directly from a public Server Component.
 */
export async function resolveCoverImage(
  mediaId: string | null | undefined,
): Promise<ResolvedImage | null> {
  if (!mediaId) return null;
  const media = await getMediaById(mediaId);
  if (!media) return null;

  const largestVariant = [...media.variants].sort((a, b) => b.width - a.width)[0];
  return {
    url: largestVariant?.url ?? media.url,
    alt: media.alt,
    width: largestVariant?.width ?? media.width,
    height: media.height,
  };
}
