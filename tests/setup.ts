import { readFile } from "fs/promises";
import path from "path";
import mongoose from "mongoose";
import { afterAll, afterEach, beforeAll, vi } from "vitest";

/**
 * Runs once per test file, before that file's own imports execute — this is
 * what makes it safe to set `AUTH_SECRET`/`MONGODB_URI` here and have every
 * test file's `lib/env.ts`/`lib/db.ts` imports see them already set.
 */
// `NODE_ENV` is typed read-only (`@types/node`) and, in practice, already
// set to `"test"` by Vitest itself before this file runs — nothing to do
// here.
process.env.AUTH_SECRET ??= "test-only-secret-at-least-32-characters-long-000000";

// `revalidatePath` (called by `publish()`/`create()`/etc. in
// `crud-actions.ts` for any collection with a real `revalidatesPaths`) only
// works inside an actual Next.js request/build's "static generation store" —
// calling it from a plain Node/Vitest process throws. Every other Next.js+
// Vitest test setup mocks this the same way; it's not something under test.
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

const URI_FILE = path.join(process.cwd(), "tests", ".mongo-uri");

beforeAll(async () => {
  process.env.MONGODB_URI = (await readFile(URI_FILE, "utf8")).trim();
  // Connect eagerly rather than relying on the first `connectToDatabase()`
  // call inside whatever's under test: a test helper that writes directly
  // via a Mongoose model (bypassing `connectToDatabase()`) would otherwise
  // buffer its operation against a connection that's never actually
  // initiated, and time out.
  const { connectToDatabase } = await import("@/lib/db");
  await connectToDatabase();
});

/**
 * Clean slate between tests, not just between files — a test asserting
 * "zero leads exist" shouldn't depend on running before or after a sibling
 * test that created one. Collections are recreated implicitly on next
 * insert, so dropping data (not the collections themselves) is enough and
 * keeps Mongoose's cached indexes valid.
 */
afterEach(async () => {
  if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) return;
  const collections = await mongoose.connection.db.collections();
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
});

afterAll(async () => {
  await mongoose.disconnect();
});
