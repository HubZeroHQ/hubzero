"use server";

import { requirePermission } from "@/lib/cms/permissions";
import {
  type ClientMedia,
  type ListMediaResult,
  MediaInUseError,
  MediaUploadError,
  deleteMedia,
  getMediaById,
  getMediaByIds,
  listMedia,
  uploadMedia,
} from "@/lib/cms/media";

/**
 * The Server Actions behind the media library and the `<MediaPicker>` form
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
      uploadedBy: user.id,
    });
    return { status: "success", media };
  } catch (error) {
    if (error instanceof MediaUploadError) {
      return { status: "error", formError: error.message };
    }
    console.error("Failed to upload media:", error);
    return { status: "error", formError: "Something went wrong while uploading. Please try again." };
  }
}

export async function searchMediaAction(params: {
  q?: string;
  cursor?: string;
}): Promise<ListMediaResult> {
  await requirePermission("view", "media");
  return listMedia(params);
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
  await requirePermission("delete", "media");
  try {
    await deleteMedia(id);
    return { status: "success" };
  } catch (error) {
    if (error instanceof MediaInUseError) {
      return { status: "error", message: error.message };
    }
    console.error(`Failed to delete media ${id}:`, error);
    return { status: "error", message: "Something went wrong. Please try again." };
  }
}
