import { localStorageAdapter } from "@/lib/cms/storage/local-adapter";
import type { StorageAdapter } from "@/lib/cms/storage/adapter";

export type { StorageAdapter };

/**
 * The one place a future S3/Cloudinary/R2 adapter plugs in
 * (`ARCHITECTURE/19_CMS_FOUNDATION.md` §8's "no vendor lock-in"). Local is
 * the only implementation today, matching `08_TECHNICAL_ARCHITECTURE.md`
 * §8's self-hosted deployment model — adding a remote adapter later means
 * writing one new file implementing `StorageAdapter` and returning it here,
 * never touching `lib/cms/media.ts`, any model, or any form field.
 */
export function getStorageAdapter(): StorageAdapter {
  return localStorageAdapter;
}
