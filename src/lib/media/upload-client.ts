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
