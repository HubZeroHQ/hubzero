import { MongoClient, type Db } from 'mongodb';
import { serverEnv } from '@/lib/env';

/**
 * Next.js reloads server modules on every change in dev, which would open a
 * new MongoClient (and a new connection pool) on every hot reload. Caching
 * the client on `globalThis` survives module reloads and keeps one pool per
 * process, in dev and in production alike.
 */
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function createClientPromise(): Promise<MongoClient> {
  const client = new MongoClient(serverEnv().MONGODB_URI);
  return client.connect();
}

/**
 * Connects lazily — importing this module never opens a connection.
 * Only calling `getMongoClient()` or `getDb()` does.
 */
export function getMongoClient(): Promise<MongoClient> {
  if (!globalThis._mongoClientPromise) {
    globalThis._mongoClientPromise = createClientPromise();
  }

  return globalThis._mongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getMongoClient();
  return client.db();
}
