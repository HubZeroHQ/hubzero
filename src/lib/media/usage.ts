import { ObjectId } from 'mongodb';
import { collections } from '@/lib/db/collections';
import { blueprintRepository } from '@/lib/db/repositories/blueprint';
import { buildRepository } from '@/lib/db/repositories/build';
import { labRepository } from '@/lib/db/repositories/lab';
import { noteRepository } from '@/lib/db/repositories/note';
import { teamRepository } from '@/lib/db/repositories/team';
import { engineeringProfileRepository } from '@/lib/db/repositories/engineering-profile';
import { workRepository } from '@/lib/db/repositories/work';
import type { DocumentRole, OwnerType } from '@/lib/documents/schema';

/**
 * Everywhere a Media asset can be referenced today: inside a Document's
 * `image`/`imageGallery` blocks (any owner — Work/Build/Blueprint/Lab/Note/
 * Team can each hold one, §25), or one of the handful of direct
 * Cloudinary-reference fields a collection's own metadata carries
 * (`Work.heroImageId`, `Build.heroImageId`/`galleryImageIds`,
 * `Blueprint.heroImageId`/`previewAssetIds`, `Team.portraitId`). New
 * direct-reference fields are additive to `findDirectFieldUsage` below —
 * this module never needs restructuring for one.
 */
export interface MediaUsageRef {
  ownerType: OwnerType;
  ownerId: string;
  label: string;
  referenceId?: string;
  field: 'document' | 'heroImage' | 'heroMedia' | 'galleryImage' | 'previewAsset' | 'portrait';
  documentRole?: DocumentRole;
  href: string;
}

const OWNER_DETAIL_PATH: Record<OwnerType, (id: string) => string> = {
  Work: (id) => `/studio/content/work/${id}`,
  Build: (id) => `/studio/content/builds/${id}`,
  Blueprint: (id) => `/studio/content/blueprints/${id}`,
  Lab: (id) => `/studio/content/labs/${id}`,
  Note: (id) => `/studio/content/notes/${id}`,
  Team: (id) => `/studio/team/${id}`,
  EngineeringProfile: (id) => `/studio/engineering-profiles/${id}`,
};

/** True if any block in `blocks` (searching nested `imageGallery.images` too) references `mediaId`. */
export function blocksReferenceMedia(
  blocks: Array<{ type: string; data: Record<string, unknown> }>,
  mediaId: string,
): boolean {
  return blocks.some((block) => {
    if (block.type === 'image') {
      return block.data.mediaId === mediaId;
    }
    if (block.type === 'imageGallery') {
      const images = block.data.images as Array<{ mediaId: string }> | undefined;
      return images?.some((image) => image.mediaId === mediaId) ?? false;
    }
    return false;
  });
}

async function findDocumentUsage(mediaId: string): Promise<MediaUsageRef[]> {
  const collection = await collections.documents();
  const candidates = await collection
    .find({
      $or: [
        { blocks: { $elemMatch: { type: 'image', 'data.mediaId': mediaId } } },
        { blocks: { $elemMatch: { type: 'imageGallery', 'data.images.mediaId': mediaId } } },
      ],
    })
    .toArray();

  const refs: MediaUsageRef[] = [];
  for (const doc of candidates) {
    if (!blocksReferenceMedia(doc.blocks, mediaId)) {
      continue;
    }
    const ownerId = doc.ownerId.toString();
    const label = await resolveOwnerLabel(doc.ownerType, ownerId);
    refs.push({
      ownerType: doc.ownerType,
      ownerId,
      label: label.title,
      referenceId: label.referenceId,
      field: 'document',
      documentRole: doc.role,
      href: OWNER_DETAIL_PATH[doc.ownerType](ownerId),
    });
  }
  return refs;
}

