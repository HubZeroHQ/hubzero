import { createCloudinaryAdapter, getCloudinaryConfig } from "@/lib/cms/storage/cloudinary-adapter";
import { localStorageAdapter } from "@/lib/cms/storage/local-adapter";
import type { StorageAdapter } from "@/lib/cms/storage/adapter";

export type { StorageAdapter };

let cached: StorageAdapter | undefined;

/**
 * The one place a storage backend is chosen (`ARCHITECTURE/19_CMS_FOUNDATION.md`
 * §8's "no vendor lock-in"). Cloudinary is the production default the moment
 * its credentials are present; local disk storage is the graceful fallback
 * whenever they aren't (missing credentials never crash the app — every
 * upload/read/delete path keeps working end to end, just without a real CDN
 * behind it), which is what makes local dev/test work with zero external
 * account setup. Cached across calls within a process for the same reason
 * `lib/db.ts` caches its connection — Cloudinary's `config()` call and adapter
 * construction shouldn't repeat on every request.
 */
export function getStorageAdapter(): StorageAdapter {
  if (cached) return cached;
  const cloudinaryConfig = getCloudinaryConfig();
  cached = cloudinaryConfig ? createCloudinaryAdapter(cloudinaryConfig) : localStorageAdapter;
  return cached;
}

export function isCloudinaryConfigured(): boolean {
  return getCloudinaryConfig() !== null;
}
