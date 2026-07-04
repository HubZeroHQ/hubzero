import mongoose from "mongoose";

/**
 * Cached across dev hot-reloads and warm serverless invocations, per the
 * standard Next.js + Mongoose pattern — without this, every Server Action
 * call would open a new connection. Read lazily inside `connectToDatabase`
 * rather than validated at module load (see `src/lib/env.ts`) so pages that
 * don't touch the database still build and typecheck without a live
 * `MONGODB_URI` configured.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var _mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global._mongooseCache ?? { conn: null, promise: null };
global._mongooseCache = cache;

export async function connectToDatabase() {
  if (cache.conn) return cache.conn;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set — see .env.example.");
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(uri);
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