async function resolveOwnerLabel(
  ownerType: OwnerType,
  ownerId: string,
): Promise<{ title: string; referenceId?: string }> {
  switch (ownerType) {
    case 'Work': {
      const entry = await workRepository.findById(ownerId);
      return { title: entry?.title ?? 'Unknown Work entry', referenceId: entry?.referenceId };
    }
    case 'Build': {
      const entry = await buildRepository.findById(ownerId);
      return { title: entry?.title ?? 'Unknown Build', referenceId: entry?.referenceId };
    }
    case 'Blueprint': {
      const entry = await blueprintRepository.findById(ownerId);
      return { title: entry?.name ?? 'Unknown Blueprint', referenceId: entry?.referenceId };
    }
    case 'Lab': {
      const entry = await labRepository.findById(ownerId);
      return { title: entry?.title ?? 'Unknown Lab', referenceId: entry?.referenceId };
    }
    case 'Note': {
      const entry = await noteRepository.findById(ownerId);
      return { title: entry?.title ?? 'Unknown Note', referenceId: entry?.referenceId };
    }
    case 'Team': {
      const entry = await teamRepository.findById(ownerId);
      return { title: entry?.name ?? 'Unknown Team profile', referenceId: entry?.referenceId };
    }
    case 'EngineeringProfile': {
      const entry = await engineeringProfileRepository.findById(ownerId);
      const team = entry ? await teamRepository.findById(entry.teamMemberId.toString()) : null;
      return {
        title: team?.name ?? 'Unknown Engineering Profile',
        referenceId: entry?.referenceId,
      };
    }
    default: {
      const exhaustive: never = ownerType;
      return { title: `Unknown (${exhaustive as string})` };
    }
  }
}

