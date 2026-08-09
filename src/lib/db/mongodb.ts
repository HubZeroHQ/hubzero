import { MongoClient, type Db } from 'mongodb';
import { serverEnv } from '@/lib/env';
import {
  instrumentMongoClient,
  recordMongoClientAcquisition,
  recordMongoConnection,
} from '@/lib/performance/server';

/**
 * Next.js reloads server modules on every change in dev, which would open a
 * new MongoClient (and a new connection pool) on every hot reload. Caching
 * the client on `globalThis` survives module reloads and keeps one pool per
 * process, in dev and in production alike.
 */
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

/**
 * Normal `bom1` clients became ready in under one second during M64/M65.
 * Five seconds leaves substantial headroom for ordinary cold establishment
 * while bounding the independently reproduced 47â€“80 second failure class.
 * This is an application readiness bound, not a pool or driver timeout.
 */
export const MONGO_READINESS_TIMEOUT_MS = 5_000;

export class MongoReadinessTimeoutError extends Error {
  constructor() {
    super('The database did not become ready within the allowed time.');
    this.name = 'MongoReadinessTimeoutError';
  }
}

function connectWithinReadinessBound(client: MongoClient): Promise<MongoClient> {
  const connection = client.connect();

  return new Promise((resolve, reject) => {
    let settled = false;
    const timeout = setTimeout(() => {
      if (settled) return;
      settled = true;

      // `MongoClient.connect()` has no per-call AbortSignal. Closing the
      // client prevents a timed-out attempt from later becoming an orphaned
      // live pool. Do not await close on the request's failure path.
      void client.close().catch(() => undefined);
      reject(new MongoReadinessTimeoutError());
    }, MONGO_READINESS_TIMEOUT_MS);

    connection.then(
      (connectedClient) => {
        if (settled) {
          void connectedClient.close().catch(() => undefined);
          return;
        }
        settled = true;
        clearTimeout(timeout);
        resolve(connectedClient);
      },
      (error: unknown) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        void client.close().catch(() => undefined);
        reject(error);
      },
    );
  });
}

function createClientPromise(): Promise<MongoClient> {
  const connectStartedAt = performance.now();
  const client = new MongoClient(serverEnv().MONGODB_URI, {
    monitorCommands:
      process.env.VERCEL_ENV === 'preview' || process.env.HUBZERO_PERFORMANCE_TELEMETRY === '1',
  });
  instrumentMongoClient(client);
  return connectWithinReadinessBound(client).then(
    (connectedClient) => {
      recordMongoConnection(connectStartedAt, 'ok');
      return connectedClient;
    },
    (error: unknown) => {
      recordMongoConnection(connectStartedAt, 'error', error);
      throw error;
    },
  );
}

/**
 * Connects lazily — importing this module never opens a connection.
 * Only calling `getMongoClient()` or `getDb()` does.
 */
export function getMongoClient(): Promise<MongoClient> {
  const startedAt = performance.now();
  const reusedPromise = Boolean(globalThis._mongoClientPromise);
  if (!globalThis._mongoClientPromise) {
    globalThis._mongoClientPromise = createClientPromise().catch((error: unknown) => {
      // A failed initial connection (DNS hiccup, transient TLS reset) must
      // not stay cached forever — every future call would otherwise reuse
      // this same rejected promise and fail instantly, with no retry, for
      // the lifetime of the process.
      globalThis._mongoClientPromise = undefined;
      throw error;
    });
  }

  return globalThis._mongoClientPromise.then((client) => {
    recordMongoClientAcquisition(performance.now() - startedAt, reusedPromise);
    return client;
  });
}

export async function getDb(): Promise<Db> {
  const client = await getMongoClient();
  return client.db();
}

/**
 * Resolves from the existing process-scoped promise and performs no ping or
 * extra MongoDB command once the client is ready.
 */
export async function ensureMongoReady(): Promise<void> {
  await getMongoClient();
}
