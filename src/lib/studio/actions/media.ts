'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { requireCapability } from '@/lib/auth/permissions';
import { mediaRepository } from '@/lib/db/repositories/media';
import {
  createSignedUploadParams,
  deleteCloudinaryAsset,
  type SignedUploadParams,
} from '@/lib/media/cloudinary';
import { toMediaAssetDTO, type MediaAssetDTO } from '@/lib/media/dto';
import { findMediaUsage, type MediaUsageRef } from '@/lib/media/usage';
import { mediaAssetSchema } from '@/lib/validation/media';
import type { MediaFolder } from '@/types/studio';
import { invalidatePublicMedia } from '@/lib/public/cache';

const MEDIA_LIST_PATH = '/studio/library/media';
const mediaDetailPath = (id: string) => `${MEDIA_LIST_PATH}/${id}`;

export interface MediaActionState {
  error?: string;
}

/** The Cloudinary upload response's shape, trimmed to the fields Media actually persists. */
export interface CloudinaryUploadResult {
  publicId: string;
  url: string;
  width?: number;
  height?: number;
  fileSizeBytes?: number;
  mimeType?: string;
  originalFilename?: string;
}

/**
 * Issues a short-lived signature so the browser can upload directly to
 * Cloudinary (§26.10, §33) — the API secret never reaches the client.
 * Folder is a one-level grouping tag (`lib/validation/media.ts`'s
 * `MEDIA_FOLDERS`), not a real Cloudinary folder tree.
 */
export async function requestUploadSignatureAction(
  folder: MediaFolder,
): Promise<SignedUploadParams> {
  await requireCapability('manageMedia');
  return createSignedUploadParams(`hubzero/${folder}`);
}

/** Persists the Mongo metadata record once the browser's direct-to-Cloudinary upload succeeds. */
export async function createMediaFromUploadAction(input: {
  upload: CloudinaryUploadResult;
  altText: string;
  folder: MediaFolder;
  caption?: string;
  credit?: string;
  reuseTags?: string[];
}): Promise<{ data?: MediaAssetDTO; error?: string }> {
  let userId: string;
  try {
    await requireCapability('manageMedia');
    const session = await auth();
    userId = session!.user.id;
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'You cannot upload media.' };
  }

  try {
    const parsed = mediaAssetSchema.parse({
      cloudinaryPublicId: input.upload.publicId,
      url: input.upload.url,
      altText: input.altText,
      caption: input.caption,
      credit: input.credit,
      width: input.upload.width,
      height: input.upload.height,
      fileSizeBytes: input.upload.fileSizeBytes,
      mimeType: input.upload.mimeType,
      originalFilename: input.upload.originalFilename,
      folder: input.folder,
      reuseTags: input.reuseTags ?? [],
    });

    const created = await mediaRepository.create(parsed, { createdByUserId: userId });
    invalidatePublicMedia(created._id.toString());
    revalidatePath(MEDIA_LIST_PATH);
    return { data: toMediaAssetDTO(created) };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Could not save this upload.' };
  }
}

export async function updateMediaMetadataAction(
  id: string,
  input: {
    altText: string;
    caption?: string;
    credit?: string;
    folder: MediaFolder;
    reuseTags: string[];
  },
): Promise<MediaActionState> {
  try {
    await requireCapability('manageMedia');
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'You cannot edit media.' };
  }

  try {
    const updated = await mediaRepository.update(id, input);
    if (!updated) {
      return { error: 'This asset no longer exists.' };
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Could not save changes.' };
  }

  revalidatePath(mediaDetailPath(id));
  revalidatePath(MEDIA_LIST_PATH);
  invalidatePublicMedia(id);
  return {};
}

