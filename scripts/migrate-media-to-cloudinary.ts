import { createHash } from "crypto";
import { readFile } from "fs/promises";
import path from "path";

import { ObjectId } from "mongodb";

import "@/lib/cms/collections";
import { connectToDatabase } from "@/lib/db";
import { getStorageAdapter, isCloudinaryConfigured } from "@/lib/cms/storage";
import { Media } from "@/models/media";

/**
 * One-time migration for a deployment upgrading from the pre-Cloudinary
 * `Media` schema (`key`/`url`/`size`/`variants`, bytes on local disk only) to
 * the current one (`publicId`/`secureUrl`/`bytes`/`format`/`resourceType`,
 * `provider`). Reads each legacy document's bytes off local disk (the only
 * place they ever lived before this migration), uploads them through
 * whichever `StorageAdapter` is active (Cloudinary, if configured — this
 * script's whole purpose; local fallback otherwise, which still normalizes
 * the schema even without a real move), and rewrites the document in place —
 * same `_id`, so every collection field/block referencing it keeps working
 * with no other change anywhere.
 *
 * Idempotent: only touches documents missing `publicId` (the new schema's
 * required field) — safe to re-run, and does nothing on a deployment that
 * has none (a fresh install, or one already migrated).
 *
 * Usage: `npm run migrate-media-to-cloudinary` (set `CLOUDINARY_CLOUD_NAME`/
 * `CLOUDINARY_API_KEY`/`CLOUDINARY_API_SECRET` first — see `.env.example`).
 */

interface LegacyMediaDoc {
  _id: unknown;
  key?: string;
  hash?: string;
  originalName?: string;
  width?: number;
  height?: number;
  publicId?: string;
}

const EXT_RESOURCE_TYPE: Record<string, "image" | "raw"> = {
  jpg: "image",
  jpeg: "image",
  png: "image",
  webp: "image",
  gif: "image",
  pdf: "raw",
};

async function main() {
  await connectToDatabase();

  if (!isCloudinaryConfigured()) {
    console.error(
      "Cloudinary isn't configured (CLOUDINARY_CLOUD_NAME/CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET) — set these first, see .env.example.",
    );
    process.exit(1);
  }

  const collection = Media.collection;
  const legacyDocs = (await collection
    .find({ publicId: { $exists: false } })
    .toArray()) as unknown as LegacyMediaDoc[];

  if (legacyDocs.length === 0) {
    console.log("No legacy media documents found — nothing to migrate.");
    process.exit(0);
  }

  console.log(`Migrating ${legacyDocs.length} legacy media document(s) to Cloudinary…`);

  const storage = getStorageAdapter();
  let migrated = 0;
  let failed = 0;

  for (const doc of legacyDocs) {
    try {
      if (!doc.key) throw new Error("No local storage key on this document.");
      const buffer = await readFile(path.join(process.cwd(), "storage", "media", doc.key));
      const format = doc.key.split(".").pop() ?? "";
      const resourceType = EXT_RESOURCE_TYPE[format] ?? "image";
      const hash = doc.hash ?? createHash("sha256").update(buffer).digest("hex").slice(0, 16);

      const result = await storage.upload(buffer, {
        publicId: hash,
        format,
        resourceType,
        folder: "migrated",
      });

      await collection.updateOne(
        { _id: new ObjectId(String(doc._id)) },
        {
          $set: {
            provider: storage.provider,
            publicId: result.publicId,
            assetId: result.assetId,
            secureUrl: result.secureUrl,
            hash,
            bytes: result.bytes,
            format: result.format,
            resourceType: result.resourceType,
            folder: result.folder,
            width: result.width ?? doc.width,
            height: result.height ?? doc.height,
          },
          $unset: { key: "", url: "", size: "", variants: "" },
        },
      );
      migrated += 1;
      console.log(`  ✓ ${doc.originalName ?? String(doc._id)}`);
    } catch (error) {
      failed += 1;
      console.error(
        `  ✗ ${doc.originalName ?? String(doc._id)}:`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  console.log(`Done — ${migrated} migrated, ${failed} failed.`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
