import { mkdir, readFile, rm, writeFile } from "fs/promises";
import path from "path";

import type { StorageAdapter } from "@/lib/cms/storage/adapter";

/**
 * Files land outside `public/` (`ARCHITECTURE/19_CMS_FOUNDATION.md` §8) so
 * access always goes through the streaming Route Handler
 * (`app/api/media/[...key]/route.ts`) rather than being served directly by
 * the framework's static file handling — the same indirection that lets
 * access be gated or the storage moved behind a CDN later without changing
 * the URL scheme the rest of the app references.
 */
const STORAGE_ROOT = path.join(process.cwd(), "storage", "media");

function resolveKeyPath(key: string): string {
  if (key.length === 0 || key.includes("/") || key.includes("\\") || key.includes("..")) {
    throw new Error(`Invalid storage key: "${key}"`);
  }
  return path.join(STORAGE_ROOT, key);
}

export const localStorageAdapter: StorageAdapter = {
  async write(key, data) {
    await mkdir(STORAGE_ROOT, { recursive: true });
    await writeFile(resolveKeyPath(key), data);
  },

  async read(key) {
    try {
      return await readFile(resolveKeyPath(key));
    } catch {
      return null;
    }
  },

  async delete(key) {
    await rm(resolveKeyPath(key), { force: true });
  },
};