/**
 * The rare, deliberate "replace this file everywhere it's used" action
 * (CMS_PRODUCT_DESIGN.md §6, Appendix B.2) — mutates the existing Media
 * record's Cloudinary reference in place rather than creating a new
 * record, so every Document/field already pointing at this `_id`
 * automatically shows the new file with zero changes elsewhere. This is
 * the one intentional exception to "replacing an asset creates a new
 * record" — that rule is about a single block-level swap (handled entirely
 * client-side in `MediaPicker`, never touching this action), not this
 * asset-level operation.
 */
export async function replaceMediaAssetFileAction(
  id: string,
  upload: CloudinaryUploadResult,
): Promise<{ data?: MediaAssetDTO; error?: string }> {
  try {
    await requireCapability('manageMedia');
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'You cannot replace media.' };
  }

  const existing = await mediaRepository.findById(id);
  if (!existing) {
    return { error: 'This asset no longer exists.' };
  }

  let updated;
  try {
    updated = await mediaRepository.update(id, {
      cloudinaryPublicId: upload.publicId,
      url: upload.url,
      width: upload.width,
      height: upload.height,
      fileSizeBytes: upload.fileSizeBytes,
      mimeType: upload.mimeType,
      originalFilename: upload.originalFilename,
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Could not replace the asset.' };
  }

  if (!updated) {
    return { error: 'Could not replace the asset.' };
  }

  if (existing.cloudinaryPublicId !== upload.publicId) {
    await deleteCloudinaryAsset(existing.cloudinaryPublicId);
  }

  revalidatePath(mediaDetailPath(id));
  revalidatePath(MEDIA_LIST_PATH);
  invalidatePublicMedia(id);
  return { data: toMediaAssetDTO(updated) };
}

/**
 * Deletes both the Mongo record and the Cloudinary binary. Refuses on the
 * first call if the asset is still referenced anywhere — the caller (the
 * Media detail page, or a Media Picker's manage view) is expected to fetch
 * `getMediaUsageAction` first, show the reader the usage list, and only
 * pass `force: true` once a human has explicitly confirmed past that
 * warning (CMS_PRODUCT_DESIGN.md §6 — a usage-count warning, not a silent
 * block, since a genuinely unused reference is the common case).
 */
export async function deleteMediaAction(
  id: string,
  options?: { force?: boolean },
): Promise<MediaActionState> {
  try {
    await requireCapability('manageMedia');
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'You cannot delete media.' };
  }

  const asset = await mediaRepository.findById(id);
  if (!asset) {
    return { error: 'This asset no longer exists.' };
  }

  if (!options?.force) {
    const usage = await findMediaUsage(id);
    if (usage.length > 0) {
      return {
        error: `This asset is used in ${usage.length} place${usage.length === 1 ? '' : 's'}. Confirm to delete it anyway.`,
      };
    }
  }

  await deleteCloudinaryAsset(asset.cloudinaryPublicId);
  await mediaRepository.remove(id);
  invalidatePublicMedia(id);
  revalidatePath(MEDIA_LIST_PATH);
  return {};
}

/** The Media Picker's data source (CMS_PRODUCT_DESIGN.md §6's grid picker with search/filter). */
export async function searchMediaAction(input?: {
  query?: string;
  folder?: MediaFolder;
  tag?: string;
}): Promise<MediaAssetDTO[]> {
  await requireCapability('manageMedia');

  const all = await mediaRepository.list();
  const query = input?.query?.trim().toLowerCase();

  const filtered = all.filter((asset) => {
    if (input?.folder && asset.folder !== input.folder) {
      return false;
    }
    if (input?.tag && !asset.reuseTags.includes(input.tag)) {
      return false;
    }
    if (!query) {
      return true;
    }
    return (
      asset.altText.toLowerCase().includes(query) ||
      (asset.originalFilename?.toLowerCase().includes(query) ?? false) ||
      asset.reuseTags.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  return filtered
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 60)
    .map(toMediaAssetDTO);
}

export async function getMediaUsageAction(id: string): Promise<MediaUsageRef[]> {
  await requireCapability('manageMedia');
  return findMediaUsage(id);
}
