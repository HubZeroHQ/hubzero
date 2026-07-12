"use server";

import { revalidatePath } from "next/cache";

import { notify } from "@/lib/cms/notifications";
import { requirePermission } from "@/lib/cms/permissions";
import { Media } from "@/models/media";
import {
  type BrokenMediaReference,
  type ClientMedia,
  type ListMediaResult,
  type MediaSort,
  type MediaUsage,
  MediaInUseError,
  MediaUploadError,
  deleteMedia,
  findBrokenMediaReferences,
  getMediaById,
  getMediaByIds,
  getMediaUsage,
  getStorageUsageSummary,
  listMedia,
  listMediaFolders,
  moveMediaToFolder,
  renameMedia,
  replaceMedia,
  type StorageUsageSummary,
  uploadMedia,
} from "@/lib/cms/media";
import type { MediaResourceType } from "@/lib/cms/storage/adapter";

/**
 * The Server Actions behind the Media Library and the `<MediaPicker>` form
 * field (`ARCHITECTURE/19_CMS_FOUNDATION.md` §8) — every one of them checks
 * `can()` independently (via `requirePermission`) rather than trusting that
 * only the intended UI ever calls them, the same defense-in-depth posture
 * every other collection's Server Actions already follow.
 */

export interface MediaUploadActionState {
  status: "idle" | "success" | "error";
  fieldErrors?: { file?: string; alt?: string };
  formError?: string;
  media?: ClientMedia;
}

export async function uploadMediaAction(
  _prevState: MediaUploadActionState,
  formData: FormData,
): Promise<MediaUploadActionState> {
  const user = await requirePermission("create", "media");

  const file = formData.get("file");
  const alt = String(formData.get("alt") ?? "").trim();
  const caption = String(formData.get("caption") ?? "").trim();
  const folder = String(formData.get("folder") ?? "").trim();

  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", fieldErrors: { file: "Choose a file to upload." } };
  }
  if (!alt) {
    return { status: "error", fieldErrors: { alt: "Alt text is required." } };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const media = await uploadMedia({
      buffer,
      originalName: file.name,
      mimeType: file.type,
      alt,
      caption: caption || undefined,
      folder: folder || undefined,
      uploadedBy: user.id,
    });
    return { status: "success", media };
  } catch (error) {
    if (error instanceof MediaUploadError) {
      return { status: "error", formError: error.message };
    }
    console.error("Failed to upload media:", error);
    return {
      status: "error",
      formError: "Something went wrong while uploading. Please try again.",
    };
  }
}

/** Bare-bones variant of `uploadMediaAction` for drag-and-drop batch uploads — filename (minus extension) becomes the alt text placeholder rather than blocking on a per-file form. */
export type BatchUploadResult =
  | { status: "success"; media: ClientMedia; fileName: string }
  | { status: "error"; message: string; fileName: string };

export async function uploadMediaBatchAction(
  files: { name: string; type: string; buffer: ArrayBuffer }[],
  folder?: string,
): Promise<BatchUploadResult[]> {
  const user = await requirePermission("create", "media");

  const results: BatchUploadResult[] = [];
  for (const file of files) {
    try {
      const media = await uploadMedia({
        buffer: Buffer.from(file.buffer),
        originalName: file.name,
        mimeType: file.type,
        alt: file.name.replace(/\.[^.]+$/, ""),
        folder: folder || undefined,
        uploadedBy: user.id,
      });
      results.push({ status: "success", media, fileName: file.name });
    } catch (error) {
      const message =
        error instanceof MediaUploadError ? error.message : "Something went wrong while uploading.";
      results.push({ status: "error", message, fileName: file.name });
    }
  }
  return results;
}

export async function searchMediaAction(params: {
  q?: string;
  folder?: string;
  resourceType?: MediaResourceType;
  sort?: MediaSort;
  page?: number;
}): Promise<ListMediaResult> {
  await requirePermission("view", "media");
  return listMedia(params);
}

export async function listMediaFoldersAction(): Promise<string[]> {
  await requirePermission("view", "media");
  return listMediaFolders();
}