async function findDirectFieldUsage(mediaId: string): Promise<MediaUsageRef[]> {
  const objectId = ObjectId.isValid(mediaId) ? new ObjectId(mediaId) : undefined;
  if (!objectId) {
    return [];
  }

  // Relation fields validated through `objectIdString` (`lib/validation/shared.ts`)
  // persist as plain hex strings, not real `ObjectId`s — a pre-existing
  // repository-layer gap (`createRepository` never converts them) that
  // predates this module. Matching both representations keeps this query
  // correct today without depending on a fix to that shared layer, and stays
  // correct if a future migration starts storing real `ObjectId`s. The
  // declared collection types say these fields are `ObjectId`, so the filter
  // needs an explicit cast to express what's actually stored at runtime.
  const idMatch = { $in: [objectId, mediaId] };

  const [
    workEntries,
    buildHeroEntries,
    buildGalleryEntries,
    blueprintHeroEntries,
    blueprintPreviewEntries,
    labHeroEntries,
    labGalleryEntries,
    teamEntries,
    profilePortraitEntries,
    profileHeroEntries,
    profileGalleryEntries,
  ] = await Promise.all([
    (await collections.work()).find({ heroImageId: idMatch } as never).toArray(),
    (await collections.builds()).find({ heroImageId: idMatch } as never).toArray(),
    (await collections.builds()).find({ galleryImageIds: idMatch } as never).toArray(),
    (await collections.blueprints()).find({ heroImageId: idMatch } as never).toArray(),
    (await collections.blueprints()).find({ previewAssetIds: idMatch } as never).toArray(),
    (await collections.labs()).find({ heroImageId: idMatch } as never).toArray(),
    (await collections.labs()).find({ galleryImageIds: idMatch } as never).toArray(),
    (await collections.team()).find({ portraitId: idMatch } as never).toArray(),
    (await collections.engineeringProfiles()).find({ portraitId: idMatch } as never).toArray(),
    (await collections.engineeringProfiles()).find({ heroMediaId: idMatch } as never).toArray(),
    (await collections.engineeringProfiles()).find({ galleryImageIds: idMatch } as never).toArray(),
  ]);

  return [
    ...workEntries.map((entry) => ({
      ownerType: 'Work' as const,
      ownerId: entry._id.toString(),
      label: entry.title,
      referenceId: entry.referenceId,
      field: 'heroImage' as const,
      href: OWNER_DETAIL_PATH.Work(entry._id.toString()),
    })),
    ...buildHeroEntries.map((entry) => ({
      ownerType: 'Build' as const,
      ownerId: entry._id.toString(),
      label: entry.title,
      referenceId: entry.referenceId,
      field: 'heroImage' as const,
      href: OWNER_DETAIL_PATH.Build(entry._id.toString()),
    })),
    ...buildGalleryEntries.map((entry) => ({
      ownerType: 'Build' as const,
      ownerId: entry._id.toString(),
      label: entry.title,
      referenceId: entry.referenceId,
      field: 'galleryImage' as const,
      href: OWNER_DETAIL_PATH.Build(entry._id.toString()),
    })),
    ...blueprintHeroEntries.map((entry) => ({
      ownerType: 'Blueprint' as const,
      ownerId: entry._id.toString(),
      label: entry.name,
      referenceId: entry.referenceId,
      field: 'heroImage' as const,
      href: OWNER_DETAIL_PATH.Blueprint(entry._id.toString()),
    })),
    ...blueprintPreviewEntries.map((entry) => ({
      ownerType: 'Blueprint' as const,
      ownerId: entry._id.toString(),
      label: entry.name,
      referenceId: entry.referenceId,
      field: 'previewAsset' as const,
      href: OWNER_DETAIL_PATH.Blueprint(entry._id.toString()),
    })),
    ...labHeroEntries.map((entry) => ({
      ownerType: 'Lab' as const,
      ownerId: entry._id.toString(),
      label: entry.title,
      referenceId: entry.referenceId,
      field: 'heroImage' as const,
      href: OWNER_DETAIL_PATH.Lab(entry._id.toString()),
    })),
    ...labGalleryEntries.map((entry) => ({
      ownerType: 'Lab' as const,
      ownerId: entry._id.toString(),
      label: entry.title,
      referenceId: entry.referenceId,
      field: 'galleryImage' as const,
      href: OWNER_DETAIL_PATH.Lab(entry._id.toString()),
    })),
    ...teamEntries.map((entry) => ({
      ownerType: 'Team' as const,
      ownerId: entry._id.toString(),
      label: entry.name,
      referenceId: entry.referenceId,
      field: 'portrait' as const,
      href: OWNER_DETAIL_PATH.Team(entry._id.toString()),
    })),
    ...profilePortraitEntries.map((entry) => ({
      ownerType: 'EngineeringProfile' as const,
      ownerId: entry._id.toString(),
      label: entry.referenceId,
      referenceId: entry.referenceId,
      field: 'portrait' as const,
      href: OWNER_DETAIL_PATH.EngineeringProfile(entry._id.toString()),
    })),
    ...profileHeroEntries.map((entry) => ({
      ownerType: 'EngineeringProfile' as const,
      ownerId: entry._id.toString(),
      label: entry.referenceId,
      referenceId: entry.referenceId,
      field: 'heroMedia' as const,
      href: OWNER_DETAIL_PATH.EngineeringProfile(entry._id.toString()),
    })),
    ...profileGalleryEntries.map((entry) => ({
      ownerType: 'EngineeringProfile' as const,
      ownerId: entry._id.toString(),
      label: entry.referenceId,
      referenceId: entry.referenceId,
      field: 'galleryImage' as const,
      href: OWNER_DETAIL_PATH.EngineeringProfile(entry._id.toString()),
    })),
  ];
}

/**
 * "Where is this asset currently used?" — the reverse-relationship question
 * the Media detail page, and the replace/delete confirmation flows, need
 * answered before touching a shared asset (CMS_PRODUCT_DESIGN.md §6).
 * Computed on demand rather than maintained as a denormalized field, since
 * usage changes any time an author edits a Document elsewhere — a stored
 * counter would drift the moment it wasn't the one thing updating it.
 */
export async function findMediaUsage(mediaId: string): Promise<MediaUsageRef[]> {
  const [documentUsage, directUsage] = await Promise.all([
    findDocumentUsage(mediaId),
    findDirectFieldUsage(mediaId),
  ]);
  return [...documentUsage, ...directUsage];
}
