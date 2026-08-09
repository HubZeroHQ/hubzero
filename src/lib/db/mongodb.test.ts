import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  connect: vi.fn(),
  close: vi.fn(),
  mongoClient: vi.fn(function MongoClientMock() {
    return { connect: mocks.connect, close: mocks.close };
  }),
  instrumentMongoClient: vi.fn(),
  recordMongoClientAcquisition: vi.fn(),
  recordMongoConnection: vi.fn(),
}));

vi.mock('mongodb', () => ({ MongoClient: mocks.mongoClient }));
vi.mock('@/lib/env', () => ({
  serverEnv: () => ({ MONGODB_URI: 'mongodb://example.invalid/hubzero-test' }),
}));
vi.mock('@/lib/performance/server', () => ({
  instrumentMongoClient: mocks.instrumentMongoClient,
  recordMongoClientAcquisition: mocks.recordMongoClientAcquisition,
  recordMongoConnection: mocks.recordMongoConnection,
}));

describe('MongoDB client lifecycle', () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.resetModules();
    vi.clearAllMocks();
    mocks.close.mockResolvedValue(undefined);
    globalThis._mongoClientPromise = undefined;
  });

  afterEach(() => {
    vi.useRealTimers();
    globalThis._mongoClientPromise = undefined;
  });

  it('reports successful readiness without an extra database command', async () => {
    const connectedClient = { db: vi.fn() };
    mocks.connect.mockResolvedValue(connectedClient);
    const { ensureMongoReady } = await import('./mongodb');

    await expect(ensureMongoReady()).resolves.toBeUndefined();
    await expect(ensureMongoReady()).resolves.toBeUndefined();

    expect(mocks.mongoClient).toHaveBeenCalledTimes(1);
    expect(mocks.connect).toHaveBeenCalledTimes(1);
    expect(connectedClient.db).not.toHaveBeenCalled();
  });

  it('shares one in-flight connection across concurrent callers', async () => {
    const connectedClient = { db: vi.fn() };
    let resolveConnection: ((client: typeof connectedClient) => void) | undefined;
    mocks.connect.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveConnection = resolve;
        }),
    );
    const { getMongoClient } = await import('./mongodb');

    const first = getMongoClient();
    const second = getMongoClient();

    expect(mocks.mongoClient).toHaveBeenCalledTimes(1);
    expect(mocks.connect).toHaveBeenCalledTimes(1);
    resolveConnection?.(connectedClient);

    await expect(first).resolves.toBe(connectedClient);
    await expect(second).resolves.toBe(connectedClient);
    expect(mocks.recordMongoClientAcquisition).toHaveBeenCalledTimes(2);
  });

  it('clears a failed initialization so the next request can retry', async () => {
    const firstFailure = new Error('private TLS detail');
    const connectedClient = { db: vi.fn() };
    mocks.connect.mockRejectedValueOnce(firstFailure).mockResolvedValueOnce(connectedClient);
    const { getMongoClient } = await import('./mongodb');

    await expect(getMongoClient()).rejects.toBe(firstFailure);
    expect(globalThis._mongoClientPromise).toBeUndefined();
    await expect(getMongoClient()).resolves.toBe(connectedClient);

    expect(mocks.mongoClient).toHaveBeenCalledTimes(2);
    expect(mocks.connect).toHaveBeenCalledTimes(2);
    expect(mocks.close).toHaveBeenCalledTimes(1);
    expect(mocks.recordMongoConnection).toHaveBeenNthCalledWith(
      1,
      expect.any(Number),
      'error',
      firstFailure,
    );
    expect(mocks.recordMongoConnection).toHaveBeenNthCalledWith(2, expect.any(Number), 'ok');
  });

  it('bounds a stalled initialization and clears it for a later retry', async () => {
    vi.useFakeTimers();
    const connectedClient = { db: vi.fn() };
    mocks.connect
      .mockImplementationOnce(() => new Promise(() => undefined))
      .mockResolvedValueOnce(connectedClient);
    const { getMongoClient, MONGO_READINESS_TIMEOUT_MS, MongoReadinessTimeoutError } =
      await import('./mongodb');

    const timedOutClient = getMongoClient();
    const timedOutExpectation = expect(timedOutClient).rejects.toBeInstanceOf(
      MongoReadinessTimeoutError,
    );
    await vi.advanceTimersByTimeAsync(MONGO_READINESS_TIMEOUT_MS);
    await timedOutExpectation;

    expect(globalThis._mongoClientPromise).toBeUndefined();
    expect(mocks.close).toHaveBeenCalledTimes(1);
    await expect(getMongoClient()).resolves.toBe(connectedClient);
    expect(mocks.mongoClient).toHaveBeenCalledTimes(2);
    expect(mocks.connect).toHaveBeenCalledTimes(2);
  });
});
