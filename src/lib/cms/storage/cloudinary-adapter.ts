import { Readable } from "stream";

import { v2 as cloudinary, type UploadApiOptions, type UploadApiResponse } from "cloudinary";

import type {
  StorageAdapter,
  StorageDeleteOptions,
  StorageUploadOptions,
  StorageUploadResult,
} from "@/lib/cms/storage/adapter";

/**
 * The production default storage backend (`storage/index.ts`) — every
 * upload's bytes live on Cloudinary, never on the app server's own disk, and
 * `Media` stores only the metadata Cloudinary's upload response returns
 * (`ARCHITECTURE/19_CMS_FOUNDATION.md` §8). Configured lazily, read once at
 * module load from `process.env` rather than `lib/env.ts`'s always-validated
 * schema — the same "lazily-read-where-used" tier `MONGODB_URI` already
 * follows (`lib/db.ts`), since a page that never touches media shouldn't fail
 * to build without Cloudinary credentials configured.
 */
export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

export function getCloudinaryConfig(): CloudinaryConfig | null {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return null;
  return { cloudName, apiKey, apiSecret };
}

function uploadBuffer(data: Buffer, options: UploadApiOptions): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error || !result) {
        reject(error ?? new Error("Cloudinary upload returned no result."));
        return;
      }
      resolve(result);
    });
    Readable.from(data).pipe(uploadStream);
  });
}

export function createCloudinaryAdapter(config: CloudinaryConfig): StorageAdapter {
  cloudinary.config({
    cloud_name: config.cloudName,
    api_key: config.apiKey,
    api_secret: config.apiSecret,
    secure: true,
  });

  return {
    provider: "cloudinary",

    async upload(data, options: StorageUploadOptions): Promise<StorageUploadResult> {
      const result = await uploadBuffer(data, {
        public_id: options.publicId,
        folder: options.folder,
        resource_type: options.resourceType,
        // The identical bytes already collapsed to one `Media` row before
        // `media.ts` ever calls this (its own sha256 dedup) — `overwrite:
        // false` additionally stops a hash collision on `publicId` itself
        // (deliberately deterministic, not random) from silently clobbering
        // an unrelated asset already uploaded under that id.
        overwrite: false,
        unique_filename: false,
      });

      return {
        publicId: result.public_id,
        assetId: result.asset_id,
        secureUrl: result.secure_url,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        format: result.format,
        folder: options.folder,
        resourceType: options.resourceType,
      };
    },

    async delete(publicId, options: StorageDeleteOptions) {
      await cloudinary.uploader.destroy(publicId, { resource_type: options.resourceType });
    },
  };
}
