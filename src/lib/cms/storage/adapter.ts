/**
 * The one interface every media storage backend implements
 * (`ARCHITECTURE/19_CMS_FOUNDATION.md` §8). `lib/cms/media.ts`'s upload/read
 * pipeline is written against this interface only — swapping the local
 * filesystem implementation for an S3-compatible one later is one new file
 * implementing this shape plus a one-line change in `storage/index.ts`, not a
 * change to any calling code, schema, or `next/image` usage.
 *
 * `key` is always a flat, content-hash-derived filename (see `media.ts`) —
 * never a caller-supplied path — so an adapter never needs to guard against
 * path traversal from user input; it only needs to guard against a
 * programmer error producing a malformed key.
 */
export interface StorageAdapter {
  write(key: string, data: Buffer): Promise<void>;
  read(key: string): Promise<Buffer | null>;
  delete(key: string): Promise<void>;
}
