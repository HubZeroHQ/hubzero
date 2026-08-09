import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getMongoClientMock, mongoAdapterMock, nextAuthMock } = vi.hoisted(() => ({
  getMongoClientMock: vi.fn(),
  mongoAdapterMock: vi.fn(() => ({ type: 'mongodb-adapter' })),
  nextAuthMock: vi.fn(() => ({
    handlers: {},
    auth: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
  })),
}));

vi.mock('@auth/mongodb-adapter', () => ({
  MongoDBAdapter: mongoAdapterMock,
}));

vi.mock('next-auth', () => ({
  default: nextAuthMock,
}));

vi.mock('@/lib/db/mongodb', () => ({
  getMongoClient: getMongoClientMock,
}));

vi.mock('@/lib/env', () => ({
  serverEnv: () => ({ AUTH_SECRET: 'test-secret' }),
}));

vi.mock('./config', () => ({ authConfig: {} }));
vi.mock('./providers/credentials', () => ({ credentialsProvider: {} }));

describe('Studio Auth.js MongoDB adapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('receives the retry-safe client factory instead of a fixed initialization promise', async () => {
    await import('./index');

    expect(mongoAdapterMock).toHaveBeenCalledWith(getMongoClientMock);
    expect(getMongoClientMock).not.toHaveBeenCalled();
  });
});
