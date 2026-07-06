import { mkdir, readFile, rm, writeFile } from "fs/promises";
import path from "path";

import sharp from "sharp";

import type {
  StorageAdapter,
  StorageDeleteOptions,
  StorageUploadOptions,
  StorageUploadResult,
} from "@/lib/cms/storage/adapter";

/**
 * The graceful-degradation backend used whenever Cloudinary isn't configured
 * (`storage/index.ts`) — dev/test environments work fully offline, with no
 * external account required. Files land outside `public/` so access always
 * goes through the streaming Route Handler (`app/api/media/[...key]/route.ts`)
 * rather than being served directly by the framework's static file handling.
 *
 * Deliberately no resize/variant pipeline here (that was removed along with
 * Sharp-based variant generation, `ARCHITECTURE/19_CMS_FOUNDATION.md` §8) —
 * `sharp` is used only to read `width`/`height` metadata off the original
 * bytes so local uploads carry the same shape Cloudinary's upload response
 * provides, never to re-encode or resize.
 */
const STORAGE_ROOT = path.join(process.cwd(), "storage", "media");

function resolveKeyPath(key: string): string {
  if (key.length === 0 || key.includes("/") || key.includes("\\") || key.includes("..")) {
    throw new Error(`Invalid storage key: "${key}"`);
  }
  return path.join(STORAGE_ROOT, key);
}

async function probeDimensions(
  data: Buffer,
  resourceType: string,
): Promise<{ width?: number; height?: number }> {
  if (resourceType !== "image") return {};
  try {
    const metadata = await sharp(data).metadata();
    return { width: metadata.width, height: metadata.height };
  } catch {
    // Not every "image" mime type sharp can decode (shouldn't happen given
    // `media.ts`'s allow-list, but a corrupt file is a real possibility) —
    // dimensions are optional everywhere they're consumed, so degrade
    // quietly rather than failing the whole upload.
    return {};
  }
}

/**
 * `read()` isn't part of the shared `StorageAdapter` interface — serving
 * bytes back out is Cloudinary's job for every asset stored there (direct
 * CDN delivery via `secureUrl`), so the generic upload/delete pipeline in
 * `media.ts` never needs it. It exists here only for
 * `app/api/media/[...key]/route.ts`, the local-only fallback streaming
 * route, which imports `localStorageAdapter` directly rather than going
 * through `getStorageAdapter()` — that route is inherently local-storage
 * infrastructure, not a generic media-serving path.
 */
export const localStorageAdapter = {
  provider: "local" as const,

  async upload(data: Buffer, options: StorageUploadOptions): Promise<StorageUploadResult> {
    const key = `${options.publicId}.${options.format}`;
    await mkdir(STORAGE_ROOT, { recursive: true });
    await writeFile(resolveKeyPath(key), data);
    const { width, height } = await probeDimensions(data, options.resourceType);

    return {
      publicId: options.publicId,
      secureUrl: `/api/media/${key}`,
      width,
      height,
      bytes: data.byteLength,
      format: options.format,
      folder: options.folder,
      resourceType: options.resourceType,
    };
  },

  async delete(publicId: string, options: StorageDeleteOptions) {
    await rm(resolveKeyPath(`${publicId}.${options.format}`), { force: true });
  },

  async read(key: string): Promise<Buffer | null> {
    try {
      return await readFile(resolveKeyPath(key));
    } catch {
      return null;
    }
  },
} satisfies StorageAdapter & { read(key: string): Promise<Buffer | null> };