export async function getMediaByIdAction(id: string): Promise<ClientMedia | null> {
  await requirePermission("view", "media");
  return getMediaById(id);
}

export async function getMediaByIdsAction(ids: string[]): Promise<ClientMedia[]> {
  await requirePermission("view", "media");
  return getMediaByIds(ids);
}

export type DeleteMediaResult = { status: "success" } | { status: "error"; message: string };

export async function deleteMediaAction(id: string): Promise<DeleteMediaResult> {
  const actor = await requirePermission("delete", "media");
  try {
    const existing = await Media.findById(id).select("uploadedBy");
    await deleteMedia(id);
    const uploaderId = existing?.uploadedBy?.toString();
    if (uploaderId && uploaderId !== actor.id) {
      await notify({
        userId: uploaderId,
        event: "media_deleted",
        title: "A file you uploaded was deleted",
        link: "/studio/media",
        sourceCollection: "media",
        sourceDocumentId: id,
      });
    }
    return { status: "success" };
  } catch (error) {
    if (error instanceof MediaInUseError) {
      return { status: "error", message: error.message };
    }
    console.error(`Failed to delete media ${id}:`, error);
    return { status: "error", message: "Something went wrong. Please try again." };
  }
}

/** Bulk delete — every id is usage-guarded independently, so a mix of deletable and still-referenced files partially succeeds rather than all-or-nothing. */
export async function bulkDeleteMediaAction(
  ids: string[],
): Promise<{ deleted: string[]; blocked: { id: string; message: string }[] }> {
  await requirePermission("delete", "media");
  const deleted: string[] = [];
  const blocked: { id: string; message: string }[] = [];
  for (const id of ids) {
    try {
      await deleteMedia(id);
      deleted.push(id);
    } catch (error) {
      blocked.push({
        id,
        message: error instanceof MediaInUseError ? error.message : "Something went wrong.",
      });
    }
  }
  return { deleted, blocked };
}

export type RenameMediaResult =
  { status: "success"; media: ClientMedia } | { status: "error"; message: string };

export async function renameMediaAction(
  id: string,
  input: { originalName?: string; alt?: string; caption?: string },
): Promise<RenameMediaResult> {
  await requirePermission("edit", "media");
  try {
    const media = await renameMedia(id, input);
    return { status: "success", media };
  } catch (error) {
    if (error instanceof MediaUploadError) return { status: "error", message: error.message };
    console.error(`Failed to rename media ${id}:`, error);
    return { status: "error", message: "Something went wrong. Please try again." };
  }
}

export type ReplaceMediaResult =
  { status: "success"; media: ClientMedia } | { status: "error"; message: string };

/**
 * Re-uploads new bytes for an existing `Media` document while keeping its
 * `_id` — every collection field/block already referencing this asset stays
 * valid with no update needed anywhere else. Publish pages referencing this
 * asset are revalidated so the new file is visible immediately rather than
 * waiting for the next unrelated publish.
 */
export async function replaceMediaAction(
  id: string,
  formData: FormData,
): Promise<ReplaceMediaResult> {
  await requirePermission("edit", "media");
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", message: "Choose a file to upload." };
  }
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const media = await replaceMedia(id, {
      buffer,
      originalName: file.name,
      mimeType: file.type,
    });
    revalidatePath("/", "layout");
    return { status: "success", media };
  } catch (error) {
    if (error instanceof MediaUploadError) return { status: "error", message: error.message };
    console.error(`Failed to replace media ${id}:`, error);
    return { status: "error", message: "Something went wrong. Please try again." };
  }
}

export async function moveMediaToFolderAction(ids: string[], folder: string | null): Promise<void> {
  await requirePermission("edit", "media");
  await moveMediaToFolder(ids, folder);
}

export async function getStorageUsageAction(): Promise<StorageUsageSummary> {
  await requirePermission("view", "media");
  return getStorageUsageSummary();
}

export async function getBrokenMediaReferencesAction(): Promise<BrokenMediaReference[]> {
  await requirePermission("view", "media");
  return findBrokenMediaReferences();
}

export async function getMediaUsageAction(id: string): Promise<MediaUsage[]> {
  await requirePermission("view", "media");
  return getMediaUsage(id);
}
