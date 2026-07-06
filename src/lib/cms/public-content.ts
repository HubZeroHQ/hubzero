import { Types, type Model } from "mongoose";

import { getMediaById, getMediaByIds } from "@/lib/cms/media";
import { serializeDocument } from "@/lib/cms/serialize";
import { connectToDatabase } from "@/lib/db";
import { Blueprint } from "@/models/blueprint";
import { Build } from "@/models/build";
import { CaseStudy, type CaseStudyDocument } from "@/models/case-study";
import { LabsProject } from "@/models/labs-project";
import { Note } from "@/models/note";
import { withArrayDefault, withCardFieldDefaults } from "@/models/shared/card-fields";
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
 * Guarantees the shape every narrative document's public consumers rely on
 * (`ContentRenderer`'s `Block[]`, `techTags.join`/`.length`, contributor
 * chips) regardless of whether the document predates one of those fields or
 * has yet to be touched by `scripts/migrate-content-blocks.ts` — see
 * `withCardFieldDefaults`'s header comment for why this can't be left to
 * schema defaults alone. Every public read of a Case Study/Blueprint/Labs
 * Project/Note document should be passed through the matching
 * `finalize*`/inline call, never handed to a page as the raw `.lean()`
 * result.
 */
function finalizeCaseStudy(doc: CaseStudyDocument): CaseStudyDocument {
  return withArrayDefault(withCardFieldDefaults(doc), "techTags");
}

/**
 * The homepage feature system (`ARCHITECTURE/20_CONTENT_BLOCKS.md` §6): the
 * first still-published entry in `SiteSettings.featuredCaseStudyIds` wins
 * (an ordered, founder-curated list — future-proofed for the homepage
 * showing more than one someday, even though today's design only ever reads
 * the first); otherwise the deprecated singular `featuredCaseStudyId`, for a
 * settings document that hasn't been re-saved since that field was
 * superseded (`models/site-settings.ts`); otherwise the most recently
 * published `featured: true` Case Study; otherwise the most recently
 * published Case Study of any kind — so the homepage always has something
 * honest to show, never a hardcoded slug.
 */
export async function getFeaturedCaseStudy(): Promise<CaseStudyDocument | null> {
  await connectToDatabase();

  const settings = await SiteSettings.findOne({ singletonKey: "default" }).lean<{
    featuredCaseStudyIds?: Types.ObjectId[];
    featuredCaseStudyId?: Types.ObjectId;
  }>();

  const candidateIds: Types.ObjectId[] = [
    ...(Array.isArray(settings?.featuredCaseStudyIds) ? settings.featuredCaseStudyIds : []),
    ...(settings?.featuredCaseStudyId ? [settings.featuredCaseStudyId] : []),
  ];

  for (const id of candidateIds) {
    const picked = await CaseStudy.findOne({
      _id: id,
      status: "published",
    }).lean<CaseStudyDocument>();
    if (picked) return finalizeCaseStudy(serializeDocument(picked) as CaseStudyDocument);
  }

  const featured = await CaseStudy.findOne({ status: "published", featured: true })
    .sort({ publishedAt: -1 })
    .lean<CaseStudyDocument>();
  if (featured) return finalizeCaseStudy(serializeDocument(featured) as CaseStudyDocument);

  const mostRecent = await CaseStudy.findOne({ status: "published" })
    .sort({ publishedAt: -1 })
    .lean<CaseStudyDocument>();
  return mostRecent ? finalizeCaseStudy(serializeDocument(mostRecent) as CaseStudyDocument) : null;
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

export interface TeamMemberContribution {
  collectionLabel: string;
  title: string;
  summary: string;
  /** `null` when the collection has no public detail route yet (`Build` —
   * see `ARCHITECTURE/20_CONTENT_BLOCKS.md` §4's note that it's Studio-only
   * today) — rendered as plain text rather than a broken link. */
  href: string | null;
  publishedAt: Date | null;
}

/**
 * The reverse of `contributors`/`authorId`: everything a `TeamMember` is
 * credited on, queried live from the same relationship every narrative
 * collection already stores — never a second, duplicated "featured work"
 * list an editor has to keep in sync by hand (`ARCHITECTURE/20_CONTENT_BLOCKS.md`
 * §4's "a real relationship, never free text" applies in both directions).
 * One query per collection (five total, run in parallel) rather than an
 * aggregation across models Mongoose can't natively join across — cheap at
 * this scale, and each collection's own shape stays untouched.
 */
export async function getTeamMemberContributions(
  teamMemberId: string,
): Promise<TeamMemberContribution[]> {
  await connectToDatabase();

  const [caseStudies, builds, labsProjects, blueprints, notes] = await Promise.all([
    CaseStudy.find({ status: "published", contributors: teamMemberId })
      .select("client slug summary publishedAt")
      .sort({ publishedAt: -1 })
      .lean(),
    Build.find({ status: "published", contributors: teamMemberId })
      .select("title slug tagline publishedAt")
      .sort({ publishedAt: -1 })
      .lean(),
    LabsProject.find({ status: "published", contributors: teamMemberId })
      .select("title slug summary publishedAt")
      .sort({ publishedAt: -1 })
      .lean(),
    Blueprint.find({ status: "published", contributors: teamMemberId })
      .select("name slug summary publishedAt")
      .sort({ publishedAt: -1 })
      .lean(),
    Note.find({
      status: "published",
      $or: [{ contributors: teamMemberId }, { authorId: teamMemberId }],
    })
      .select("title slug summary publishedAt")
      .sort({ publishedAt: -1 })
      .lean(),
  ]);

  const contributions: TeamMemberContribution[] = [
    ...caseStudies.map((doc) => ({
      collectionLabel: "Case Studies",
      title: doc.client,
      summary: doc.summary,
      href: `/work/${doc.slug}`,
      publishedAt: doc.publishedAt ?? null,
    })),
    ...builds.map((doc) => ({
      collectionLabel: "Builds",
      title: doc.title,
      summary: doc.tagline,
      href: null,
      publishedAt: doc.publishedAt ?? null,
    })),
    ...labsProjects.map((doc) => ({
      collectionLabel: "Labs",
      title: doc.title,
      summary: doc.summary,
      href: `/labs/${doc.slug}`,
      publishedAt: doc.publishedAt ?? null,
    })),
    ...blueprints.map((doc) => ({
      collectionLabel: "Blueprints",
      title: doc.name,
      summary: doc.summary,
      href: `/blueprints/${doc.slug}`,
      publishedAt: doc.publishedAt ?? null,
    })),
    ...notes.map((doc) => ({
      collectionLabel: "Notes",
      title: doc.title,
      summary: doc.summary,
      href: `/notes/${doc.slug}`,
      publishedAt: doc.publishedAt ?? null,
    })),
  ];

  contributions.sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0));
  return serializeDocument(contributions);
}
