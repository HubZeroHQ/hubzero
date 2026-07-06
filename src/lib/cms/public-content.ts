import type { Model } from "mongoose";

import { getMediaById, getMediaByIds } from "@/lib/cms/media";
import { serializeDocument } from "@/lib/cms/serialize";
import { connectToDatabase } from "@/lib/db";
import { CaseStudy, type CaseStudyDocument } from "@/models/case-study";
import { SiteSettings } from "@/models/site-settings";
import { TeamMember, type TeamMemberDocument } from "@/models/team-member";

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

/**
 * Batch-resolves every `Media` id an editorial block tree references
 * (`ContentRenderer`'s Image/Gallery blocks) into a lookup map — one query
 * for the whole document, not one per block, the same "batch population,
 * never per-row" discipline `ARCHITECTURE/19_CMS_FOUNDATION.md` §13 already
 * calls for on the admin list screens, applied here to public rendering.
 */
export async function resolveMediaMap(mediaIds: string[]): Promise<Record<string, ResolvedImage>> {
  if (mediaIds.length === 0) return {};
  const unique = [...new Set(mediaIds)];
  const media = await getMediaByIds(unique);
  const map: Record<string, ResolvedImage> = {};
  for (const item of media) {
    const largestVariant = [...item.variants].sort((a, b) => b.width - a.width)[0];
    map[item.id] = {
      url: largestVariant?.url ?? item.url,
      alt: item.alt,
      width: largestVariant?.width ?? item.width,
      height: item.height,
    };
  }
  return map;
}

/**
 * The homepage feature system (`ARCHITECTURE/20_CONTENT_BLOCKS.md` §6):
 * an explicit `SiteSettings.featuredCaseStudyId` wins when set (and still
 * published); otherwise the most recently published `featured: true` Case
 * Study; otherwise the most recently published Case Study of any kind — so
 * the homepage always has something honest to show, never a hardcoded slug.
 */
export async function getFeaturedCaseStudy(): Promise<CaseStudyDocument | null> {
  await connectToDatabase();

  const settings = await SiteSettings.findOne({ singletonKey: "default" }).lean<{
    featuredCaseStudyId?: unknown;
  }>();

  if (settings?.featuredCaseStudyId) {
    const picked = await CaseStudy.findOne({
      _id: settings.featuredCaseStudyId,
      status: "published",
    }).lean<CaseStudyDocument>();
    if (picked) return serializeDocument(picked) as CaseStudyDocument;
  }

  const featured = await CaseStudy.findOne({ status: "published", featured: true })
    .sort({ publishedAt: -1 })
    .lean<CaseStudyDocument>();
  if (featured) return serializeDocument(featured) as CaseStudyDocument;

  const mostRecent = await CaseStudy.findOne({ status: "published" })
    .sort({ publishedAt: -1 })
    .lean<CaseStudyDocument>();
  return mostRecent ? (serializeDocument(mostRecent) as CaseStudyDocument) : null;
}

export interface PublicTeamMember {
  id: string;
  username: string;
  name: string;
  role: string;
  photo: ResolvedImage | null;
}

/**
 * Resolves a narrative document's `contributors` (and Note's `authorId`) to
 * public-safe `TeamMember` display data — order-preserving, and silently
 * drops anyone not `profileVisible`/published, so an unpublished or
 * intentionally-hidden profile never leaks into a public contributor chip
 * (the same visibility gate `/team` itself enforces).
 */
export async function getPublicTeamMembers(
  ids: (string | undefined)[],
): Promise<PublicTeamMember[]> {
  const validIds = ids.filter((id): id is string => Boolean(id));
  if (validIds.length === 0) return [];

  await connectToDatabase();
  const docs = await TeamMember.find({
    _id: { $in: validIds },
    status: "published",
    profileVisible: true,
  }).lean<TeamMemberDocument[]>();

  const byId = new Map(docs.map((doc) => [doc._id.toString(), doc]));
  const ordered = validIds
    .map((id) => byId.get(id))
    .filter((doc): doc is TeamMemberDocument => Boolean(doc));

  const photoIds = ordered
    .map((doc) => doc.photo)
    .filter(Boolean)
    .map((id) => String(id));
  const photoMap = await resolveMediaMap(photoIds);

  return ordered.map((doc) => ({
    id: doc._id.toString(),
    username: doc.username,
    name: doc.name,
    role: doc.role,
    photo: doc.photo ? (photoMap[String(doc.photo)] ?? null) : null,
  }));
}
