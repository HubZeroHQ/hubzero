'use client';

import type { SignedUploadParams } from './cloudinary';
import type { CloudinaryUploadResult } from '@/lib/studio/actions/media';

/**
 * Direct browser→Cloudinary upload (§26.10, §33 — Cloudinary is the sole
 * binary store, our server never proxies the file). Uses `XMLHttpRequest`
 * rather than `fetch` specifically because `fetch` has no standard upload
 * progress event — `xhr.upload.onprogress` is the only way to drive a real
 * progress bar for a large file, which CMS_PRODUCT_DESIGN.md §6 calls for
 * explicitly ("Progress indicator during upload").
 */

export class UploadError extends Error {
  constructor(
    message: string,
    public readonly retryable: boolean,
  ) {
    super(message);
    this.name = 'UploadError';
  }
}

/** Mirrors the AI reference-uploader's own size limit (`lib/studio/actions/ai-extraction.ts`'s `10 * 1024 * 1024`) so the two upload paths in Studio agree on one number rather than each guessing its own. */
export const MAX_IMAGE_UPLOAD_BYTES = 10 * 1024 * 1024;

/**
 * Client-side pre-flight check, run before any network request. The file
 * picker's `accept="image/*"` only filters what the OS dialog *shows* — it
 * does nothing for drag-and-drop, which can hand either uploader any file on
 * disk. Without this, an invalid file would upload all the way to
 * Cloudinary before failing with a generic `"Upload failed (400)."`,
 * wasting the round trip and giving no indication of what was actually
 * wrong. Returns a user-facing message, or `null` if `file` is fine to
 * upload.
 */
export function validateImageFile(file: File): string | null {
  if (!file.type.startsWith('image/')) {
    return 'Only image files are supported.';
  }
  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    return `Images must be smaller than ${MAX_IMAGE_UPLOAD_BYTES / (1024 * 1024)}MB.`;
  }
  return null;
}

function uploadOnce(
  file: File,
  params: SignedUploadParams,
  onProgress?: (fraction: number) => void,
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', params.apiKey);
    formData.append('timestamp', String(params.timestamp));
    formData.append('signature', params.signature);
    formData.append('folder', params.folder);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${params.cloudName}/auto/upload`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(event.loaded / event.total);
      }
    };

    xhr.onload = () => {
      if (xhr.status < 200 || xhr.status >= 300) {
        // 4xx (bad signature, unsupported file) won't succeed on retry; 5xx/network might.
        reject(new UploadError(`Upload failed (${xhr.status}).`, xhr.status >= 500));
        return;
      }
      try {
        const body = JSON.parse(xhr.responseText) as {
          public_id: string;
          secure_url: string;
          width?: number;
          height?: number;
          bytes?: number;
          format?: string;
          resource_type?: string;
          original_filename?: string;
        };
        resolve({
          publicId: body.public_id,
          url: body.secure_url,
          width: body.width,
          height: body.height,
          fileSizeBytes: body.bytes,
          mimeType: body.format ? `${body.resource_type ?? 'image'}/${body.format}` : undefined,
          originalFilename: body.original_filename,
        });
      } catch {
        reject(new UploadError('Cloudinary returned an unreadable response.', true));
      }
    };

    xhr.onerror = () => reject(new UploadError('Network error during upload.', true));
    xhr.send(formData);
  });
}

/** Retries once on a transient (network/5xx) failure — never on a rejection Cloudinary itself won't reconsider. */
export async function uploadToCloudinary(
  file: File,
  params: SignedUploadParams,
  onProgress?: (fraction: number) => void,
): Promise<CloudinaryUploadResult> {
  try {
    return await uploadOnce(file, params, onProgress);
  } catch (error) {
    if (error instanceof UploadError && error.retryable) {
      return uploadOnce(file, params, onProgress);
    }
    throw error;
  }
}
