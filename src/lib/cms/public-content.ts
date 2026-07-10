import { Types, type Model } from "mongoose";

import "@/lib/cms/collections";

import { getCollection, type PublicCard } from "@/lib/cms/collection-config";
import { type HomepageResource, isHomepageResource } from "@/lib/cms/homepage-resources";
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

interface CardDocument {
  contributors?: unknown;
  content?: unknown;
  featured?: unknown;
  readingTimeMinutes?: unknown;
  [key: string]: unknown;
}

/**
 * The shared body of every browsing-card list page (Work/Labs/Blueprints —
 * Notes stays separate below since it also merges `authorId` into the same
 * "people" batch, a shape the other three don't have): fetch the published
 * documents, guarantee the card-metadata shape (`withCardFieldDefaults`/
 * `withArrayDefault` — the same `.lean()`-bypasses-defaults hazard the
 * detail pages guard against), then batch-resolve every contributor across
 * every document in exactly one `getPublicTeamMembers` call, never one per
 * card. Extracted once three collections' list pages needed the identical
 * four-step sequence (`ARCHITECTURE/20_CONTENT_BLOCKS.md` §5's card-metadata
 * additions), rather than left as three near-identical copies.
 */
export async function findPublishedWithCardMeta<T extends CardDocument>(
  model: Model<T>,
  tagField: keyof T & string,
): Promise<{ docs: T[]; contributorsById: Map<string, PublicTeamMember> }> {
  const raw = await findPublished<T>(model);
  const docs = raw.map((doc) => withArrayDefault(withCardFieldDefaults(doc), tagField));

  const contributorIds = [
    ...new Set(docs.flatMap((doc) => (doc.contributors as unknown[]).map(String))),
  ];
  const contributors = await getPublicTeamMembers(contributorIds);
  const contributorsById = new Map(contributors.map((member) => [member.id, member]));

  return { docs, contributorsById };
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

  return {
    url: media.secureUrl,
    alt: media.alt,
    width: media.width,
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
    map[item.id] = {
      url: item.secureUrl,
      alt: item.alt,
      width: item.width,
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

/** One resolved homepage item, generic across every homepage-featurable collection (`lib/cms/homepage-resources.ts`) — the shape `<HomepageHero>`/`<HomepageFeaturedGrid>` render, never branching on `resource` themselves. */
export interface HomepageContentItem {
  resource: HomepageResource;
  title: string;
  summary: string;
  href: string | null;
  cover: ResolvedImage | null;
  techTags: string[];
  featured: boolean;
  readingTimeMinutes: number;
  contributors: PublicTeamMember[];
}

export interface HomepageContent {
  hero: HomepageContentItem | null;
  items: HomepageContentItem[];
}

/**
 * The homepage content configuration (`ARCHITECTURE/20_CONTENT_BLOCKS.md`
 * §6): resolves `SiteSettings.homepageItems` — an ordered, cross-collection
 * list an admin curates in Studio — into ready-to-render cards, generic over
 * every homepage-featurable collection via each one's own `publicCard`
 * (`collection-config.ts`). Invisible or since-unpublished items are silently
 * skipped rather than surfaced as gaps; the item marked `isHero` (if any)
 * becomes `hero`, and every other visible, still-published item becomes
 * `items`, in configured order.
 *
 * Falls back to the pre-this-milestone behavior when nothing is configured
 * yet (a fresh install, or one that hasn't touched the new homepage config)
 * — the most recently published `featured: true` Case Study, then the most
 * recently published Case Study of any kind — so the homepage is never left
 * with nothing to show.
 */
export async function getHomepageContent(): Promise<HomepageContent> {
  await connectToDatabase();

  const settings = await SiteSettings.findOne({ singletonKey: "default" }).lean<{
    homepageItems?: { resource: string; id: Types.ObjectId; visible: boolean; isHero: boolean }[];
    featuredCaseStudyIds?: Types.ObjectId[];
    featuredCaseStudyId?: Types.ObjectId;
  }>();

  const configured = (settings?.homepageItems ?? []).filter(
    (item) => item.visible && isHomepageResource(item.resource),
  );

  interface PendingItem {
    resource: HomepageResource;
    card: PublicCard;
    isHero: boolean;
  }

  const pending: PendingItem[] = [];
  for (const configuredItem of configured) {
    const resource = configuredItem.resource as HomepageResource;
    const config = getCollection(resource);
    if (!config?.publicCard) continue;

    const doc = await config.model
      .findOne({ _id: configuredItem.id, status: "published" })
      .lean<Record<string, unknown>>();
    if (!doc) continue;

    pending.push({
      resource,
      card: config.publicCard(withCardFieldDefaults(doc)),
      isHero: configuredItem.isHero,
    });
  }

  if (pending.length > 0) {
    const coverMap = await resolveMediaMap(
      pending.map((item) => item.card.coverImageId).filter((id): id is string => Boolean(id)),
    );
    const contributors = await getPublicTeamMembers(
      pending.flatMap((item) => item.card.contributorIds),
    );
    const contributorsById = new Map(contributors.map((member) => [member.id, member]));

    const finalized: (HomepageContentItem & { isHero: boolean })[] = pending.map(
      ({ resource, card, isHero }) => ({
        resource,
        title: card.title,
        summary: card.summary,
        href: card.href,
        cover: card.coverImageId ? (coverMap[card.coverImageId] ?? null) : null,
        techTags: card.techTags,
        featured: card.featured,
        readingTimeMinutes: card.readingTimeMinutes,
        contributors: card.contributorIds
          .map((id) => contributorsById.get(id))
          .filter((member): member is PublicTeamMember => Boolean(member)),
        isHero,
      }),
    );

    const hero = finalized.find((item) => item.isHero) ?? null;
    return { hero, items: finalized.filter((item) => item !== hero) };
  }

  // Legacy fallback (pre-homepage-config deployments).
  const candidateIds: Types.ObjectId[] = [
    ...(Array.isArray(settings?.featuredCaseStudyIds) ? settings.featuredCaseStudyIds : []),
    ...(settings?.featuredCaseStudyId ? [settings.featuredCaseStudyId] : []),
  ];

  let legacyCaseStudy: CaseStudyDocument | null = null;
  for (const id of candidateIds) {
    const picked = await CaseStudy.findOne({
      _id: id,
      status: "published",
    }).lean<CaseStudyDocument>();
    if (picked) {
      legacyCaseStudy = finalizeCaseStudy(serializeDocument(picked) as CaseStudyDocument);
      break;
    }
  }
  if (!legacyCaseStudy) {
    const featured = await CaseStudy.findOne({ status: "published", featured: true })
      .sort({ publishedAt: -1 })
      .lean<CaseStudyDocument>();
    legacyCaseStudy = featured
      ? finalizeCaseStudy(serializeDocument(featured) as CaseStudyDocument)
      : null;
  }
  if (!legacyCaseStudy) {
    const mostRecent = await CaseStudy.findOne({ status: "published" })
      .sort({ publishedAt: -1 })
      .lean<CaseStudyDocument>();
    legacyCaseStudy = mostRecent
      ? finalizeCaseStudy(serializeDocument(mostRecent) as CaseStudyDocument)
      : null;
  }
  if (!legacyCaseStudy) return { hero: null, items: [] };

  const cover = await resolveCoverImage(
    legacyCaseStudy.coverImage ? String(legacyCaseStudy.coverImage) : undefined,
  );
  const contributors = await getPublicTeamMembers((legacyCaseStudy.contributors ?? []).map(String));

  return {
    hero: {
      resource: "caseStudy",
      title: legacyCaseStudy.client,
      summary: legacyCaseStudy.summary,
      href: `/work/${legacyCaseStudy.slug}`,
      cover,
      techTags: legacyCaseStudy.techTags,
      featured: legacyCaseStudy.featured,
      readingTimeMinutes: legacyCaseStudy.readingTimeMinutes,
      contributors,
    },
    items: [],
  };
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

export interface TeamMemberProfileData {
  contributions: TeamMemberContribution[];
  /**
   * Deduped `techTags`/`techStack`/`tags` pulled from the same contributed
   * docs above — computed, not stored, so it can never drift from the
   * self-reported `TeamMember.skills` field it's deliberately kept separate
   * from (one is "what I claim," the other is "what I've actually shipped").
   */
  techStack: string[];
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
export async function getTeamMemberProfileData(
  teamMemberId: string,
): Promise<TeamMemberProfileData> {
  await connectToDatabase();

  // Capped per collection — a founder/core member credited on nearly
  // everything shouldn't turn their own profile page into an unbounded
  // fetch-and-render of the entire catalog; the page shows recent
  // highlights, not a complete archive.
  const PER_COLLECTION_LIMIT = 25;

  const [caseStudies, builds, labsProjects, blueprints, notes] = await Promise.all([
    CaseStudy.find({ status: "published", contributors: teamMemberId })
      .select("client slug summary publishedAt techTags")
      .sort({ publishedAt: -1 })
      .limit(PER_COLLECTION_LIMIT)
      .lean(),
    Build.find({ status: "published", contributors: teamMemberId })
      .select("title slug tagline publishedAt techTags")
      .sort({ publishedAt: -1 })
      .limit(PER_COLLECTION_LIMIT)
      .lean(),
    LabsProject.find({ status: "published", contributors: teamMemberId })
      .select("title slug summary publishedAt techTags")
      .sort({ publishedAt: -1 })
      .limit(PER_COLLECTION_LIMIT)
      .lean(),
    Blueprint.find({ status: "published", contributors: teamMemberId })
      .select("name slug summary publishedAt techStack")
      .sort({ publishedAt: -1 })
      .limit(PER_COLLECTION_LIMIT)
      .lean(),
    Note.find({
      status: "published",
      $or: [{ contributors: teamMemberId }, { authorId: teamMemberId }],
    })
      .select("title slug summary publishedAt tags")
      .sort({ publishedAt: -1 })
      .limit(PER_COLLECTION_LIMIT)
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

  const techStack = Array.from(
    new Set(
      [
        ...caseStudies.flatMap((doc) => doc.techTags ?? []),
        ...builds.flatMap((doc) => doc.techTags ?? []),
        ...labsProjects.flatMap((doc) => doc.techTags ?? []),
        ...blueprints.flatMap((doc) => doc.techStack ?? []),
        ...notes.flatMap((doc) => doc.tags ?? []),
      ].filter((tag): tag is string => Boolean(tag)),
    ),
  ).sort((a, b) => a.localeCompare(b));

  return serializeDocument({ contributions, techStack });
}
