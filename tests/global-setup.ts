import { writeFile, mkdir, rm } from "fs/promises";
import path from "path";
import { MongoMemoryServer } from "mongodb-memory-server";

/**
 * Runs once for the entire Vitest run, in its own process — starts a real,
 * self-contained MongoDB instance (`mongodb-memory-server`) so the suite
 * needs no external database, in CI or locally. The connection URI is
 * written to a temp file rather than `process.env` directly: Vitest's
 * `globalSetup` runs in a separate process from the test workers, and
 * `tests/setup.ts` (a `setupFiles` entry, one per worker) reads it back.
 */
const URI_FILE = path.join(process.cwd(), "tests", ".mongo-uri");

export async function setup() {
  const mongod = await MongoMemoryServer.create({ instance: { dbName: "hubzero-test" } });
  await mkdir(path.dirname(URI_FILE), { recursive: true });
  await writeFile(URI_FILE, mongod.getUri());

  return async function teardown() {
    await mongod.stop();
    await rm(URI_FILE, { force: true });
  };
}
